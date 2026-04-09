import express from 'express'
import { body } from 'express-validator'
import Ticket from '../models/Ticket.js'
import { protect, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validation.js'

const router = express.Router()

// Create ticket
router.post('/', protect, [
  body('title').isLength({ min: 3, max: 100 }).trim(),
  body('description').isLength({ min: 10, max: 2000 }).trim(),
  body('type').isIn(['bug', 'idea', 'question'])
], validate, async (req, res) => {
  try {
    const { title, description, type } = req.body

    const ticket = await Ticket.create({
      title,
      description,
      type,
      createdBy: req.user._id
    })

    await ticket.populate('createdBy', 'displayName username')

    res.status(201).json({ message: 'Тикет создан', ticket })
  } catch (error) {
    console.error('Ошибка создания тикета:', error)
    res.status(500).json({ message: 'Ошибка при создании тикета' })
  }
})

// Get all tickets (admin sees all, user sees own)
router.get('/', protect, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query

    const query = {}
    
    if (!['admin', 'moderator'].includes(req.user.role)) {
      query.createdBy = req.user._id
    }
    
    if (status) query.status = status
    if (type) query.type = type

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'displayName username')
      .populate('assignedTo', 'displayName username')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await Ticket.countDocuments(query)

    res.json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    })
  } catch (error) {
    console.error('Ошибка получения тикетов:', error)
    res.status(500).json({ message: 'Ошибка при получении тикетов' })
  }
})

// Get ticket by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'displayName username avatar')
      .populate('assignedTo', 'displayName username')
      .populate('replies.author', 'displayName username avatar role')

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' })
    }

    // Check access
    if (ticket.createdBy._id.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Нет доступа' })
    }

    res.json({ ticket })
  } catch (error) {
    console.error('Ошибка получения тикета:', error)
    res.status(500).json({ message: 'Ошибка при получении тикета' })
  }
})

// Add reply
router.post('/:id/reply', protect, [
  body('content').isLength({ min: 1, max: 2000 }).trim()
], validate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' })
    }

    ticket.replies.push({
      content: req.body.content,
      author: req.user._id
    })

    // If admin replies, change status to in_progress
    if (['admin', 'moderator'].includes(req.user.role) && ticket.status === 'open') {
      ticket.status = 'in_progress'
    }

    await ticket.save()
    await ticket.populate('replies.author', 'displayName username avatar role')

    res.json({ message: 'Ответ добавлен', ticket })
  } catch (error) {
    console.error('Ошибка добавления ответа:', error)
    res.status(500).json({ message: 'Ошибка при добавлении ответа' })
  }
})

// Update ticket status (admin only)
router.put('/:id/status', protect, authorize('admin', 'moderator'), [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
], validate, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('createdBy', 'displayName username')

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' })
    }

    res.json({ message: 'Статус обновлён', ticket })
  } catch (error) {
    console.error('Ошибка обновления статуса:', error)
    res.status(500).json({ message: 'Ошибка при обновлении статуса' })
  }
})

// Delete ticket
router.delete('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден' })
    }

    if (ticket.createdBy.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав' })
    }

    await ticket.deleteOne()

    res.json({ message: 'Тикет удалён' })
  } catch (error) {
    console.error('Ошибка удаления тикета:', error)
    res.status(500).json({ message: 'Ошибка при удалении тикета' })
  }
})

export default router