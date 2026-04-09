import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiActivity, FiFilter, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

const ACTION_LABELS = {
  login: { label: 'Вход', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  logout: { label: 'Выход', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  register: { label: 'Регистрация', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  message_sent: { label: 'Сообщение', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  upload_created: { label: 'Загрузка', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  user_banned: { label: 'Блокировка', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  user_unbanned: { label: 'Разблокировка', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  invite_created: { label: 'Создан код', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  settings_changed: { label: 'Настройки', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
}

const SEVERITY_COLORS = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-400',
  critical: 'border-l-red-400'
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadLogs()
  }, [currentPage, actionFilter, severityFilter])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 30
      })
      
      if (actionFilter !== 'all') {
        params.append('action', actionFilter)
      }
      if (severityFilter !== 'all') {
        params.append('severity', severityFilter)
      }

      const { data } = await axios.get(`/api/admin/logs?${params}`)
      setLogs(data.logs)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Ошибка загрузки логов')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Filters */}
      <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-800">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">Все действия</option>
            <option value="login">Входы</option>
            <option value="register">Регистрации</option>
            <option value="message_sent">Сообщения</option>
            <option value="upload_created">Загрузки</option>
            <option value="user_banned">Блокировки</option>
            <option value="invite_created">Коды приглашений</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="all">Все уровни</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium"
          >
            <FiRefreshCw size={18} />
            Обновить
          </motion.button>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-gray-200 dark:border-dark-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <FiActivity className="mx-auto text-gray-400" size={64} />
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
              Нет записей
            </h3>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-800">
            {logs.map((log, index) => {
              const actionInfo = ACTION_LABELS[log.action] || { 
                label: log.action, 
                color: 'bg-gray-100 text-gray-700' 
              }
              
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors border-l-4 ${SEVERITY_COLORS[log.severity]}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {log.user?.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.user?.displayName || 'Неизвестный'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionInfo.color}`}>
                          {actionInfo.label}
                        </span>
                        {log.user?.role !== 'user' && (
                          <span className="text-xs text-primary-500 capitalize">
                            {log.user?.role}
                          </span>
                        )}
                      </div>
                      
                      {log.details?.path && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {log.details.method} {log.details.path}
                        </p>
                      )}
                      
                      {log.ipAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </div>
                    
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ru })}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-dark-800">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}