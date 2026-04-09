import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  category: {
    type: String,
    enum: ['document', 'image', 'video', 'archive', 'code', 'other'],
    required: true
  },
  files: [{
    originalName: String,
    filename: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  tags: [String],
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

uploadSchema.index({ uploadedBy: 1, createdAt: -1 });
uploadSchema.index({ status: 1 });
uploadSchema.index({ category: 1 });

export default mongoose.model('Upload', uploadSchema);