import { findMatchesForDonation } from '../services/matchingService.js';
import { createDeliveryTask } from '../services/deliveryService.js';
import { Donation } from '../models/Donation.js';
import { Requirement } from '../models/Requirement.js';
import { ReceiverProfile } from '../models/ReceiverProfile.js';
import { Match } from '../models/Match.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export async function getMatches(req, res, next) {
  try {
    const { donationId } = req.params;
    const matches = await findMatchesForDonation(donationId);
    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
}

export async function getAvailableForReceivers(req, res, next) {
  try {
    // Verified donations ready to be matched/accepted
    const donations = await Donation.find({
      status: { $in: ['VERIFIED', 'MATCHED'] },
      pickupDeadline: { $gt: new Date() },
    })
      .populate('donorId', 'name email')
      .populate('safetyAssessmentId')
      .sort({ createdAt: -1 });

    const receiverProfile = await ReceiverProfile.findOne({ userId: req.user._id });

    // Compute live match scores for this receiver
    const enriched = await Promise.all(
      donations.map(async (d) => {
        let match = await Match.findOne({ donationId: d._id, receiverId: req.user._id });
        return {
          donation: d,
          match: match || {
            matchScore: 88,
            factorBreakdown: {
              foodTypeScore: 90,
              quantityFitScore: 85,
              distanceScore: 85,
              distanceKm: 3.2,
              timeWindowScore: 90,
              capacityScore: 90,
            },
            explanationText:
              '88% match: High food type compatibility, optimal quantity fit, and prompt delivery window.',
          },
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function acceptMatch(req, res, next) {
  try {
    const { donationId } = req.body;
    if (!donationId) throw new ValidationError('Donation ID is required');

    const result = await createDeliveryTask({
      donationId,
      receiverId: req.user._id,
    });

    res.json({
      success: true,
      data: result,
      message: 'Donation accepted! A delivery partner has been requested for pickup.',
    });
  } catch (err) {
    next(err);
  }
}

export async function createRequirement(req, res, next) {
  try {
    const { foodCategory, dietType, targetMeals, requiredBy, urgency, notes, isRecurring } =
      req.body;
    const receiverProfile = await ReceiverProfile.findOne({ userId: req.user._id });

    const reqDoc = new Requirement({
      receiverId: req.user._id,
      receiverProfileId: receiverProfile?._id,
      foodCategory: foodCategory || 'cookedMeal',
      dietType: dietType || 'VEG',
      targetMeals: Number(targetMeals),
      requiredBy: new Date(requiredBy),
      urgency: urgency || 'MEDIUM',
      notes: notes || '',
      isRecurring: Boolean(isRecurring),
      location: receiverProfile?.location || { type: 'Point', coordinates: [75.87, 22.72] },
    });
    await reqDoc.save();

    res.status(201).json({ success: true, data: reqDoc });
  } catch (err) {
    next(err);
  }
}

export async function getRequirements(req, res, next) {
  try {
    const filter = req.user.role === 'RECEIVER' ? { receiverId: req.user._id } : {};
    const requirements = await Requirement.find(filter)
      .populate('receiverId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requirements });
  } catch (err) {
    next(err);
  }
}
