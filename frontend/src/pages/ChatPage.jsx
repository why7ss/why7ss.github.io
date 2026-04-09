import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiHash, FiLock, FiTrash2, FiSmile, FiPaperclip, FiImage, FiBarChart2 } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

const CHANNELS = [
  { id: 'general', name: 'Общий', icon: '💬', restricted: false },
  { id: 'announcements', name: 'Объявления', icon: '📢', restricted: true }
]

const EMOJIS = [
  '😀', '😂', '😊', '😍', '👍', '👎', '❤️', '🔥', '⭐', '✨'
]

export default function ChatPage() {
  const { user } = useAuthStore()
  const { socket, connected, emit, on, off, mentionCounts, clearMentionCount } = useSocketStore()
  const [currentChannel, setCurrentChannel] = useState('general')
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [messageIdToDelete, setMessageIdToDelete] = useState(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showPollModal, setShowPollModal] = useState(false)
  const [pollData, setPollData] = useState({ question: '', options: ['', ''] })
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const chatActionsRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const attachmentMenuRef = useRef(null)

  const isAdmin = ['admin', 'moderator'].includes(user?.role)
  const currentChannelInfo = CHANNELS.find(c => c.id === currentChannel)
  const canSendMessage = !currentChannelInfo?.restricted || isAdmin

  useEffect(() => {
    loadMessages()
  }, [currentChannel])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedInsideEmoji = emojiPickerRef.current?.contains(e.target)
      const clickedInsideAttachment = attachmentMenuRef.current?.contains(e.target)
      const clickedInsideActions = chatActionsRef.current?.contains(e.target)

      if (!clickedInsideEmoji && !clickedInsideAttachment && !clickedInsideActions) {
        setShowEmojiPicker(false)
        setShowAttachmentMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      console.log('Received message:', {
        _id: message._id,
        type: message.type,
        channel: message.channel,
        currentChannel,
        hasAttachments: message.attachments?.length > 0
      })
      if (message.channel === currentChannel) {
        clearMentionCount(message.channel)
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id)
          if (exists) return prev
          
          // Удаляем временные сообщения (они начинаются с 'temp_')
          // и добавляем реальное сообщение
          const filtered = prev.filter(m => !m._id.startsWith('temp_'))
          return [...filtered, message]
        })
        scrollToBottom()
      }
    }

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId))
    }

    const handlePollUpdate = ({ messageId, poll }) => {
      setMessages(prev => prev.map((message) =>
        message._id === messageId ? { ...message, poll } : message
      ))
    }

    const handleMentionReceived = (mention) => {
      if (mention.channel === currentChannel) {
        clearMentionCount(mention.channel)
      }
    }

    const handleSocketError = (error) => {
      console.error('Socket error:', error)
      toast.error(`Ошибка сокета: ${error.message || 'неизвестная ошибка'}`)
    }

    on('message:new', handleNewMessage)
    on('message:deleted', handleMessageDeleted)
    on('message:poll:update', handlePollUpdate)
    on('mention:received', handleMentionReceived)
    on('error', handleSocketError)
    
    return () => {
      off('message:new', handleNewMessage)
      off('message:deleted', handleMessageDeleted)
      off('message:poll:update', handlePollUpdate)
      off('mention:received', handleMentionReceived)
      off('error', handleSocketError)
    }
  }, [socket, currentChannel, on, off, clearMentionCount])

  const loadMessages = async () => {
    if (isLoadingMessages) return
    try {
      setIsLoadingMessages(true)
      const { data } = await axios.get(`/api/chat?channel=${currentChannel}&limit=50`)
      setMessages(data.messages)
      scrollToBottom()
    } catch (error) {
      toast.error('Ошибка загрузки')
    } finally {
      setLoading(false)
      setIsLoadingMessages(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Отправить сообщение с оптимистическим добавлением
  const sendMessageWithOptimistic = (content, attachments = null) => {
    if (!connected || !canSendMessage) {
      toast.error('Вы не можете отправлять сообщения')
      return
    }

    // Создаём временное сообщение для оптимистического отображения
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const userId = user?._id || user?.id // Убеждаемся, что используем правильное поле ID
    
    const tempMessage = {
      _id: tempId,
      sender: {
        _id: userId,
        id: userId, // Дублируем оба варианта для совместимости
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role
      },
      content: content.trim() || '',
      type: attachments ? 'image' : 'text',
      channel: currentChannel,
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      reactions: [],
      isPending: true // Флаг того, что сообщение ещё не сохранено
    }

    // Добавляем временное сообщение в UI
    setMessages(prev => [...prev, tempMessage])
    scrollToBottom()

    // Отправляем реальное сообщение через сокет
    emit('message:send', {
      content: content.trim(),
      channel: currentChannel,
      image: attachments?.[0]?.url || undefined
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !connected || !canSendMessage) return

    sendMessageWithOptimistic(messageInput)
    setMessageInput('')
  }

  const handleDeleteMessage = (messageId) => {
    setMessageIdToDelete(messageId)
    setShowDeleteConfirm(true)
  }

  const handleChannelSwitch = (newChannel) => {
    if (newChannel !== currentChannel) {
      emit('channel:leave', currentChannel)
      emit('channel:join', newChannel)
      setCurrentChannel(newChannel)
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const confirmDeleteMessage = async () => {
    if (!messageIdToDelete) return
    try {
      await axios.delete(`/api/chat/${messageIdToDelete}`)
      setMessages(prev => prev.filter(m => m._id !== messageIdToDelete))
      toast.success('Сообщение удалено')
    } catch (error) {
      toast.error('Ошибка удаления')
    } finally {
      setShowDeleteConfirm(false)
      setMessageIdToDelete(null)
    }
  }

  const handleEmojiClick = (emoji) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Только изображения!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (максимум 5MB)')
      return
    }

    toast.loading('Загружаю изображение...')
    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await axios.post('/api/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.dismiss()
      
      if (!connected) {
        toast.error('Ошибка: сокет не подключен')
        return
      }

      // Отправляем сообщение с изображением с оптимистическим добавлением
      sendMessageWithOptimistic('', [{
        filename: file.name,
        url: data.image,
        size: file.size,
        mimeType: file.type
      }])

      toast.success('Изображение отправлено!')
      setShowAttachmentMenu(false)
    } catch (error) {
      console.error('Ошибка загрузки:', error.response?.data || error.message)
      toast.dismiss()
      toast.error(error.response?.data?.message || error.message || 'Ошибка загрузки изображения')
    } finally {
      if (e.target) {
        e.target.value = null
      }
    }
  }

  const handleCreatePoll = () => {
    setShowAttachmentMenu(false)
    setShowPollModal(true)
  }

  useEffect(() => {
    if (currentChannel) {
      clearMentionCount(currentChannel)
    }
  }, [currentChannel, clearMentionCount])

  const handleSendPoll = (e) => {
    e.preventDefault()
    if (!pollData.question.trim() || pollData.options.some(opt => !opt.trim())) {
      toast.error('Заполните все поля')
      return
    }

    emit('message:send', {
      content: pollData.question,
      channel: currentChannel,
      poll: {
        question: pollData.question,
        options: pollData.options.filter(opt => opt.trim())
      }
    })

    setPollData({ question: '', options: ['', ''] })
    setShowPollModal(false)
  }

  const handleVotePoll = (messageId, optionIndex) => {
    if (!connected) {
      toast.error('Сначала подключитесь')
      return
    }

    emit('poll:vote', { messageId, optionIndex })
  }

  const addPollOption = () => {
    setPollData(prev => ({ ...prev, options: [...prev.options, ''] }))
  }

  const updatePollOption = (index, value) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const removePollOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <div className="h-full flex bg-gray-100 dark:bg-gray-950">
      {/* Channels */}
      <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiHash className="text-accent-500" />
            Каналы
          </h2>
        </div>
        <div className="flex-1 p-2">
          {CHANNELS.map((channel) => {
            const channelMentions = mentionCounts[channel.id] || 0
            return (
              <button
                key={channel.id}
                onClick={() => handleChannelSwitch(channel.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  currentChannel === channel.id
                    ? 'bg-accent-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{channel.icon}</span>
                <span className="font-medium flex-1 text-left">{channel.name}</span>
                {channelMentions > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.3rem] h-6 rounded-full bg-red-500 text-white text-xs font-semibold px-2">
                    {channelMentions}
                  </span>
                )}
                {channel.restricted && <FiLock size={14} className="opacity-50" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
          <span className="text-2xl mr-3">{currentChannelInfo?.icon}</span>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">{currentChannelInfo?.name}</h2>
            <p className="text-sm text-gray-500">
              {connected ? '🟢 Подключено' : '🔴 Отключено'}
              {currentChannelInfo?.restricted && ' • Только для модераторов'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Пока нет сообщений
            </div>
          ) : (
            messages.map((message) => {
              const senderId = message.sender?._id || message.sender?.id
              const odUser = user?._id || user?.id
              const isOwn = String(senderId) === String(odUser)
              
              // Логирование для отладки
              if (message.type === 'image') {
                console.log('🖼️ Изображение сообщение :', {
                  senderId,
                  currentUserId: odUser,
                  isOwn,
                  sender: message.sender,
                  type: message.type
                })
              }
              
              const avatarUrl = message.sender?.avatar 
                ? `http://localhost:5000${message.sender.avatar}` 
                : null
              
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden ${
                    message.sender?.role === 'admin' ? 'bg-red-500' :
                    message.sender?.role === 'moderator' ? 'bg-purple-500' :
                    'bg-accent-500'
                  }`}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      message.sender?.displayName?.[0]?.toUpperCase() || '?'
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    {/* Header */}
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {message.sender?.displayName}
                      </span>
                      {message.sender?.role !== 'user' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          message.sender?.role === 'admin' 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {message.sender?.role === 'admin' ? 'Админ' : 'Модер'}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                      
                      {/* Delete button for admins */}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-all"
                          title="Удалить"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`px-4 py-2.5 rounded-2xl break-words ${
                      isOwn 
                        ? 'bg-accent-500 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                    }`}>
                      {message.type === 'image' && message.attachments?.length > 0 ? (
                        <>
                          <img
                            src={`http://localhost:5000${message.attachments[0].url}`}
                            alt="Изображение"
                            className="max-w-full rounded-xl mb-2"
                            onError={(e) => {
                              console.error('Image load error:', e.currentTarget.src)
                              e.currentTarget.src = '/placeholder.png'
                            }}
                          />
                          {message.content && <p className="text-sm">{message.content}</p>}
                        </>
                      ) : null}
                      {message.type === 'poll' ? (
                        <div className="space-y-4">
                          <p className="font-semibold mb-2">{message.poll.question}</p>
                          <div className="space-y-2">
                            {message.poll.options.map((option, index) => {
                              const voted = option.votes?.some(v => String(v) === String(user?._id))
                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleVotePoll(message._id, index)}
                                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${
                                    voted ? 'bg-accent-500 border-accent-500 text-white' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <span className="text-left">{option.text}</span>
                                  <span className="text-sm opacity-80">{option.count || 0}</span>
                                </button>
                              )
                            })}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Проголосовало: {message.poll.totalVotes || 0}</p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div ref={chatActionsRef} className="relative chat-actions p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          {canSendMessage ? (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex gap-2">
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEmojiPicker(prev => !prev)
                      setShowAttachmentMenu(false)
                    }}
                    className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <FiSmile size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-4 shadow-xl min-w-[260px] z-10">
                      <div className="grid grid-cols-10 gap-2">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={attachmentMenuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAttachmentMenu(prev => !prev)
                      setShowEmojiPicker(false)
                    }}
                    className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <FiPaperclip size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  {showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-4 shadow-xl min-w-[220px] z-10">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click()
                            setShowAttachmentMenu(false)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                        >
                          <FiImage size={20} />
                          <span>Изображение</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCreatePoll}
                          className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                        >
                          <FiBarChart2 size={20} />
                          <span>Опрос</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Сообщение в ${currentChannelInfo?.name}...`}
                disabled={!connected}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-accent-500"
                maxLength={2000}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!connected || !messageInput.trim()}
                className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <FiSend size={18} />
              </motion.button>
            </form>
          ) : (
            <div className="text-center py-3 text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center gap-2">
              <FiLock size={16} />
              Только модераторы могут писать здесь
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Удалить сообщение?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              >
                Отмена
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Удалить
              </button>
            </div>
          </motion.div>
        </div>)}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Создать опрос</h3>
            <form onSubmit={handleSendPoll}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Вопрос
                  </label>
                  <input
                    type="text"
                    value={pollData.question}
                    onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Введите вопрос..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Варианты ответа
                  </label>
                  <div className="space-y-2">
                    {pollData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updatePollOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                          placeholder={`Вариант ${index + 1}`}
                          required
                        />
                        {pollData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removePollOption(index)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-sm"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollData.options.length < 10 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="text-accent-500 hover:text-accent-600 text-sm mt-2"
                    >
                      + Добавить вариант
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent-500 text-white rounded-lg"
                >
                  Создать опрос
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}