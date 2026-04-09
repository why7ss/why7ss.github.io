import mongoose from 'mongoose';

const inviteCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  maxUses: {
    type: Number,
    default: 1
  },
  currentUses: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

inviteCodeSchema.index({ code: 1 });
inviteCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('InviteCode', inviteCodeSchema);