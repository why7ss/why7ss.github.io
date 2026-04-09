import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { sendUnreadNotifications } from './broadcaster.js';

const connectedUsers = new Map();

export function setupSocketHandlers(io) {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // Add to connected users
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: {
        id: socket.user._id,
        username: socket.user.username,
        displayName: socket.user.displayName,
        avatar: socket.user.avatar,
        role: socket.user.role
      }
    });

    // Update last seen
    socket.user.lastSeen = new Date();
    socket.user.save();

    // Send unread notifications from while user was away
    sendUnreadNotifications(socket);

    // Broadcast user joined
    io.emit('user:joined', {
      user: {
        id: socket.user._id,
        username: socket.user.username,
        displayName: socket.user.displayName,
        avatar: socket.user.avatar,
        role: socket.user.role
      }
    });

    // Send online users list
    socket.emit('users:online', Array.from(connectedUsers.values()).map(u => u.user));

    // Join default channel
    socket.join('general');

    // Handle chat messages
    socket.on('message:send', async (data) => {
      try {
        const { content = '', channel = 'general', replyTo, image, poll } = data;
        const isPoll = !!poll;
        const isImage = !!image;

        if (!isPoll && !isImage && (!content || content.trim().length === 0)) {
          return socket.emit('error', { message: 'Сообщение не может быть пустым' });
        }

        if (content && content.length > 2000) {
          return socket.emit('error', { message: 'Сообщение слишком длинное' });
        }

        const messageData = {
          sender: socket.user._id,
          channel,
          replyTo: replyTo || null
        };

        if (isPoll) {
          const options = Array.isArray(poll.options)
            ? poll.options.filter(opt => opt?.trim()).map(opt => ({ text: opt.trim(), votes: [], count: 0 }))
            : [];

          if (!poll.question?.trim() || options.length < 2) {
            return socket.emit('error', { message: 'Неверные данные для опроса' });
          }

          messageData.type = 'poll';
          messageData.content = poll.question.trim();
          messageData.poll = {
            question: poll.question.trim(),
            options,
            totalVotes: 0
          };
        } else if (isImage) {
          messageData.type = 'image';
          messageData.content = content && content.trim() ? content.trim() : '';
          messageData.attachments = [{
            filename: image.split('/').pop(),
            url: image,
            size: 0,
            mimeType: 'image/*'
          }];
        } else {
          messageData.type = 'text';
          messageData.content = content.trim();
        }

        const message = await Message.create(messageData);

        await message.populate('sender', 'username displayName avatar role');
        if (replyTo) {
          await message.populate('replyTo');
        }

        socket.user.statistics.messagesCount += 1;
        await socket.user.save();
        console.log('Message created and sending:', {
          _id: message._id,
          type: message.type,
          channel: message.channel,
          hasAttachments: message.attachments?.length > 0
        });
        io.to(channel).emit('message:new', message);

        if (content) {
          const mentionRegex = /@([^\s@#<>()[\]{}"']+)/g;
          const mentions = Array.from(new Set(Array.from(content.matchAll(mentionRegex), m => m[1].toLowerCase())));

          if (mentions.length > 0) {
            Array.from(connectedUsers.values()).forEach((connected) => {
              const targetUsername = connected.user.username?.toLowerCase();
              if (!targetUsername) return;
              if (mentions.includes(targetUsername) && targetUsername !== socket.user.username?.toLowerCase()) {
                io.to(connected.socketId).emit('mention:received', {
                  from: {
                    id: socket.user._id,
                    username: socket.user.username,
                    displayName: socket.user.displayName
                  },
                  channel,
                  messageId: message._id,
                  content: messageData.content || '',
                  message: {
                    _id: message._id,
                    channel: message.channel,
                    sender: { username: socket.user.username, displayName: socket.user.displayName },
                    content: messageData.content
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Ошибка отправки сообщения' });
      }
    });

    socket.on('poll:vote', async (data) => {
      try {
        const { messageId, optionIndex } = data;
        const message = await Message.findById(messageId);

        if (!message || message.type !== 'poll') {
          return socket.emit('error', { message: 'Опрос не найден' });
        }

        const option = message.poll.options[optionIndex];
        if (!option) {
          return socket.emit('error', { message: 'Вариант не найден' });
        }

        const userId = socket.user._id.toString();
        const currentOptionIndex = message.poll.options.findIndex((opt) =>
          opt.votes.some((vote) => vote.toString() === userId)
        );

        if (currentOptionIndex !== -1) {
          message.poll.options[currentOptionIndex].votes = message.poll.options[currentOptionIndex].votes.filter(
            (vote) => vote.toString() !== userId
          );
          message.poll.options[currentOptionIndex].count = message.poll.options[currentOptionIndex].votes.length;
        }

        if (currentOptionIndex !== optionIndex) {
          message.poll.options[optionIndex].votes.push(socket.user._id);
          message.poll.options[optionIndex].count = message.poll.options[optionIndex].votes.length;
        }

        message.poll.totalVotes = message.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        await message.save();

        io.to(message.channel).emit('message:poll:update', {
          messageId,
          poll: message.poll
        });
      } catch (error) {
        console.error('Error voting in poll:', error);
        socket.emit('error', { message: 'Ошибка голоса в опросе' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      socket.to(data.channel || 'general').emit('typing:user', {
        userId: socket.user._id,
        username: socket.user.displayName,
        channel: data.channel || 'general'
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(data.channel || 'general').emit('typing:stop', {
        userId: socket.user._id,
        channel: data.channel || 'general'
      });
    });

    // Handle message reactions
    socket.on('message:react', async (data) => {
      try {
        const { messageId, emoji } = data;
        const message = await Message.findById(messageId);

        if (!message) {
          return socket.emit('error', { message: 'Сообщение не найдено' });
        }

        const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

        if (reactionIndex > -1) {
          const userIndex = message.reactions[reactionIndex].users.indexOf(socket.user._id);
          
          if (userIndex > -1) {
            message.reactions[reactionIndex].users.splice(userIndex, 1);
            if (message.reactions[reactionIndex].users.length === 0) {
              message.reactions.splice(reactionIndex, 1);
            }
          } else {
            message.reactions[reactionIndex].users.push(socket.user._id);
          }
        } else {
          message.reactions.push({
            emoji,
            users: [socket.user._id]
          });
        }

        await message.save();

        io.to(message.channel).emit('message:reaction', {
          messageId,
          reactions: message.reactions
        });
      } catch (error) {
        console.error('Error reacting to message:', error);
        socket.emit('error', { message: 'Ошибка добавления реакции' });
      }
    });

    // Handle joining channels
    socket.on('channel:join', (channel) => {
      socket.join(channel);
      socket.emit('channel:joined', { channel });
    });

    socket.on('channel:leave', (channel) => {
      socket.leave(channel);
      socket.emit('channel:left', { channel });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);
      
      connectedUsers.delete(socket.user._id.toString());

      io.emit('user:left', {
        userId: socket.user._id,
        username: socket.user.username
      });

      // Update last seen
      socket.user.lastSeen = new Date();
      socket.user.save();
    });
  });
}