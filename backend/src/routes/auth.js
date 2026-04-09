import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User.js';
import InviteCode from '../models/InviteCode.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// ==================== AVATAR UPLOAD CONFIG ====================
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения!'));
    }
  }
});

// ==================== HELPER ====================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==================== ROUTES ====================

// Register
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).trim().escape(),
  body('password').isLength({ min: 6 }),
  body('displayName').isLength({ min: 1, max: 30 }).trim().escape(),
  body('inviteCode').notEmpty().trim().toUpperCase()
], validate, async (req, res) => {
  try {
    const { username, password, displayName, inviteCode } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Имя пользователя уже занято' });
    }

    const invite = await InviteCode.findOne({ 
      code: inviteCode,
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (!invite) {
      return res.status(400).json({ message: 'Неверный или истекший код приглашения' });
    }

    if (invite.currentUses >= invite.maxUses) {
      return res.status(400).json({ message: 'Код приглашения исчерпан' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      password,
      displayName,
      invitedBy: invite.createdBy,
      usedInviteCode: inviteCode
    });

    invite.currentUses += 1;
    if (invite.currentUses >= invite.maxUses) {
      invite.isActive = false;
    }
    invite.usedBy = user._id;
    await invite.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// Login
router.post('/login', [
  body('username').notEmpty().trim().escape(),
  body('password').notEmpty()
], validate, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Аккаунт заблокирован' });
    }

    user.statistics.loginCount += 1;
    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatar: user.avatar,
        settings: user.settings,
        statistics: user.statistics
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      displayName: req.user.displayName,
      role: req.user.role,
      avatar: req.user.avatar,
      settings: req.user.settings,
      statistics: req.user.statistics,
      createdAt: req.user.createdAt
    }
  });
});

// Update profile
router.put('/profile', protect, [
  body('displayName').optional().isLength({ min: 1, max: 30 }).trim().escape()
], validate, async (req, res) => {
  try {
    const { displayName } = req.body;

    if (displayName) {
      req.user.displayName = displayName;
    }

    await req.user.save();

    res.json({
      message: 'Профиль обновлен',
      user: {
        id: req.user._id,
        username: req.user.username,
        displayName: req.user.displayName,
        role: req.user.role,
        avatar: req.user.avatar,
        settings: req.user.settings
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Upload avatar
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    if (req.user.avatar) {
      const oldPath = path.join(__dirname, '../..', req.user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.save();

    res.json({
      message: 'Аватар обновлён',
      avatar: req.user.avatar
    });
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
    res.status(500).json({ message: 'Ошибка при загрузке аватара' });
  }
});

// Change password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!(await req.user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ message: 'Ошибка при смене пароля' });
  }
});

// Update settings
router.put('/settings', protect, async (req, res) => {
  try {
    const { notifications, soundEnabled, theme, accentColor } = req.body;

    if (typeof notifications === 'boolean') {
      req.user.settings.notifications = notifications;
    }
    if (typeof soundEnabled === 'boolean') {
      req.user.settings.soundEnabled = soundEnabled;
    }
    if (theme && ['light', 'dark'].includes(theme)) {
      req.user.settings.theme = theme;
    }
    if (accentColor && ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange', 'cyan'].includes(accentColor)) {
      req.user.settings.accentColor = accentColor;
    }

    await req.user.save();

    res.json({
      message: 'Настройки обновлены',
      settings: req.user.settings
    });
  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    res.status(500).json({ message: 'Ошибка при обновлении настроек' });
  }
});

export default router;