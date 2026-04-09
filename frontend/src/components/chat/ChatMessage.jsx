import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FiMoreVertical } from 'react-icons/fi'
import { useState } from 'react'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '🔥']

export default function ChatMessage({ message, onReaction, currentUserId }) {
  const [showReactions, setShowReactions] = useState(false)
  const isOwn = message.sender._id === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
          message.sender.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-700' :
          message.sender.role === 'moderator' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
          'bg-gradient-to-br from-primary-500 to-primary-700'
        }`}>
          {message.sender.displayName[0]?.toUpperCase()}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="font-medium text-gray-900 dark:text-white">
            {message.sender.displayName}
          </span>
          {message.sender.role !== 'user' && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              message.sender.role === 'admin' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {message.sender.role === 'admin' ? 'Админ' : 'Модер'}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ru })}
          </span>
        </div>

        <div className="relative group/message">
          <div className={`px-4 py-2 rounded-2xl max-w-2xl ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-none'
              : 'bg-gray-200 dark:bg-dark-800 text-gray-900 dark:text-white rounded-bl-none'
          }`}>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            {message.isEdited && (
              <span className={`text-xs ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                (изменено)
              </span>
            )}
          </div>

          {/* Reaction Button */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`absolute -bottom-2 ${isOwn ? 'left-2' : 'right-2'} opacity-0 group-hover/message:opacity-100 transition-opacity bg-white dark:bg-dark-700 rounded-full p-1 shadow-lg hover:scale-110`}
          >
            <span className="text-sm">😊</span>
          </button>

          {/* Reaction Picker */}
          {showReactions && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute ${isOwn ? 'left-0' : 'right-0'} -bottom-12 bg-white dark:bg-dark-700 rounded-full shadow-lg p-2 flex gap-1 z-10`}
            >
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction(message._id, emoji)
                    setShowReactions(false)
                  }}
                  className="hover:scale-125 transition-transform text-lg p-1"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {message.reactions.map((reaction, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.1 }}
                onClick={() => onReaction(message._id, reaction.emoji)}
                className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                  reaction.users.includes(currentUserId)
                    ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
                    : 'bg-gray-100 dark:bg-dark-800'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {reaction.users.length}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}