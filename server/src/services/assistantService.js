import { Donation } from '../models/Donation.js';
import { Requirement } from '../models/Requirement.js';
import { Delivery } from '../models/Delivery.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { recordAuditLog } from './auditService.js';

export async function processAssistantMessage({ user, message, context = {} }) {
  const role = user.role;
  const lowerMsg = message.toLowerCase().trim();

  // If external LLM key is configured, could invoke external LLM with tool definitions.
  // Otherwise, fallback to the deterministic intent parser with the same tool interface and label it as "basic mode".
  const isLLMAvailable = Boolean(config.LLM_API_KEY && config.LLM_PROVIDER !== 'mock');
  const modeLabel = isLLMAvailable ? 'LLM-enhanced' : 'deterministic basic-mode';

  logger.info(`Assistant processing query from ${user.name} (${role}) in ${modeLabel}: "${message}"`);

  let responseText = '';
  let toolCall = null;
  let requiresConfirmation = false;
  let proposedAction = null;

  if (role === 'DONOR') {
    // 1. Check if user wants to donate food
    // e.g. "I have 100 food packets", "Donate 50 meals"
    const quantityMatch = message.match(/(\d+)\s*(meals?|packets?|kg|boxes|plates)?/i);
    if (lowerMsg.includes('donate') || lowerMsg.includes('have') || lowerMsg.includes('surplus') || lowerMsg.includes('food')) {
      const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 50;
      const unit = quantityMatch && quantityMatch[2] ? quantityMatch[2].toLowerCase() : 'meals';
      const foodName = message.replace(/(\d+)|meals?|packets?|donate|i have|surplus/gi, '').trim() || 'Prepared Hot Meals';

      toolCall = {
        toolName: 'createDraftDonation',
        params: {
          foodName,
          quantity,
          unit,
          estimatedMeals: quantity,
          category: 'cookedMeal',
          dietType: lowerMsg.includes('non') ? 'NON_VEG' : 'VEG',
          storageMethod: 'ambient',
          preparationDateTime: new Date(),
          pickupDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4 hours
        },
      };
      requiresConfirmation = true;
      proposedAction = {
        action: 'CONFIRM_DRAFT_DONATION',
        data: toolCall.params,
      };
      responseText = `I can help you prepare a donation listing for **${quantity} ${unit}** of **${foodName}**. For safety screening, please confirm or edit the draft parameters below.`;
    } else if (lowerMsg.includes('status') || lowerMsg.includes('my donation') || lowerMsg.includes('track')) {
      const recentDonation = await Donation.findOne({ donorId: user._id }).sort({ createdAt: -1 });
      if (recentDonation) {
        responseText = `Your most recent donation of **${recentDonation.foodName}** (${recentDonation.estimatedMeals} meals) is currently in status: **${recentDonation.status}** with risk screening: **${recentDonation.riskLevel}**.`;
      } else {
        responseText = `You don't have any active donations yet. Would you like to create one now?`;
      }
    } else {
      responseText = `Hello ${user.name}! I am AnnSarthi's AI Assistant. As a donor, you can tell me things like:
- *"I have 80 packets of vegetable biryani to donate"*
- *"Check status of my latest donation"*
- *"What are the packaging guidelines for cooked food?"*`;
    }
  } else if (role === 'RECEIVER') {
    // e.g. "I need 80 vegetarian meals", "Request 100 packets"
    const reqMatch = message.match(/(\d+)\s*(meals?|packets?|servings)?/i);
    if (lowerMsg.includes('need') || lowerMsg.includes('request') || lowerMsg.includes('require')) {
      const targetMeals = reqMatch ? parseInt(reqMatch[1], 10) : 60;
      toolCall = {
        toolName: 'createDraftRequirement',
        params: {
          targetMeals,
          dietType: lowerMsg.includes('non') ? 'NON_VEG' : 'VEG',
          foodCategory: 'cookedMeal',
          requiredBy: new Date(Date.now() + 3 * 60 * 60 * 1000),
          urgency: lowerMsg.includes('urgent') ? 'HIGH' : 'MEDIUM',
        },
      };
      requiresConfirmation = true;
      proposedAction = {
        action: 'CONFIRM_DRAFT_REQUIREMENT',
        data: toolCall.params,
      };
      responseText = `I have drafted a food requirement for **${targetMeals} meals** (${toolCall.params.dietType}). Please review and click Confirm to post it to the ecosystem.`;
    } else if (lowerMsg.includes('matches') || lowerMsg.includes('available food') || lowerMsg.includes('donations')) {
      const availableDonations = await Donation.find({ status: 'VERIFIED' }).limit(3);
      if (availableDonations.length > 0) {
        responseText = `There are currently **${availableDonations.length} verified donations** ready for matching near your area:
${availableDonations.map((d, i) => `${i + 1}. **${d.foodName}** (${d.estimatedMeals} meals, ${d.category})`).join('\n')}`;
      } else {
        responseText = `There are no verified donations awaiting match right now. I will notify you the moment fresh surplus is screened and verified!`;
      }
    } else {
      responseText = `Hello! As an NGO/Receiver partner, you can ask me to:
- *"I need 120 vegetarian meals before 8 PM"*
- *"Show available verified food nearby"*
- *"Track incoming food deliveries"*`;
    }
  } else if (role === 'DELIVERY_PARTNER') {
    if (lowerMsg.includes('urgent') || lowerMsg.includes('pickup') || lowerMsg.includes('available') || lowerMsg.includes('requests')) {
      const availableDeliveries = await Delivery.find({ status: 'AVAILABLE' })
        .populate('donationId', 'foodName estimatedMeals')
        .limit(3);
      if (availableDeliveries.length > 0) {
        responseText = `Found **${availableDeliveries.length} available pickup requests** in your zone:
${availableDeliveries.map((del, i) => `${i + 1}. **${del.donationId?.foodName || 'Meals'}** (${del.donationId?.estimatedMeals} meals) — ${del.distanceKm.toFixed(1)} km away`).join('\n')}`;
      } else {
        responseText = `No pending pickup requests at this exact moment. Stay tuned on your dashboard!`;
      }
    } else {
      responseText = `Hello Delivery Partner! You can ask me:
- *"Show me available pickups nearby"*
- *"What is my active route?"*
- *"Help me report a packaging concern"*`;
    }
  } else {
    // Admin role
    responseText = `Admin Assistant active. You can ask for summary metrics, flagged safety reviews, or pending partner verifications.`;
  }

  // Audit log of assistant tool usage
  if (toolCall) {
    await recordAuditLog({
      entityType: 'USER',
      entityId: user._id,
      action: 'ASSISTANT_TOOL_INVOKED',
      performedBy: user._id,
      performedByRole: role,
      details: `Assistant parsed intent: ${toolCall.toolName}`,
      metadata: { toolName: toolCall.toolName, requiresConfirmation },
    });
  }

  return {
    reply: responseText,
    mode: modeLabel,
    toolCall,
    requiresConfirmation,
    proposedAction,
    timestamp: new Date().toISOString(),
  };
}
