import { Donation } from '../models/Donation.js';
import { Requirement } from '../models/Requirement.js';
import { ReceiverProfile } from '../models/ReceiverProfile.js';
import { DeliveryPartnerProfile } from '../models/DeliveryPartnerProfile.js';
import { Match } from '../models/Match.js';
import { calculateHaversineDistanceKm } from '../utils/geo.js';
import { recordAuditLog } from './auditService.js';
import { sendNotification } from './notificationService.js';
import { DONATION_STATUS } from '../utils/stateMachines.js';

/**
 * Find and rank eligible receivers / requirements for a VERIFIED donation
 */
export async function findMatchesForDonation(donationId) {
  const donation = await Donation.findById(donationId).populate('donorId', 'name email');
  if (!donation) return [];

  // Only VERIFIED donations can enter matching
  if (donation.status !== DONATION_STATUS.VERIFIED && donation.status !== DONATION_STATUS.MATCHED) {
    return [];
  }

  // Find all verified receiver profiles
  const receivers = await ReceiverProfile.find({}).populate('userId', 'name email status');

  const matches = [];

  for (const receiver of receivers) {
    if (!receiver.userId || receiver.userId.status !== 'ACTIVE') continue;

    const receiverCoords = receiver.location.coordinates;
    const donationCoords = donation.pickupLocation.coordinates;
    const distanceKm = calculateHaversineDistanceKm(donationCoords, receiverCoords);

    // Skip if beyond practical local distribution radius (25 km)
    if (distanceKm > 25) continue;

    // Check open requirements for this receiver
    const openReq = await Requirement.findOne({
      receiverId: receiver.userId._id,
      status: 'OPEN',
    });

    // 1. Food Type Score (0 to 100)
    let foodTypeScore = 80;
    if (openReq) {
      if (openReq.foodCategory === 'any' || openReq.foodCategory === donation.category) {
        foodTypeScore = 100;
      } else {
        foodTypeScore = 50;
      }
      if (openReq.dietType !== 'ANY' && openReq.dietType !== donation.dietType) {
        foodTypeScore = Math.max(0, foodTypeScore - 40);
      }
    } else {
      foodTypeScore = 85;
    }

    // 2. Quantity Fit Score (0 to 100)
    let quantityFitScore = 85;
    const targetCapacity = openReq ? openReq.targetMeals : receiver.dailyMealCapacity;
    const ratio = donation.estimatedMeals / targetCapacity;
    if (ratio >= 0.5 && ratio <= 1.5) {
      quantityFitScore = 100;
    } else if (ratio < 0.5) {
      quantityFitScore = Math.max(50, Math.round(ratio * 200));
    } else {
      quantityFitScore = Math.max(60, Math.round(100 - (ratio - 1.5) * 30));
    }

    // 3. Distance Score (0 to 100): closer is better
    const distanceScore = Math.max(20, Math.round(Math.max(0, 100 - distanceKm * 4)));

    // 4. Time Window Feasibility Score (0 to 100)
    const now = new Date();
    const deadline = new Date(donation.pickupDeadline);
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);
    let timeWindowScore = 90;
    if (hoursLeft < 1) {
      timeWindowScore = 50;
    } else if (hoursLeft > 3) {
      timeWindowScore = 100;
    }

    // 5. Capacity Score (0 to 100)
    const capacityScore = receiver.dailyMealCapacity >= donation.estimatedMeals ? 100 : 75;

    // Weighted Overall Score
    // Weights: Food Type 25%, Quantity 25%, Distance 30%, Time 10%, Capacity 10%
    const compositeScore = Math.round(
      foodTypeScore * 0.25 +
        quantityFitScore * 0.25 +
        distanceScore * 0.3 +
        timeWindowScore * 0.1 +
        capacityScore * 0.1
    );

    const explanationText = `${compositeScore}% match: Distance ${distanceKm.toFixed(1)} km (${distanceScore}%), Food type compatibility (${foodTypeScore}%), Quantity fit (${quantityFitScore}%), Window feasibility (${timeWindowScore}%).`;

    // Upsert Match record
    const match = await Match.findOneAndUpdate(
      { donationId: donation._id, receiverId: receiver.userId._id },
      {
        donationId: donation._id,
        receiverId: receiver.userId._id,
        requirementId: openReq ? openReq._id : null,
        matchScore: compositeScore,
        factorBreakdown: {
          foodTypeScore,
          quantityFitScore,
          distanceScore,
          distanceKm,
          timeWindowScore,
          capacityScore,
          urgencyBonus: openReq && openReq.urgency === 'HIGH' ? 10 : 0,
        },
        explanationText,
        method: 'rule-based',
        status: 'PROPOSED',
      },
      { upsert: true, new: true }
    ).populate('receiverId', 'name email phone');

    matches.push(match);
  }

  // Sort by highest match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

/**
 * Recommend Delivery Partners for a donation pickup & delivery
 */
export async function rankDeliveryPartners(donationId, receiverCoords) {
  const donation = await Donation.findById(donationId);
  if (!donation) return [];

  const pickupCoords = donation.pickupLocation.coordinates;
  const partners = await DeliveryPartnerProfile.find({
    isAvailable: true,
  }).populate('userId', 'name email phone avatar');

  const scoredPartners = [];

  for (const partner of partners) {
    if (!partner.userId) continue;

    const partnerCoords = partner.currentLocation.coordinates;
    const distToPickupKm = calculateHaversineDistanceKm(partnerCoords, pickupCoords);

    // Capacity score: whether partner vehicle can hold the donation
    const estWeightKg = donation.quantity; // approximate kg
    const capacityFit = partner.maxCapacityKg >= estWeightKg;

    // Proximity score
    const proximityScore = Math.max(10, Math.round(100 - distToPickupKm * 8));
    const ratingScore = Math.round((partner.rating / 5) * 100);

    const overallScore = Math.round(
      proximityScore * 0.5 + ratingScore * 0.3 + (capacityFit ? 20 : 0)
    );

    scoredPartners.push({
      partner,
      distToPickupKm,
      proximityScore,
      ratingScore,
      capacityFit,
      overallScore,
      explanation: `Ranked #${scoredPartners.length + 1}: ${distToPickupKm.toFixed(1)} km away, ${partner.vehicleType} (${partner.maxCapacityKg}kg capacity), Rating: ${partner.rating}⭐.`,
    });
  }

  scoredPartners.sort((a, b) => b.overallScore - a.overallScore);
  return scoredPartners;
}
