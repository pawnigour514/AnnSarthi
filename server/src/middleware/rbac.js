import { ForbiddenError } from '../utils/errors.js';

/**
 * Require one of the specified roles
 * @param  {...string} roles Allowed roles: 'DONOR', 'DELIVERY_PARTNER', 'RECEIVER', 'ADMIN'
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Unauthorized role. Requires one of [${roles.join(', ')}], but current role is ${req.user.role}`
        )
      );
    }

    next();
  };
}

/**
 * Require account verification (ADMIN accounts are always considered verified)
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.verificationStatus !== 'VERIFIED') {
    return next(
      new ForbiddenError(
        'Account verification is pending administrator review. Limited access mode active.'
      )
    );
  }

  next();
}
