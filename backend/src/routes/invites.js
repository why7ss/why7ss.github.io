import express from 'express';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import InviteCode from '../models/InviteCode.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Generate invite code
function generateCode() {
  return uuidv4().split('-')[0].toUpperCase();
}

// Create invite
router.post('/', protect, authorize('admin', 'moderator'), [
  body('maxUses').optional().isInt({ min: 1, max: 100 }),
  body('expiresIn').optional().isInt({ min: 1 })
], validate, async (req, res) => {
  try {
    const { maxUses = 1, expiresIn } = req.body;

    const code = generateCode();
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
      : null;

    const invite = await InviteCode.create({
      code,
      createdBy: req.user._id,
      maxUses,
      expiresAt
    });

    res.status(201).json({
      message: 'Код приглашения создан',
      invite: {
        code: invite.code,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    console.error('Ошибка создания кода:', error);
    res.status(500).json({ message: 'Ошибка при создании кода приглашения' });
  }
});

// Get all invites
router.get('/', protect, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const invites = await InviteCode.find()
      .populate('createdBy', 'username displayName')
      .populate('usedBy', 'username displayName')
      .sort('-createdAt')
      .limit(100);

    res.json({ invites });
  } catch (error) {
    console.error('Ошибка получения кодов:', error);
    res.status(500).json({ message: 'Ошибка при получении кодов' });
  }
});

// Delete invite
router.delete('/:code', protect, authorize('admin'), async (req, res) => {
  try {
    const invite = await InviteCode.findOne({ code: req.params.code.toUpperCase() });

    if (!invite) {
      return res.status(404).json({ message: 'Код приглашения не найден' });
    }

    await invite.deleteOne();

    res.json({ message: 'Код приглашения удален' });
  } catch (error) {
    console.error('Ошибка удаления кода:', error);
    res.status(500).json({ message: 'Ошибка при удалении кода' });
  }
});

// Validate invite (public)
router.post('/validate', [
  body('code').notEmpty().trim().toUpperCase()
], validate, async (req, res) => {
  try {
    const { code } = req.body;

    const invite = await InviteCode.findOne({
      code,
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (!invite || invite.currentUses >= invite.maxUses) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Ошибка валидации кода:', error);
    res.status(500).json({ message: 'Ошибка при валидации кода' });
  }
});

export default router;