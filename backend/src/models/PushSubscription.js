import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    keys: {
      p256dh: String,
      auth: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    userAgent: String,
    lastUsed: Date
  },
  { timestamps: true }
);

// Индекс для удаления неактивных subscriptions
pushSubscriptionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 } // 30 дней
);

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
