import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  recipients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  readBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 // Auto-delete after 7 days
  }
});

export default mongoose.model('Notification', notificationSchema);
