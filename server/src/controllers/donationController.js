import { Donation } from '../models/Donation.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { screenDonationSafety } from '../services/safetyService.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { DONATION_STATUS, validateDonationTransition } from '../utils/stateMachines.js';
import { recordAuditLog } from '../services/auditService.js';

export async function createDonation(req, res, next) {
  try {
    const {
      foodName,
      category,
      dietType,
      quantity,
      unit,
      estimatedMeals,
      preparationDateTime,
      storageMethod,
      packagingType,
      pickupDeadline,
      pickupLocation,
      notes,
      images,
      isDraft,
    } = req.body;

    const donorProfile = await DonorProfile.findOne({ userId: req.user._id });

    const donation = new Donation({
      donorId: req.user._id,
      donorProfileId: donorProfile?._id,
      foodName,
      category,
      dietType: dietType || 'VEG',
      quantity: Number(quantity),
      unit: unit || 'meals',
      estimatedMeals: Number(estimatedMeals || quantity),
      preparationDateTime: new Date(preparationDateTime),
      storageMethod: storageMethod || 'ambient',
      packagingType: packagingType || 'Food Grade Foil / Box',
      pickupDeadline: new Date(pickupDeadline),
      pickupLocation: pickupLocation || {
        type: 'Point',
        coordinates: donorProfile?.location?.coordinates || [75.8577, 22.7196],
        address: donorProfile?.address || {},
      },
      notes: notes || '',
      images: images || [],
      status: isDraft ? DONATION_STATUS.DRAFT : DONATION_STATUS.SUBMITTED,
    });
    await donation.save();

    await recordAuditLog({
      entityType: 'DONATION',
      entityId: donation._id,
      action: isDraft ? 'DONATION_DRAFT_CREATED' : 'DONATION_SUBMITTED',
      performedBy: req.user._id,
      performedByRole: req.user.role,
      newState: { status: donation.status, meals: donation.estimatedMeals },
      details: `Created donation: ${donation.foodName} (${donation.estimatedMeals} meals).`,
    });

    let screeningResult = null;
    if (!isDraft) {
      // Auto-trigger safety screening pipeline
      screeningResult = await screenDonationSafety(donation._id, req.user._id);
    }

    res.status(201).json({
      success: true,
      data: {
        donation: screeningResult ? screeningResult.donation : donation,
        assessment: screeningResult ? screeningResult.assessment : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function screenDonation(req, res, next) {
  try {
    const { id } = req.params;
    const result = await screenDonationSafety(id, req.user._id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonations(req, res, next) {
  try {
    const { status, riskLevel, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Donors only see their own donations unless ADMIN
    if (req.user.role === 'DONOR') {
      filter.donorId = req.user._id;
    } else if (req.user.role === 'RECEIVER') {
      // Receivers see verified/matched/active donations
      if (status) {
        filter.status = status;
      } else {
        filter.status = { $in: ['VERIFIED', 'MATCHED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'] };
      }
    } else if (status) {
      filter.status = status;
    }

    if (riskLevel) {
      filter.riskLevel = riskLevel;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donorId', 'name email phone')
        .populate('safetyAssessmentId')
        .populate('matchedReceiverId', 'name email')
        .populate('assignedPartnerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Donation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getDonationById(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email phone')
      .populate('safetyAssessmentId')
      .populate('matchedReceiverId', 'name email phone')
      .populate('assignedPartnerId', 'name email phone')
      .populate('activeDeliveryId');

    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    const auditTrail = await AuditLog.find({ entityId: donation._id })
      .populate('performedBy', 'name role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        donation,
        auditTrail,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelDonation(req, res, next) {
  try {
    const { reason } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new NotFoundError('Donation not found');

    if (req.user.role !== 'ADMIN' && donation.donorId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Not authorized to cancel this donation');
    }

    validateDonationTransition(donation.status, DONATION_STATUS.CANCELLED);

    donation.status = DONATION_STATUS.CANCELLED;
    donation.cancellationReason = reason || 'Cancelled by donor';
    await donation.save();

    await recordAuditLog({
      entityType: 'DONATION',
      entityId: donation._id,
      action: 'DONATION_CANCELLED',
      performedBy: req.user._id,
      performedByRole: req.user.role,
      details: reason,
    });

    res.json({ success: true, data: donation });
  } catch (err) {
    next(err);
  }
}
