import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export async function recordAuditLog({
  entityType,
  entityId,
  action,
  performedBy = null,
  performedByRole = 'SYSTEM',
  previousState = null,
  newState = null,
  ipAddress = '',
  userAgent = '',
  details = '',
  metadata = {},
}) {
  try {
    const log = new AuditLog({
      entityType,
      entityId,
      action,
      performedBy,
      performedByRole,
      previousState,
      newState,
      ipAddress,
      userAgent,
      details,
      metadata,
    });
    await log.save();
    return log;
  } catch (err) {
    logger.error({ err, entityType, entityId, action }, 'Failed to record audit log');
  }
}
