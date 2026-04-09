import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import inviteRoutes from './routes/invites.js';
import uploadRoutes from './routes/uploads.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import ticketRoutes from './routes/tickets.js';

// Import socket handlers
import { setupSocketHandlers } from './socket/handlers.js';
import { setIo } from './socket/broadcaster.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true
  }
});

setIo(io);

// CORS - ВАЖНО: должен быть ПЕРЕД helmet
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

// Security middleware - отключаем crossOriginResourcePolicy для картинок
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов'
});
app.use('/api/', limiter);

// Serve static files - ВАЖНО: добавляем CORS заголовки для статики
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB подключена'))
  .catch(err => console.error('❌ Ошибка MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.IO setup
setupSocketHandlers(io);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера'
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

export { io };