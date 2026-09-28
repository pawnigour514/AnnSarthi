import { Delivery } from '../models/Delivery.js';
import { Donation } from '../models/Donation.js';
import { Report } from '../models/Report.js';
import { DeliveryPartnerProfile } from '../models/DeliveryPartnerProfile.js';
import {
  acceptDelivery as acceptDeliveryService,
  confirmPickup as confirmPickupService,
  confirmDelivery as confirmDeliveryService,
} from '../services/deliveryService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { sendNotification } from '../services/notificationService.js';
import { recordAuditLog } from '../services/auditService.js';

export async function getAvailableDeliveries(req, res, next) {
  try {
    const deliveries = await Delivery.find({ status: 'AVAILABLE' })
      .populate({
        path: 'donationId',
        select: 'foodName category dietType quantity unit estimatedMeals pickupDeadline pickupLocation',
      })
      .populate('receiverId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: deliveries });
  } catch (err) {
    next(err);
  }
}

export async function getMyDeliveries(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'DELIVERY_PARTNER') {
      filter.partnerId = req.user._id;
    } else if (req.user.role === 'RECEIVER') {
      filter.receiverId = req.user._id;
    }

    const deliveries = await Delivery.find(filter)
      .populate('donationId')
      .populate('receiverId', 'name phone')
      .populate('partnerId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: deliveries });
  } catch (err) {
    next(err);
  }
}

export async function getActiveDelivery(req, res, next) {
  try {
    const delivery = await Delivery.findOne({
      partnerId: req.user._id,
      status: { $in: ['ACCEPTED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'] },
    })
      .populate('donationId')
      .populate('receiverId', 'name phone');

    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function getDeliveryById(req, res, next) {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('donationId')
      .populate('receiverId', 'name phone')
      .populate('partnerId', 'name phone');

    if (!delivery) throw new NotFoundError('Delivery not found');

    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function acceptDelivery(req, res, next) {
  try {
    const delivery = await acceptDeliveryService(req.params.id, req.user._id);
    res.json({ success: true, data: delivery });
  } catch (err) {
    next(err);
  }
}

export async function confirmPickup(req, res, next) {
  try {
    const { otp, photoUrl, currentCoords } = req.body;
    if (!otp) throw new ValidationError('Pickup OTP is required.');

    const delivery = await confirmPickupService(req.params.id, req.user._id, {
      otp,
      photoUrl,
      currentCoords,
    });

    res.json({ success: true, data: delivery, message: 'Pickup confirmed! Food is now in transit.' });
  } catch (err) {
    next(err);
  }
}

export async function confirmDelivery(req, res, next) {
  try {
    const { otp, signatureDataUrl, photoUrl, quantityReceivedMeals, conditionConfirmed, currentCoords } =
      req.body;
    if (!otp) throw new ValidationError('Delivery OTP is required.');

    const result = await confirmDeliveryService(req.params.id, req.user._id, {
      otp,
      signatureDataUrl,
      photoUrl,
      quantityReceivedMeals,
      conditionConfirmed,
      currentCoords,
    });

    res.json({
      success: true,
      data: result,
      message: 'Delivery successfully confirmed! Impact metrics have been updated.',
    });
  } catch (err) {
    next(err);
  }
}

export async function reportIssue(req, res, next) {
  try {
    const { id } = req.params; // deliveryId
    const { issueCategory, description, photoUrl } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) throw new NotFoundError('Delivery not found');

    const report = new Report({
      reporterId: req.user._id,
      reporterRole: req.user.role,
      entityType: 'DELIVERY',
      entityId: delivery._id,
      issueCategory,
      description,
      photoUrl: photoUrl || '',
    });
    await report.save();

    await recordAuditLog({
      entityType: 'REPORT',
      entityId: report._id,
      action: 'DELIVERY_ISSUE_REPORTED',
      performedBy: req.user._id,
      performedByRole: req.user.role,
      details: `${issueCategory}: ${description}`,
    });

    // Notify admins
    await sendNotification({
      role: 'ADMIN',
      title: 'Incident Reported on Delivery',
      message: `${req.user.name} reported issue: ${issueCategory} on delivery #${id}`,
      type: 'FRAUD_ALERT',
      link: '/admin/reports',
    });

    res.status(201).json({ success: true, data: report, message: 'Issue reported to operations team.' });
  } catch (err) {
    next(err);
  }
}
