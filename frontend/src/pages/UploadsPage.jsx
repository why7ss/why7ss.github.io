import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUpload, FiFile, FiImage, FiVideo, FiArchive, 
  FiCode, FiSearch, FiPlus, FiEye, FiDownload,
  FiTrash2, FiCheck, FiX, FiClock
} from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import UploadModal from '../components/upload/UploadModal'

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: FiFile },
  { id: 'document', name: 'Документы', icon: FiFile },
  { id: 'image', name: 'Изображения', icon: FiImage },
  { id: 'video', name: 'Видео', icon: FiVideo },
  { id: 'archive', name: 'Архивы', icon: FiArchive },
  { id: 'code', name: 'Код', icon: FiCode },
  { id: 'other', name: 'Другое', icon: FiFile }
]

const STATUS_BADGES = {
  pending: { label: 'На проверке', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: FiClock },
  approved: { label: 'Одобрено', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: FiCheck },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FiX }
}

export default function UploadsPage() {
  const { user } = useAuthStore()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingUploads, setIsLoadingUploads] = useState(false)
  const [deleteUploadId, setDeleteUploadId] = useState(null)

  const isAdmin = ['admin', 'moderator'].includes(user?.role)

  useEffect(() => {
    loadUploads()
  }, [selectedCategory, selectedStatus])

  const loadUploads = async () => {
    if (isLoadingUploads) return
    try {
      setIsLoadingUploads(true)
      const params = new URLSearchParams({ limit: 50 })
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all' && isAdmin) params.append('status', selectedStatus)

      const { data } = await axios.get(`/api/uploads?${params}`)
      setUploads(data.uploads)
    } catch (error) {
      toast.error('Ошибка загрузки')
    } finally {
      setLoading(false)
      setIsLoadingUploads(false)
    }
  }

  const handleDelete = (uploadId) => {
    setDeleteUploadId(uploadId)
  }

  const confirmDelete = async () => {
    if (!deleteUploadId) return
    try {
      await axios.delete(`/api/uploads/${deleteUploadId}`)
      toast.success('Загрузка удалена')
      loadUploads()
    } catch (error) {
      toast.error('Ошибка удаления')
    } finally {
      setDeleteUploadId(null)
    }
  }

  const cancelDelete = () => {
    setDeleteUploadId(null)
  }

  const handleReview = async (uploadId, status) => {
    try {
      await axios.put(`/api/uploads/${uploadId}/review`, { status })
      toast.success(status === 'approved' ? 'Одобрено!' : 'Отклонено')
      loadUploads()
    } catch (error) {
      toast.error('Ошибка')
    }
  }

  const handleDownload = (uploadId, fileIndex) => {
    window.open(`http://localhost:5000/api/uploads/${uploadId}/download/${fileIndex}`, '_blank')
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Б'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
    return (bytes / 1024 / 1024).toFixed(2) + ' МБ'
  }

  const filteredUploads = uploads.filter(u => u.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-950">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Загрузки</h1>
            <p className="text-gray-600 dark:text-gray-400">Управление файлами</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-accent-500 text-white rounded-lg font-medium shadow-lg hover:bg-accent-600 text-lg"
          >
            <FiPlus size={20} />
            Загрузить
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === cat.id ? 'bg-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <cat.icon size={16} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
            {isAdmin && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
              >
                <option value="all">Все статусы</option>
                <option value="pending">На проверке</option>
                <option value="approved">Одобренные</option>
                <option value="rejected">Отклоненные</option>
              </select>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="text-center py-16">
            <FiUpload className="mx-auto text-gray-400" size={64} />
            <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">Нет загрузок</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUploads.map((upload) => {
              const StatusBadge = STATUS_BADGES[upload.status]
              const StatusIcon = StatusBadge?.icon

              return (
                <motion.div
                  key={upload._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                          <FiFile className="text-accent-500" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{upload.title}</h3>
                          <p className="text-sm text-gray-500">{upload.files?.length || 0} файл(ов)</p>
                          <p className="text-sm text-gray-500">
                            Загрузил: {upload.uploadedBy?.displayName || upload.uploadedBy?.username || 'Неизвестный'}
                            {upload.uploadedBy?.username ? ` (@${upload.uploadedBy.username})` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${StatusBadge?.color}`}>
                        {StatusIcon && <StatusIcon size={12} />}
                        {StatusBadge?.label}
                      </span>
                    </div>

                    {/* Files with download */}
                    <div className="space-y-2 mb-4">
                      {upload.files?.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FiFile className="text-gray-400 flex-shrink-0" size={16} />
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.originalName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            <button
                              onClick={() => handleDownload(upload._id, idx)}
                              className="p-1.5 hover:bg-accent-100 dark:hover:bg-accent-900/30 text-accent-500 rounded transition-colors"
                              title="Скачать"
                            >
                              <FiDownload size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><FiEye size={14} /> {upload.views || 0}</span>
                        <span className="flex items-center gap-1"><FiDownload size={14} /> {upload.downloads || 0}</span>
                      </div>
                      <span>{new Date(upload.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {isAdmin && upload.status === 'pending' && (
                        <>
                          <button onClick={() => handleReview(upload._id, 'approved')} className="min-w-[130px] flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                            <FiCheck size={16} /> Одобрить
                          </button>
                          <button onClick={() => handleReview(upload._id, 'rejected')} className="min-w-[130px] flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
                            <FiX size={16} /> Отклонить
                          </button>
                        </>
                      )}
                      {(isAdmin || upload.uploadedBy?._id === user?._id) && (
                        <button onClick={() => handleDelete(upload._id)} className="py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 hover:text-red-600 rounded-lg flex items-center justify-center gap-2">
                          <FiTrash2 size={18} /> Удалить
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <UploadModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); loadUploads(); }} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteUploadId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Подтвердите удаление</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Вы действительно хотите удалить эту загрузку? Это действие нельзя отменить.</p>
              <div className="flex gap-3">
                <button onClick={cancelDelete} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl">
                  Отмена
                </button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl">
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}