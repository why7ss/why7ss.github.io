import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register',
      'message_sent', 'message_deleted', 'message_edited',
      'upload_created', 'upload_deleted', 'upload_downloaded', 'upload_reviewed',
      'user_banned', 'user_unbanned', 'user_role_changed',
      'invite_created', 'invite_used', 'invite_deleted',
      'settings_changed', 'profile_updated', 'avatar_updated',
      'ticket_created', 'ticket_closed', 'ticket_replied'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
}, {
  timestamps: true
})

activityLogSchema.index({ user: 1, createdAt: -1 })
activityLogSchema.index({ action: 1 })
activityLogSchema.index({ createdAt: -1 })

export default mongoose.model('ActivityLog', activityLogSchema)