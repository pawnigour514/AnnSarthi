import { User } from '../models/User.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { ReceiverProfile } from '../models/ReceiverProfile.js';
import { DeliveryPartnerProfile } from '../models/DeliveryPartnerProfile.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_OPTIONS,
} from '../utils/jwt.js';
import { ValidationError, UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { recordAuditLog } from '../services/auditService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, profileData } = req.body;

    if (role === 'ADMIN') {
      throw new ForbiddenError('ADMIN accounts cannot be self-registered. Contact system owner.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('An account with this email already exists.');
    }

    // By default, accounts start as PENDING verification, except individuals
    const isIndividualDonor = role === 'DONOR' && profileData?.donorType === 'Individual';
    const initialVerification = isIndividualDonor ? 'VERIFIED' : 'PENDING';

    const user = new User({
      name,
      email,
      password,
      role: role || 'DONOR',
      phone: phone || '',
      verificationStatus: initialVerification,
    });
    await user.save();

    // Create role-specific profile
    if (user.role === 'DONOR') {
      await DonorProfile.create({
        userId: user._id,
        donorType: profileData?.donorType || 'Restaurant',
        orgName: profileData?.orgName || name,
        fssaiLicenseNumber: profileData?.fssaiLicenseNumber || '',
        address: profileData?.address || {},
        location: profileData?.location || { type: 'Point', coordinates: [75.8577, 22.7196] },
        verifiedByAdmin: isIndividualDonor,
      });
    } else if (user.role === 'RECEIVER') {
      await ReceiverProfile.create({
        userId: user._id,
        receiverType: profileData?.receiverType || 'NGO',
        orgName: profileData?.orgName || name,
        dailyMealCapacity: profileData?.dailyMealCapacity || 150,
        address: profileData?.address || {},
        location: profileData?.location || { type: 'Point', coordinates: [75.87, 22.72] },
      });
    } else if (user.role === 'DELIVERY_PARTNER') {
      await DeliveryPartnerProfile.create({
        userId: user._id,
        vehicleType: profileData?.vehicleType || 'Two-Wheeler',
        maxCapacityKg: profileData?.maxCapacityKg || 25,
        currentLocation: profileData?.location || { type: 'Point', coordinates: [75.86, 22.71] },
      });
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    await recordAuditLog({
      entityType: 'USER',
      entityId: user._id,
      action: 'USER_REGISTERED',
      performedBy: user._id,
      performedByRole: user.role,
      newState: { email: user.email, role: user.role, verificationStatus: initialVerification },
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      throw new ForbiddenError(
        `Account temporarily locked due to repeated failed logins. Please try again in ${waitMinutes} minutes.`
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await user.save();
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Reset login attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const accessToken = signAccessToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    await recordAuditLog({
      entityType: 'USER',
      entityId: user._id,
      action: 'USER_LOGIN',
      performedBy: user._id,
      performedByRole: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function demoLogin(req, res, next) {
  try {
    const { role } = req.body; // 'DONOR', 'DELIVERY_PARTNER', 'RECEIVER', 'ADMIN'
    const targetEmail =
      role === 'ADMIN'
        ? 'admin@demo.annsarthi.app'
        : role === 'DELIVERY_PARTNER'
        ? 'partner@demo.annsarthi.app'
        : role === 'RECEIVER'
        ? 'ngo@demo.annsarthi.app'
        : 'donor@demo.annsarthi.app';

    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      throw new ValidationError(`Demo user for role ${role} not found. Please run seed script.`);
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id });

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    let profile = null;
    if (req.user.role === 'DONOR') {
      profile = await DonorProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === 'RECEIVER') {
      profile = await ReceiverProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === 'DELIVERY_PARTNER') {
      profile = await DeliveryPartnerProfile.findOne({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Invalid user session');
    }

    const newAccessToken = signAccessToken({ id: user._id, role: user.role, email: user.email });
    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    next(err);
  }
}
