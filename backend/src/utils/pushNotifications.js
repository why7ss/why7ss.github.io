import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

// Установите VAPID ключи из переменных окружения
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@easygame.com',
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('✅ Web Push VAPID кли настроены');
} else {
  console.warn('⚠️ VAPID ключи не найдены в переменных окружения');
}

export async function sendPushNotificationToUser(userId, payload) {
  try {
    const subscriptions = await PushSubscription.find({
      user: userId,
      isActive: true
    });

    if (subscriptions.length === 0) {
      console.log(`ℹ️ Нет активных push subscriptions для пользователя ${userId}`);
      return [];
    }

    const results = [];

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
            }
          },
          JSON.stringify(payload)
        );

        // Обновляем время последнего использования
        subscription.lastUsed = new Date();
        await subscription.save();

        results.push({ success: true, endpoint: subscription.endpoint });
        console.log(`✅ Push отправлена пользователю ${userId}`);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription больше не валидна, удаляем
          await PushSubscription.deleteOne({ _id: subscription._id });
          console.log(`🗑️ Deleted invalid subscription`);
          results.push({ success: false, endpoint: subscription.endpoint, reason: 'subscription_expired' });
        } else {
          console.error(`❌ Ошибка отправки push для ${userId}:`, err.message);
          results.push({ success: false, endpoint: subscription.endpoint, reason: err.message });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Ошибка при отправке push уведомлений:', error);
    return [];
  }
}

export async function sendPushNotificationToAll(payload) {
  try {
    const subscriptions = await PushSubscription.find({ isActive: true });

    if (subscriptions.length === 0) {
      console.log('ℹ️ Нет активных push subscriptions');
      return [];
    }

    const results = [];

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth
            }
          },
          JSON.stringify(payload)
        );

        subscription.lastUsed = new Date();
        await subscription.save();

        results.push({ success: true, userId: subscription.user });
        console.log(`✅ Push отправлена пользователю ${subscription.user}`);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: subscription._id });
          console.log(`🗑️ Deleted invalid subscription`);
          results.push({ success: false, userId: subscription.user, reason: 'subscription_expired' });
        } else {
          console.error(`❌ Ошибка отправки push:`, err.message);
          results.push({ success: false, userId: subscription.user, reason: err.message });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Ошибка при отправке push всем:', error);
    return [];
  }
}

export function getVapidPublicKey() {
  return vapidPublicKey;
}
