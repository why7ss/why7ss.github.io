import express from 'express';
import User from '../models/User.js';
import PushSubscription from '../models/PushSubscription.js';
import { getVapidPublicKey } from '../utils/pushNotifications.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get online users
router.get('/online', protect, async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const users = await User.find({
      lastSeen: { $gte: fiveMinutesAgo },
      isActive: true
    })
    .select('username displayName avatar role lastSeen')
    .sort('-lastSeen');

    res.json({ users });
  } catch (error) {
    console.error('Ошибка получения онлайн пользователей:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});

// Update last seen
router.post('/heartbeat', protect, async (req, res) => {
  try {
    req.user.lastSeen = new Date();
    await req.user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления статуса' });
  }
});

// Get VAPID public key for push notifications
router.get('/push-vapid-key', protect, (req, res) => {
  try {
    const key = getVapidPublicKey();
    if (!key) {
      return res.status(503).json({ message: 'Push notifications не настроены на сервере' });
    }
    res.json({ vapidPublicKey: key });
  } catch (error) {
    console.error('Ошибка получения VAPID ключа:', error);
    res.status(500).json({ message: 'Ошибка получения ключа' });
  }
});

// Subscribe to push notifications
router.post('/push-subscribe', protect, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Неверные данные subscription' });
    }

    // Проверяем, существует ли уже такая subscription
    let pushSubscription = await PushSubscription.findOne({
      endpoint: subscription.endpoint
    });

    if (pushSubscription) {
      // Обновляем существующую
      pushSubscription.user = req.user._id;
      pushSubscription.keys = subscription.keys;
      pushSubscription.isActive = true;
      pushSubscription.userAgent = req.get('user-agent');
      pushSubscription.lastUsed = new Date();
    } else {
      // Создаём новую
      pushSubscription = await PushSubscription.create({
        user: req.user._id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: req.get('user-agent'),
        lastUsed: new Date()
      });
    }

    await pushSubscription.save();

    console.log(`✅ Push subscription зарегистрирована для пользователя ${req.user.username}`);
    res.json({
      success: true,
      message: 'Push уведомления включены',
      subscription: {
        endpoint: pushSubscription.endpoint,
        createdAt: pushSubscription.createdAt
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации push subscription:', error);
    res.status(500).json({ message: 'Ошибка при регистрации push notifications' });
  }
});

// Unsubscribe from push notifications
router.post('/push-unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint обязателен' });
    }

    const result = await PushSubscription.deleteOne({
      endpoint,
      user: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Push subscription не найдена' });
    }

    console.log(`🗑️ Push subscription удалена для пользователя ${req.user.username}`);
    res.json({
      success: true,
      message: 'Push уведомления отключены'
    });
  } catch (error) {
    console.error('Ошибка при удалении push subscription:', error);
    res.status(500).json({ message: 'Ошибка при отключении push notifications' });
  }
});

export default router;