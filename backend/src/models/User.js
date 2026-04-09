import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usedInviteCode: {
    type: String
  },
  avatar: {
    type: String,
    default: null
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  statistics: {
    messagesCount: { type: Number, default: 0 },
    uploadsCount: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 },
    totalUploadSize: { type: Number, default: 0 }
  },
  settings: {
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    accentColor: { 
      type: String, 
      enum: ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange', 'cyan'],
      default: 'blue' 
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);