import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiAlertTriangle, FiZap, FiHelpCircle, FiPlus, FiX, FiTrash2,
  FiMessageCircle, FiClock, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const TICKET_TYPES = [
  { id: 'bug', name: 'Баг сайта', icon: FiAlertTriangle, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
  { id: 'idea', name: 'Идея', icon: FiZap, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'question', name: 'Вопрос', icon: FiHelpCircle, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' }
]

const STATUS_INFO = {
  open: { name: 'Открыт', color: 'bg-blue-500', icon: FiClock },
  in_progress: { name: 'В работе', color: 'bg-yellow-500', icon: FiAlertCircle },
  resolved: { name: 'Решён', color: 'bg-green-500', icon: FiCheckCircle },
  closed: { name: 'Закрыт', color: 'bg-gray-500', icon: FiX }
}

export default function TicketsPage() {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newTicket, setNewTicket] = useState({ title: '', description: '', type: 'bug' })
  const [replyContent, setReplyContent] = useState('')
  const [filter, setFilter] = useState('all')

  const isAdmin = ['admin', 'moderator'].includes(user?.role)

  useEffect(() => {
    loadTickets()
  }, [filter])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      
      const { data } = await axios.get(`/api/tickets?${params}`)
      setTickets(data.tickets)
    } catch (error) {
      toast.error('Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetails = async (id) => {
    try {
      const { data } = await axios.get(`/api/tickets/${id}`)
      setSelectedTicket(data.ticket)
    } catch (error) {
      toast.error('Ошибка загрузки тикета')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/tickets', newTicket)
      toast.success('Тикет создан!')
      setShowCreateModal(false)
      setNewTicket({ title: '', description: '', type: 'bug' })
      loadTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка')
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    
    try {
      const { data } = await axios.post(`/api/tickets/${selectedTicket._id}/reply`, {
        content: replyContent
      })
      setSelectedTicket(data.ticket)
      setReplyContent('')
      toast.success('Ответ добавлен!')
    } catch (error) {
      toast.error('Ошибка')
    }
  }

  const handleChangeStatus = async (status) => {
    try {
      const { data } = await axios.put(`/api/tickets/${selectedTicket._id}/status`, { status })
      setSelectedTicket({ ...selectedTicket, status: data.ticket.status })
      loadTickets()
      toast.success('Статус обновлён')
    } catch (error) {
      toast.error('Ошибка')
    }
  }

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Удалить тикет?')) return
    try {
      await axios.delete(`/api/tickets/${ticketId}`)
      toast.success('Тикет удалён')
      setSelectedTicket(null)
      loadTickets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка удаления')
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Тикеты</h1>
            <p className="text-gray-600 dark:text-gray-400">Баги сайта, идеи и вопросы</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-lg font-medium"
          >
            <FiPlus size={20} />
            Создать тикет
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-accent-500 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              {status === 'all' ? 'Все' : STATUS_INFO[status]?.name}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FiMessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Нет тикетов</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const typeInfo = TICKET_TYPES.find(t => t.id === ticket.type)
              const statusInfo = STATUS_INFO[ticket.status]
              const TypeIcon = typeInfo?.icon || FiAlertTriangle
              
              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => loadTicketDetails(ticket._id)}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${typeInfo?.color}`}>
                      <TypeIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{ticket.title}</h3>
                      <p className="text-sm text-gray-500">{ticket.createdBy?.displayName}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo?.color}`}>
                      {statusInfo?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ticket.replies?.length || 0} ответов
                    </span>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Новый тикет</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <FiX size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Тип</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TICKET_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setNewTicket({ ...newTicket, type: type.id })}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            newTicket.type === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Icon size={20} className={type.color.split(' ')[0]} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Заголовок</label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                    required
                    placeholder="Введите заголовок"
                    minLength={3}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Описание</label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white resize-none"
                    rows={4}
                    placeholder="Введите текст"
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Создать
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const typeInfo = TICKET_TYPES.find(t => t.id === selectedTicket.type)
                        const Icon = typeInfo?.icon || FiAlertTriangle
                        return <span className={`p-1 rounded ${typeInfo?.color}`}><Icon size={16} /></span>
                      })()}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${STATUS_INFO[selectedTicket.status]?.color}`}>
                        {STATUS_INFO[selectedTicket.status]?.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTicket.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      от {selectedTicket.createdBy?.displayName} • {new Date(selectedTicket.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <FiX size={20} className="text-gray-500" />
                  </button>
                </div>
                
                {isAdmin && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleChangeStatus(status)}
                        disabled={selectedTicket.status === status}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          selectedTicket.status === status
                            ? `${STATUS_INFO[status]?.color} text-white`
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {STATUS_INFO[status]?.name}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDeleteTicket(selectedTicket._id)}
                      className="px-3 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600"
                    >
                      <FiTrash2 size={14} /> Удалить
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((reply, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${
                    ['admin', 'moderator'].includes(reply.author?.role)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{reply.author?.displayName}</span>
                      {['admin', 'moderator'].includes(reply.author?.role) && (
                        <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded">Команда</span>
                      )}
                      <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Написать ответ..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    Отправить
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}