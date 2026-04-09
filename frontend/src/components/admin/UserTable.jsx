import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSearch, FiUserX, FiUserCheck, FiUserPlus, FiX, FiTrash2
} from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'user', name: 'Пользователь', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { id: 'moderator', name: 'Модератор', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { id: 'admin', name: 'Администратор', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
]

export default function UserTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    displayName: '',
    role: 'user'
  })

  useEffect(() => {
    loadUsers()
  }, [currentPage, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: currentPage, limit: 15 })
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (searchQuery) params.append('search', searchQuery)

      const { data } = await axios.get(`/api/admin/users?${params}`)
      setUsers(data.users)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleBanUser = async (userId) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${userId}/ban`)
      toast.success(data.message)
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка')
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole })
      toast.success('Роль изменена')
      loadUsers()
      setSelectedUser(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя?')) return
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      toast.success('Пользователь удалён')
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/admin/users', newUser)
      toast.success('Пользователь создан!')
      setShowCreateModal(false)
      setNewUser({ username: '', password: '', displayName: '', role: 'user' })
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка создания')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск пользователей..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          >
            <option value="all">Все роли</option>
            <option value="user">Пользователи</option>
            <option value="moderator">Модераторы</option>
            <option value="admin">Администраторы</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
          >
            <FiUserPlus size={20} />
            Создать пользователя
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Пользователь</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Роль</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Статус</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Статистика</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Дата</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => {
                  const roleInfo = ROLES.find(r => r.id === user.role)
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            user.role === 'admin' ? 'bg-red-500' : user.role === 'moderator' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {user.displayName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-white">@{user.username}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedUser(selectedUser === user._id ? null : user._id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo?.color}`}
                          >
                            {roleInfo?.name}
                          </button>
                          {selectedUser === user._id && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                              className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                            >
                              {ROLES.map((role) => (
                                <button key={role.id} onClick={() => handleChangeRole(user._id, role.id)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                                >
                                  {role.name}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Активен' : 'Заблокирован'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>💬 {user.statistics?.messagesCount || 0}</p>
                          <p>📁 {user.statistics?.uploadsCount || 0}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleBanUser(user._id)}
                          className={`p-2 rounded-lg ${user.isActive ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600' : 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600'}`}
                        >
                          {user.isActive ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                        </motion.button>
                        {user.role !== 'admin' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                          >
                            <FiTrash2 size={18} />
                          </motion.button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Создать пользователя</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase() })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    required minLength={3} maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Отображаемое имя</label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    required maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Пароль</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    required minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Роль</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  >
                    <option value="user">Пользователь</option>
                    <option value="moderator">Модератор</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Отмена
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                  >
                    Создать
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}