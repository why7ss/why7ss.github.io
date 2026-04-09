import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: false,  // Опционально, т.к. может быть изображение или опрос без текста
    maxlength: 2000,
    default: ''
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: String,
    enum: ['general', 'uploads', 'announcements', 'support'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['text', 'system', 'file', 'image', 'poll'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      count: { type: Number, default: 0 }
    }],
    totalVotes: { type: Number, default: 0 }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
}, {
  timestamps: true
});

messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model('Message', messageSchema);