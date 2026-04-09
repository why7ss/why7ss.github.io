import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['bug', 'idea', 'question'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  replies: [{
    content: { type: String, required: true, maxlength: 2000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

ticketSchema.index({ createdBy: 1, createdAt: -1 })
ticketSchema.index({ status: 1 })
ticketSchema.index({ type: 1 })

export default mongoose.model('Ticket', ticketSchema)