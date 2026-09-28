import { Notification } from '../models/Notification.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { role: req.user.role }, { role: 'ALL' }],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      $or: [{ userId: req.user._id }, { role: req.user.role }, { role: 'ALL' }],
      read: false,
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      {
        $or: [{ userId: req.user._id }, { role: req.user.role }, { role: 'ALL' }],
        read: false,
      },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
