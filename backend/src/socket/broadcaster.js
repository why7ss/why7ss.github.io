let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

export const broadcastAdminNotification = async (payload) => {
  if (!ioInstance) {
    console.warn('Socket IO instance not set for admin notifications');
    return;
  }

  try {
    // Save notification to database
    const Notification = (await import('../models/Notification.js')).default;
    const notificationDoc = await Notification.create({
      title: payload.title,
      message: payload.message,
      image: payload.image,
      recipients: [], // Available to all users
      createdAt: new Date()
    });

    // Broadcast to all connected clients
    ioInstance.emit('admin:notification', {
      ...payload,
      _id: notificationDoc._id
    });

    console.log('Admin notification sent:', payload.title);
  } catch (error) {
    console.error('Error broadcasting admin notification:', error);
    // Still broadcast even if DB save fails
    if (ioInstance) {
      ioInstance.emit('admin:notification', payload);
    }
  }
};

export const sendUnreadNotifications = async (socket) => {
  try {
    const Notification = (await import('../models/Notification.js')).default;
    
    // Get notifications from last 7 days that haven't been read by this user
    const unreadNotifications = await Notification.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      readBy: { $nin: [socket.user._id] }
    }).limit(10);

    if (unreadNotifications.length > 0) {
      socket.emit('pending:notifications', unreadNotifications);
    }
  } catch (error) {
    console.error('Error sending unread notifications:', error);
  }
};
