import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiCopy, FiTrash2, FiClock, FiCheck, FiX } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function InviteManager() {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInvite, setNewInvite] = useState({
    maxUses: 1,
    expiresIn: 7
  })

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    try {
      const { data } = await axios.get('/api/invites')
      setInvites(data.invites)
    } catch (error) {
      toast.error('Ошибка загрузки кодов')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const { data } = await axios.post('/api/invites', newInvite)
      toast.success('Код создан!')
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.invite.code)
      toast.success('Код скопирован в буфер обмена')
      
      loadInvites()
      setShowCreateModal(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка создания')
    }
  }

  const handleDelete = async (code) => {
    if (!confirm('Удалить этот код?')) return

    try {
      await axios.delete(`/api/invites/${code}`)
      toast.success('Код удалён')
      loadInvites()
    } catch (error) {
      toast.error('Ошибка удаления')
    }
  }

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    toast.success('Код скопирован!')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Коды приглашений
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Управление кодами для регистрации
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <FiPlus size={20} />
          Создать код
        </motion.button>
      </div>

      {/* Invites Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : invites.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-xl">
          <FiPlus className="mx-auto text-gray-400" size={64} />
          <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
            Нет кодов приглашений
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Создайте первый код для приглашения пользователей
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invites.map((invite) => (
            <motion.div
              key={invite._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white dark:bg-dark-900 rounded-xl shadow-lg border p-6 ${
                invite.isActive && invite.currentUses < invite.maxUses
                  ? 'border-green-500/50'
                  : 'border-gray-200 dark:border-dark-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <code className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                  {invite.code}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyCode(invite.code)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                    title="Копировать"
                  >
                    <FiCopy size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(invite.code)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <FiTrash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Использований</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invite.currentUses} / {invite.maxUses}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Статус</span>
                  <span className={`flex items-center gap-1 font-medium ${
                    invite.isActive && invite.currentUses < invite.maxUses
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {invite.isActive && invite.currentUses < invite.maxUses ? (
                      <>
                        <FiCheck size={14} />
                        Активен
                      </>
                    ) : (
                      <>
                        <FiX size={14} />
                        Неактивен
                      </>
                    )}
                  </span>
                </div>

                {invite.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Истекает</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true, locale: ru })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Создатель</span>
                  <span className="text-gray-900 dark:text-white">
                    {invite.createdBy?.displayName || 'Неизвестно'}
                  </span>
                </div>

                {invite.usedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Использован</span>
                    <span className="text-gray-900 dark:text-white">
                      {invite.usedBy.displayName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Создать код приглашения
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Максимум использований
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newInvite.maxUses}
                    onChange={(e) => setNewInvite({ ...newInvite, maxUses: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Срок действия (дней)
                  </label>
                  <select
                    value={newInvite.expiresIn}
                    onChange={(e) => setNewInvite({ ...newInvite, expiresIn: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value={1}>1 день</option>
                    <option value={7}>7 дней</option>
                    <option value={30}>30 дней</option>
                    <option value={90}>90 дней</option>
                    <option value={0}>Без срока</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                >
                  Отмена
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Создать
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}