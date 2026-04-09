import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { FiX, FiUpload, FiFile, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'document', name: 'Документ' },
  { id: 'image', name: 'Изображение' },
  { id: 'video', name: 'Видео' },
  { id: 'archive', name: 'Архив' },
  { id: 'code', name: 'Код' },
  { id: 'other', name: 'Другое' }
]

export default function UploadModal({ onClose, onSuccess }) {
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'document',
    tags: ''
  })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 5))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024
  })

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (files.length === 0) {
      toast.error('Добавьте хотя бы один файл')
      return
    }

    if (!formData.title.trim()) {
      toast.error('Введите название')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('category', formData.category)
      data.append('tags', formData.tags)
      
      files.forEach(file => {
        data.append('files', file)
      })

      await axios.post('/api/uploads', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percentCompleted)
        }
      })

      toast.success('Файлы успешно загружены!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Б'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
    return (bytes / 1024 / 1024).toFixed(2) + ' МБ'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Загрузить файлы</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${
              isDragActive
                ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-accent-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto text-gray-400 mb-4" size={48} />
            {isDragActive ? (
              <p className="text-accent-500 font-medium">Отпустите файлы...</p>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Перетащите файлы или нажмите для выбора
                </p>
                <p className="text-gray-500 text-sm">Максимум 5 файлов, до 10 МБ каждый</p>
              </>
            )}
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Выбрано: {files.length}/5
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FiFile className="text-gray-400 flex-shrink-0" size={20} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Название *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none text-gray-900 dark:text-white"
                placeholder="Название загрузки"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none text-gray-900 dark:text-white resize-none"
                placeholder="Описание файлов..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Категория</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      formData.category === cat.id
                        ? 'bg-accent-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Теги (через запятую)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none text-gray-900 dark:text-white"
                placeholder="важное, работа, проект"
              />
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Загрузка...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-accent-500"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={uploading || files.length === 0}
            className="px-6 py-2.5 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Загрузка...
              </>
            ) : (
              <>
                <FiUpload size={18} />
                Загрузить
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}