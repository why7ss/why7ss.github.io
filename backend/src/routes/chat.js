import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { body } from 'express-validator';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения разрешены'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter
});

const router = express.Router();

// Upload image for chat
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    res.status(201).json({
      image: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения чата:', error);
    res.status(500).json({ message: error.message || 'Ошибка при загрузке изображения' });
  }
});

// Get messages
router.get('/', protect, async (req, res) => {
  try {
    const { channel = 'general', limit = 50, before } = req.query;

    const query = {
      channel,
      isDeleted: false
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username displayName avatar role')
      .populate('replyTo')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

// Edit message
router.put('/:id', protect, [
  body('content').isLength({ min: 1, max: 2000 }).trim()
], validate, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'username displayName avatar role');

    res.json({ message });
  } catch (error) {
    console.error('Ошибка редактирования сообщения:', error);
    res.status(500).json({ message: 'Ошибка при редактировании сообщения' });
  }
});

// Delete message
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }

    if (message.sender.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Сообщение удалено' });
  } catch (error) {
    console.error('Ошибка удаления сообщения:', error);
    res.status(500).json({ message: 'Ошибка при удалении сообщения' });
  }
});

export default router;