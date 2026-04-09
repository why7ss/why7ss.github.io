import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMessageSquare, FiUpload, FiUsers, FiActivity } from 'react-icons/fi'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { onlineUsers } = useSocketStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/auth/me')
      setStats(data.user.statistics)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Сообщений', value: stats?.messagesCount || 0, icon: FiMessageSquare, color: 'from-blue-500 to-blue-600' },
    { title: 'Загрузок', value: stats?.uploadsCount || 0, icon: FiUpload, color: 'from-green-500 to-green-600' },
    { title: 'Онлайн', value: onlineUsers.length, icon: FiUsers, color: 'from-purple-500 to-purple-600' },
    { title: 'Входов', value: stats?.loginCount || 0, icon: FiActivity, color: 'from-orange-500 to-orange-600' }
  ]

  return (
    <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-950">
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Добро пожаловать, {user?.displayName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Вот что происходит</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiUsers className="text-accent-500" />
              Онлайн ({onlineUsers.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {onlineUsers.length > 0 ? onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                      {u.displayName?.[0]?.toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{u.displayName}</p>
                    {u.role !== 'user' && <p className="text-xs text-accent-500">{u.role}</p>}
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">Никого нет</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">Ваш профиль</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm mb-1">Имя</p>
                  <p className="font-medium">{user?.displayName}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-1">Роль</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Быстрые действия</h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => navigate('/chat')}
                  className="cursor-pointer flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <FiMessageSquare className="text-blue-500" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Чат</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Общение</p>
                  </div>
                </div>
                <div
                  onClick={() => navigate('/uploads')}
                  className="cursor-pointer flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <FiUpload className="text-green-500" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Загрузить</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Файлы</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}