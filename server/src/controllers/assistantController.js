import { processAssistantMessage } from '../services/assistantService.js';
import { createDonation } from './donationController.js';
import { createRequirement } from './matchingController.js';
import { ValidationError } from '../utils/errors.js';

export async function chatWithAssistant(req, res, next) {
  try {
    const { message, context } = req.body;
    if (!message) {
      throw new ValidationError('Message content is required');
    }

    const response = await processAssistantMessage({
      user: req.user,
      message,
      context,
    });

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function executeTool(req, res, next) {
  try {
    const { action, payload } = req.body;
    if (!action || !payload) {
      throw new ValidationError('Action and payload required for execution');
    }

    // Role-gated tool execution requiring explicit user confirmation
    if (action === 'CONFIRM_DRAFT_DONATION') {
      if (req.user.role !== 'DONOR') throw new ValidationError('Only donors can execute this tool');
      req.body = { ...payload, isDraft: false };
      return createDonation(req, res, next);
    } else if (action === 'CONFIRM_DRAFT_REQUIREMENT') {
      if (req.user.role !== 'RECEIVER') throw new ValidationError('Only receivers can execute this tool');
      req.body = payload;
      return createRequirement(req, res, next);
    }

    throw new ValidationError(`Unknown action: ${action}`);
  } catch (err) {
    next(err);
  }
}
