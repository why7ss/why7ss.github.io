import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { body } from 'express-validator';
import User from '../models/User.js';
import Upload from '../models/Upload.js';
import Message from '../models/Message.js';
import ActivityLog from '../models/ActivityLog.js';
import InviteCode from '../models/InviteCode.js';
import { broadcastAdminNotification } from '../socket/broadcaster.js';
import { sendPushNotificationToAll } from '../utils/pushNotifications.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const notificationUploadDir = path.join(__dirname, '../../uploads/notifications');
if (!fs.existsSync(notificationUploadDir)) {
  fs.mkdirSync(notificationUploadDir, { recursive: true });
}

const notificationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, notificationUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const notificationUpload = multer({
  storage: notificationStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  }
});

// Get dashboard statistics
router.get('/stats', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalUploads,
      pendingUploads,
      totalMessages,
      todayMessages,
      activeInvites
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Upload.countDocuments(),
      Upload.countDocuments({ status: 'pending' }),
      Message.countDocuments({ isDeleted: false }),
      Message.countDocuments({
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      InviteCode.countDocuments({ isActive: true })
    ]);

    // Get upload statistics by category
    const uploadsByCategory = await Upload.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentActivity = await ActivityLog.find()
      .populate('user', 'username displayName')
      .sort('-createdAt')
      .limit(20);

    // Get user growth (last 7 days)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalUploads,
        pendingUploads,
        totalMessages,
        todayMessages,
        activeInvites
      },
      uploadsByCategory,
      recentActivity,
      userGrowth
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

// Get all users
router.post('/notifications', protect, authorize('admin', 'moderator'), notificationUpload.single('image'), async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Заголовок и текст обязательны' });
    }

    const image = req.file ? `/uploads/notifications/${req.file.filename}` : null;

    const payload = {
      title,
      message,
      image,
      createdAt: new Date(),
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    };

    // Отправляем через Socket.IO (в браузере, если вкладка открыта)
    broadcastAdminNotification(payload);

    // Отправляем Web Push (на компьютер, даже если вкладка закрыта)
    const pushResults = await sendPushNotificationToAll(payload);
    const successCount = pushResults.filter(r => r.success).length;

    console.log(`📤 Уведомление отправлено: ${successCount} push, в сокет всем клиентам`);

    res.json({
      message: 'Уведомление отправлено',
      notification: { title, message, image },
      pushResults: {
        total: pushResults.length,
        successful: successCount,
        failed: pushResults.length - successCount
      }
    });
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    res.status(500).json({ message: 'Ошибка при отправке уведомления' });
  }
});

router.get('/users', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { displayName: new RegExp(search, 'i') }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .populate('invitedBy', 'username displayName')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

// Update user role
router.put('/users/:id/role', protect, authorize('admin'), [
  body('role').isIn(['user', 'moderator', 'admin'])
], validate, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Роль пользователя обновлена',
      user
    });
  } catch (error) {
    console.error('Ошибка изменения роли:', error);
    res.status(500).json({ message: 'Ошибка при изменении роли' });
  }
});

// Ban/Unban user
router.put('/users/:id/ban', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Нельзя заблокировать администратора' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
      user
    });
  } catch (error) {
    console.error('Ошибка блокировки пользователя:', error);
    res.status(500).json({ message: 'Ошибка при блокировке пользователя' });
  }
});

// Delete user
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Нельзя удалить собственный аккаунт' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Нельзя удалить администратора' });
    }

    await user.deleteOne();

    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
});

// Create user (admin only)
router.post('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, password, displayName, role } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Имя пользователя уже занято' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      password,
      displayName,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'Пользователь создан',
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ message: 'Ошибка при создании пользователя' });
  }
});

// Get activity logs
router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId, severity } = req.query;

    const query = {};

    if (action) query.action = action;
    if (userId) query.user = userId;
    if (severity) query.severity = severity;

    const logs = await ActivityLog.find(query)
      .populate('user', 'username displayName role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    res.status(500).json({ message: 'Ошибка при получении логов' });
  }
});

// System health check
router.get('/health', protect, authorize('admin'), async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const diskUsage = await Upload.aggregate([
      { $group: { _id: null, total: { $sum: { $sum: '$files.size' } } } }
    ]);

    res.json({
      status: 'OK',
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      diskUsage: diskUsage[0]?.total || 0
    });
  } catch (error) {
    console.error('Ошибка проверки здоровья системы:', error);
    res.status(500).json({ message: 'Ошибка при проверке системы' });
  }
});

export default router;