import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiUpload, FiMessageSquare, FiActivity, FiTrendingUp, FiShield } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import UserTable from '../components/admin/UserTable'

const TABS = [
  { id: 'overview', name: 'Обзор', icon: FiTrendingUp },
  { id: 'users', name: 'Пользователи', icon: FiUsers }
]

export default function AdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats')
      setStats(data)
    } catch (error) {
      toast.error('Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  if (!['admin', 'moderator'].includes(user?.role)) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <FiShield className="mx-auto text-gray-400" size={64} />
          <h2 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">Доступ запрещён</h2>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Пользователей', value: stats?.overview?.totalUsers || 0, sub: `${stats?.overview?.activeUsers || 0} активных`, icon: FiUsers, color: 'from-blue-500 to-blue-600' },
    { title: 'Загрузок', value: stats?.overview?.totalUploads || 0, sub: `${stats?.overview?.pendingUploads || 0} на проверке`, icon: FiUpload, color: 'from-green-500 to-green-600' },
    { title: 'Сообщений', value: stats?.overview?.totalMessages || 0, sub: `${stats?.overview?.todayMessages || 0} сегодня`, icon: FiMessageSquare, color: 'from-purple-500 to-purple-600' }
  ]

  return (
    <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-950">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <FiShield className="text-accent-500" />
            Панель администратора
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Управление системой</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white dark:bg-gray-900 p-2 rounded-xl shadow border border-gray-200 dark:border-gray-800">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all flex-1 justify-center ${
                  activeTab === tab.id ? 'bg-accent-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-xs text-accent-500 mt-1">{stat.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiActivity className="text-accent-500" />
                Последняя активность
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(stats?.recentActivity || []).slice(0, 10).map((activity) => (
                  <div key={activity._id} className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold">
                      {activity.user?.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{activity.user?.displayName || 'Неизвестный'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleTimeString('ru-RU')}</span>
                  </div>
                ))}
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                  <p className="text-center text-gray-500 py-8">Нет активности</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserTable />}
      </div>
    </div>
  )
}