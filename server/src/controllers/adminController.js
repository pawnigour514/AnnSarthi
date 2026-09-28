import { User } from '../models/User.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { ReceiverProfile } from '../models/ReceiverProfile.js';
import { DeliveryPartnerProfile } from '../models/DeliveryPartnerProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { Report } from '../models/Report.js';
import { Donation } from '../models/Donation.js';
import { Delivery } from '../models/Delivery.js';
import { recordAuditLog } from '../services/auditService.js';
import { sendNotification } from '../services/notificationService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export async function getPendingVerifications(req, res, next) {
  try {
    const pendingUsers = await User.find({ verificationStatus: 'PENDING' }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      pendingUsers.map(async (u) => {
        let profile = null;
        if (u.role === 'DONOR') profile = await DonorProfile.findOne({ userId: u._id });
        if (u.role === 'RECEIVER') profile = await ReceiverProfile.findOne({ userId: u._id });
        if (u.role === 'DELIVERY_PARTNER') profile = await DeliveryPartnerProfile.findOne({ userId: u._id });
        return { user: u, profile };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
}

export async function handleVerificationDecision(req, res, next) {
  try {
    const { userId } = req.params;
    const { decision, reason } = req.body; // 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(decision)) {
      throw new ValidationError('Invalid verification decision');
    }

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    user.verificationStatus = decision;
    await user.save();

    if (user.role === 'DONOR') {
      await DonorProfile.findOneAndUpdate({ userId: user._id }, { verifiedByAdmin: decision === 'VERIFIED' });
    } else if (user.role === 'RECEIVER') {
      await ReceiverProfile.findOneAndUpdate({ userId: user._id }, { verifiedByAdmin: decision === 'VERIFIED' });
    } else if (user.role === 'DELIVERY_PARTNER') {
      await DeliveryPartnerProfile.findOneAndUpdate(
        { userId: user._id },
        { verifiedByAdmin: decision === 'VERIFIED' }
      );
    }

    await recordAuditLog({
      entityType: 'USER',
      entityId: user._id,
      action: `USER_VERIFICATION_${decision}`,
      performedBy: req.user._id,
      performedByRole: 'ADMIN',
      details: reason || 'Reviewed by admin in verification center',
    });

    await sendNotification({
      userId: user._id,
      role: user.role,
      title: decision === 'VERIFIED' ? 'Account Verified!' : 'Verification Update',
      message:
        decision === 'VERIFIED'
          ? 'Your organization has been successfully verified! You now have full access.'
          : `Verification rejected: ${reason || 'Incomplete registration documents.'}`,
      type: 'SYSTEM',
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { entityType, entityId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('performedBy', 'name role email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: { page: parseInt(page, 10), total, limit: parseInt(limit, 10) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getReports(req, res, next) {
  try {
    const reports = await Report.find({})
      .populate('reporterId', 'name role email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
}

export async function getFraudAlerts(req, res, next) {
  try {
    // Collect flagged items: duplicate image hashes, high cancellation donors, rapid reports
    const flaggedDonations = await Donation.find({ riskLevel: 'HIGH' })
      .populate('donorId', 'name email phone')
      .populate('safetyAssessmentId')
      .limit(10);

    const flaggedAccounts = await DonorProfile.find({ safetyRejectionsCount: { $gt: 2 } }).populate(
      'userId',
      'name email phone status'
    );

    res.json({
      success: true,
      data: {
        flaggedDonations,
        flaggedAccounts,
        method: 'rule-based & isolation-forest baseline',
        disclaimer:
          'Flagged indicators are decision-support anomalies for human investigators. Automated bans are never enacted without administrative verification.',
      },
    });
  } catch (err) {
    next(err);
  }
}
