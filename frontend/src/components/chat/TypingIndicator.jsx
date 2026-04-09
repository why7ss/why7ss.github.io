import { motion } from 'framer-motion'

export default function TypingIndicator({ users }) {
  if (users.length === 0) return null

  const text = users.length === 1 
    ? `${users[0]} печатает...`
    : users.length === 2
    ? `${users[0]} и ${users[1]} печатают...`
    : `${users[0]} и еще ${users.length - 1} печатают...`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-800 flex items-center justify-center">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
            />
          ))}
        </div>
      </div>
      <div className="px-4 py-2 bg-gray-200 dark:bg-dark-800 rounded-2xl rounded-bl-none">
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">{text}</p>
      </div>
    </motion.div>
  )
}