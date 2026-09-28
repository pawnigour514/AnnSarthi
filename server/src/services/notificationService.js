import { Notification } from '../models/Notification.js';
import { emitToUser, emitToRole } from '../sockets/socket.js';
import { logger } from '../utils/logger.js';

// Pluggable Channel Providers Interface
class InAppChannelProvider {
  async send({ userId, role, title, message, type, link, metadata }) {
    const notification = new Notification({
      userId,
      role,
      title,
      message,
      type,
      link,
      metadata,
    });
    await notification.save();

    if (userId) {
      emitToUser(userId, 'notification:new', notification);
    }
    if (role && role !== 'ALL') {
      emitToRole(role, 'notification:new', notification);
    }
    return notification;
  }
}

class EmailChannelStubProvider {
  async send({ toEmail, subject, text }) {
    // Stub provider: logs to console in development
    logger.info(`[EmailChannelStub] To: ${toEmail} | Subject: ${subject} | Text: ${text}`);
    return { success: true, provider: 'email-stub' };
  }
}

class SmsChannelStubProvider {
  async send({ toPhone, message }) {
    logger.info(`[SmsChannelStub] To: ${toPhone} | Message: ${message}`);
    return { success: true, provider: 'sms-stub' };
  }
}

const inAppProvider = new InAppChannelProvider();
const emailProvider = new EmailChannelStubProvider();
const smsProvider = new SmsChannelStubProvider();

export async function sendNotification({
  userId,
  role = 'ALL',
  title,
  message,
  type = 'SYSTEM',
  link = '',
  metadata = {},
  email = null,
  phone = null,
}) {
  try {
    const inAppResult = await inAppProvider.send({
      userId,
      role,
      title,
      message,
      type,
      link,
      metadata,
    });

    if (email) {
      await emailProvider.send({ toEmail: email, subject: title, text: message });
    }
    if (phone) {
      await smsProvider.send({ toPhone: phone, message });
    }

    return inAppResult;
  } catch (err) {
    logger.error({ err, userId, title }, 'Failed to deliver notification');
  }
}
