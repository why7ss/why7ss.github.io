import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { body } from 'express-validator';
import Upload from '../models/Upload.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|7z|mp4|avi|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

// Create upload
router.post('/', protect, upload.array('files', 5), [
  body('title').isLength({ min: 1, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape(),
  body('category').isIn(['document', 'image', 'video', 'archive', 'code', 'other'])
], validate, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Файлы не загружены' });
    }

    const files = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype
    }));

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    const uploadDoc = await Upload.create({
      title,
      description,
      category,
      files,
      uploadedBy: req.user._id,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    // Update user statistics
    req.user.statistics.uploadsCount += 1;
    req.user.statistics.totalUploadSize += totalSize;
    await req.user.save();

    await uploadDoc.populate('uploadedBy', 'username displayName');

    res.status(201).json({
      message: 'Файлы успешно загружены',
      upload: uploadDoc
    });
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error);

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }

    res.status(500).json({ message: 'Ошибка при загрузке файлов' });
  }
});

// Get all uploads
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    const query = {};

    if (req.user.role === 'user') {
      query.uploadedBy = req.user._id;
    } else if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const uploads = await Upload.find(query)
      .populate('uploadedBy', 'username displayName')
      .populate('reviewedBy', 'username displayName')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Upload.countDocuments(query);

    res.json({
      uploads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Ошибка получения загрузок:', error);
    res.status(500).json({ message: 'Ошибка при получении загрузок' });
  }
});

// Get upload by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id)
      .populate('uploadedBy', 'username displayName')
      .populate('reviewedBy', 'username displayName');

    if (!upload) {
      return res.status(404).json({ message: 'Загрузка не найдена' });
    }

    // Increment views
    upload.views += 1;
    await upload.save();

    res.json({ upload });
  } catch (error) {
    console.error('Ошибка получения загрузки:', error);
    res.status(500).json({ message: 'Ошибка при получении загрузки' });
  }
});

// Review upload (admin/moderator only)
router.put('/:id/review', protect, authorize('admin', 'moderator'), [
  body('status').isIn(['approved', 'rejected']),
  body('notes').optional().isLength({ max: 500 }).trim().escape()
], validate, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: 'Загрузка не найдена' });
    }

    upload.status = status;
    upload.reviewedBy = req.user._id;
    upload.reviewedAt = new Date();
    upload.reviewNotes = notes || '';

    await upload.save();
    await upload.populate('uploadedBy', 'username displayName');
    await upload.populate('reviewedBy', 'username displayName');

    res.json({
      message: 'Загрузка проверена',
      upload
    });
  } catch (error) {
    console.error('Ошибка проверки загрузки:', error);
    res.status(500).json({ message: 'Ошибка при проверке загрузки' });
  }
});

// Delete upload
router.delete('/:id', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: 'Загрузка не найдена' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && upload.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }

    // Delete files
    upload.files.forEach(file => {
      const filePath = path.join(__dirname, '../..', file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await upload.deleteOne();

    res.json({ message: 'Загрузка удалена' });
  } catch (error) {
    console.error('Ошибка удаления загрузки:', error);
    res.status(500).json({ message: 'Ошибка при удалении загрузки' });
  }
});

// Download file
router.get('/:id/download/:fileIndex', protect, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: 'Загрузка не найдена' });
    }

    const fileIndex = parseInt(req.params.fileIndex);
    const file = upload.files[fileIndex];

    if (!file) {
      return res.status(404).json({ message: 'Файл не найден' });
    }

    const filePath = path.join(__dirname, '../..', file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Файл не найден на сервере' });
    }

    // Increment downloads
    upload.downloads += 1;
    await upload.save();

    res.download(filePath, file.originalName);
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    res.status(500).json({ message: 'Ошибка при скачивании файла' });
  }
});

export default router;