import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUser, FiLock, FiSettings, FiBell, FiVolume2, 
  FiMoon, FiSun, FiSave, FiMessageSquare, FiUpload, 
  FiCamera, FiCheck
} from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const ACCENT_COLORS = [
  { id: 'blue', name: 'Синий' },
  { id: 'red', name: 'Красный' },
  { id: 'green', name: 'Зелёный' },
  { id: 'yellow', name: 'Жёлтый' },
  { id: 'purple', name: 'Фиолетовый' },
  { id: 'pink', name: 'Розовый' },
  { id: 'orange', name: 'Оранжевый' },
  { id: 'cyan', name: 'Голубой' }
]

const COLOR_CLASSES = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500'
}

export default function ProfilePage() {
  const { user, updateUser, fetchUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  
  const [profileData, setProfileData] = useState({ displayName: '' })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    theme: 'dark',
    accentColor: 'blue'
  })

  useEffect(() => {
    if (user) {
      setProfileData({ displayName: user.displayName || '' })
      setSettings({
        notifications: user.settings?.notifications ?? true,
        soundEnabled: user.settings?.soundEnabled ?? true,
        theme: user.settings?.theme || 'dark',
        accentColor: user.settings?.accentColor || 'blue'
      })
    }
  }, [user])

  useEffect(() => {
    fetchUser()
  }, [])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast.error('Только изображения!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой (максимум 5MB)')
      return
    }

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const { data } = await axios.post('/api/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Обновляем пользователя с новым аватаром
      updateUser({ avatar: data.avatar })
      
      // Перезагружаем данные пользователя
      await fetchUser()
      
      toast.success('Аватар обновлён!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Ошибка загрузки')
    } finally {
      setUploadingAvatar(false)
      // Сбрасываем input чтобы можно было загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.put('/api/auth/profile', profileData)
      updateUser(data.user)
      toast.success('Профиль обновлён!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Пароль изменён!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    setLoading(true)
    try {
      const { data } = await axios.put('/api/auth/settings', settings)
      updateUser({ settings: data.settings })
      
      // Применяем тему
      if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      } else {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      }
      
      // Применяем цвет
      document.documentElement.setAttribute('data-accent', settings.accentColor)
      
      toast.success('Настройки сохранены!')
    } catch (error) {
      toast.error('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Профиль', icon: FiUser },
    { id: 'security', name: 'Безопасность', icon: FiLock },
    { id: 'settings', name: 'Настройки', icon: FiSettings }
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    )
  }

  // Генерируем URL с timestamp чтобы избежать кеширования
  const avatarUrl = user.avatar 
    ? `http://localhost:5000${user.avatar}?t=${Date.now()}` 
    : null

  return (
    <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Настройки профиля</h1>
          <p className="text-gray-600 dark:text-gray-400">Управление вашим аккаунтом</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent-500 rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold overflow-hidden border-4 border-white/30">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <span className={avatarUrl ? 'hidden' : 'flex'}>
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center cursor-pointer"
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <FiCamera size={32} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold">{user.displayName}</h2>
              <p className="opacity-80">@{user.username}</p>
              <p className="opacity-80 mt-1 capitalize">{user.role}</p>
            </div>
          </div>
          
          <div className="relative grid grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FiMessageSquare size={20} />
                <span className="text-2xl font-bold">{user.statistics?.messagesCount || 0}</span>
              </div>
              <p className="opacity-80 text-sm">Сообщений</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FiUpload size={20} />
                <span className="text-2xl font-bold">{user.statistics?.uploadsCount || 0}</span>
              </div>
              <p className="opacity-80 text-sm">Загрузок</p>
            </div>
            <div className="text-center">
              <p className="opacity-80 text-sm">Дата регистрации</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-500 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6"
        >
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Отображаемое имя
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-500 outline-none text-gray-900 dark:text-white"
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-accent-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiSave size={18} /> Сохранить</>}
              </motion.button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Текущий пароль</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Новый пароль</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Подтвердите</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-accent-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiLock size={18} /> Изменить пароль</>}
              </motion.button>
            </form>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiBell className="text-accent-500" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Уведомления</p>
                    <p className="text-sm text-gray-500">Получать уведомления</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${settings.notifications ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.notifications ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Sound */}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiVolume2 className="text-accent-500" size={24} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Звуки</p>
                    <p className="text-sm text-gray-500">Звуковые эффекты</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${settings.soundEnabled ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.soundEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.theme === 'dark' ? <FiMoon className="text-accent-500" size={24} /> : <FiSun className="text-yellow-500" size={24} />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Тема</p>
                    <p className="text-sm text-gray-500">{settings.theme === 'dark' ? 'Тёмная' : 'Светлая'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-accent-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.theme === 'dark' ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Accent Color */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-4">🎨 Цвет темы</p>
                <div className="grid grid-cols-4 gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSettings({ ...settings, accentColor: color.id })}
                      className={`relative h-14 rounded-xl ${COLOR_CLASSES[color.id]} transition-all hover:scale-105 ${
                        settings.accentColor === color.id 
                          ? 'ring-4 ring-white dark:ring-gray-900 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 scale-105' 
                          : ''
                      }`}
                      title={color.name}
                    >
                      {settings.accentColor === color.id && (
                        <FiCheck className="absolute inset-0 m-auto text-white drop-shadow-lg" size={28} />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center font-medium">
                  Выбрано: {ACCENT_COLORS.find(c => c.id === settings.accentColor)?.name}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateSettings}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-accent-500 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><FiSave size={18} /> Сохранить настройки</>}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}