import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiHome, FiMessageSquare, FiUpload, 
  FiUser, FiLogOut, FiShield, FiMessageCircle
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useSocketStore } from '../store/socketStore'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, token } = useAuthStore()
  const { socket, connect, disconnect, connected, onlineUsers, totalMentions, incrementMentionCount } = useSocketStore()

  useEffect(() => {
    if (token) {
      connect(token)
    }
    return () => disconnect()
  }, [token])

  useEffect(() => {
    if (!user?.settings) return

    if (user.settings.theme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
    document.documentElement.setAttribute('data-accent', user.settings.accentColor || 'blue')
  }, [user?.settings?.theme, user?.settings?.accentColor])

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.log('Service Worker или Notification API не поддерживаются')
      return
    }
    
    // Регистрируем Service Worker
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('✅ Service Worker зарегистрирован:', reg)
      })
      .catch(err => {
        console.error('❌ Ошибка регистрации Service Worker:', err)
      })

    console.log('Текущее разрешение на уведомления:', Notification.permission)

    // Если разрешение ещё не один раз не было запрошено, показываем предложение
    if (Notification.permission === 'default') {
      const dismissNotification = toast((t) => (
        <div className="p-3">
          <p className="font-bold mb-2">🔔 Разрешить уведомления?</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Получай мгновенные уведомления об администраторских объявлениях и упоминаниях,
            даже когда вкладка закрыта
          </p>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              Notification.requestPermission()
                .then((permission) => {
                  console.log('Результат запроса разрешения:', permission)
                  if (permission === 'granted') {
                    toast.success('✅ Уведомления включены!')
                    
                    // Подписываемся на push notifications через Service Worker
                    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                      const channel = new MessageChannel()
                      navigator.serviceWorker.controller.postMessage(
                        { type: 'SUBSCRIBE_TO_PUSH' },
                        [channel.port2]
                      )
                      
                      channel.port1.onmessage = (event) => {
                        if (event.data.success) {
                          console.log('✅ Успешно подписались на Web Push:', event.data.message)
                          toast.success('🔔 Получаешь push-уведомления на компьютер!')
                        } else {
                          console.error('❌ Ошибка подписки:', event.data.error)
                        }
                      }
                    }
                  } else if (permission === 'denied') {
                    toast.error('❌ Вы отклонили уведомления')
                  }
                })
                .catch(err => {
                  console.error('Ошибка при запросе разрешения:', err)
                  toast.error('Невозможно запросить разрешение на уведомления')
                })
            }}
            className="px-3 py-2 bg-accent-500 text-white rounded text-sm font-medium hover:bg-accent-600 transition"
          >
            Включить уведомления
          </button>
        </div>
      ), { duration: Infinity })
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const sendNativeNotification = (title, body, icon) => {
      console.log('📢 Попытка отправить уведомление:', { title, permission: Notification.permission })
      
      if (!('Notification' in window)) {
        console.warn('⚠️ Notification API не поддерживается в этом браузере')
        return false
      }
      
      if (Notification.permission !== 'granted') {
        console.warn('⚠️ Разрешение на уведомления не дано. Текущее:', Notification.permission)
        return false
      }
      
      try {
        // Приоритет 1: Используем Service Worker если доступен
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          console.log('📤 Отправляю через Service Worker')
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options: {
              body,
              icon: icon || '/favicon.ico',
              badge: '/favicon.ico',
              requireInteraction: true,
              tag: 'notification',
              timestamp: Date.now()
            }
          })
          return true
        }
        
        // Приоритет 2: Используем Notification API напрямую
        console.log('📤 Отправляю через Notification API напрямую')
        const notification = new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true,
          tag: 'notification'
        })
        
        // Обработчик клика по уведомлению
        notification.onclick = () => {
          window.focus()
          notification.close()
          window.location.href = '/'
        }
        
        return true
      } catch (err) {
        console.error('❌ Ошибка при отправке уведомления:', err)
        return false
      }
    }

    const handleAdminNotification = (notification) => {
      console.log('📨 Получено администраторское уведомление:', notification.title)
      
      const iconUrl = notification.image 
        ? `http://localhost:5000${notification.image}` 
        : '/favicon.ico'
      
      // Пытаемся отправить desktop notification
      const shown = sendNativeNotification(
        notification.title,
        notification.message,
        iconUrl
      )
      
      // Если desktop notification не получилось, показываем toast
      if (!shown) {
        console.log('📢 Fallback на toast уведомление')
        toast.custom((t) => (
          <div className={`w-full max-w-md p-4 rounded-2xl shadow-2xl ${t.visible ? 'animate-enter' : 'animate-leave'} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pointer-events-auto`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white mb-1">
                  📢 {notification.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            {notification.image && (
              <img 
                src={`http://localhost:5000${notification.image}`} 
                alt="Уведомление" 
                className="mt-4 w-full rounded-xl object-cover max-h-64"
              />
            )}
          </div>
        ), { duration: 10000 })
      }
    }

    const handleMentionNotification = (mention) => {
      if (!mention?.channel) return

      incrementMentionCount(mention.channel)
      
      const mentionText = `${mention.from?.displayName || mention.from?.username} упомянул вас в #${mention.channel}`
      console.log('🏷️ Получено упоминание:', mentionText)
      
      const shown = sendNativeNotification(
        'Вас упомянули в чате',
        mentionText
      )
      
      if (!shown) {
        toast.custom((t) => (
          <div className={`w-full max-w-md p-4 rounded-2xl shadow-2xl ${t.visible ? 'animate-enter' : 'animate-leave'} bg-white dark:bg-gray-900 border border-accent-500 dark:border-accent-500 pointer-events-auto`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏷️</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white mb-1">
                  Вас упомянули в #{mention.channel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mentionText}
                </p>
              </div>
            </div>
          </div>
        ), { duration: 10000, position: 'bottom-right' })
      }
    }

    const handlePendingNotifications = (notifications) => {
      if (!Array.isArray(notifications)) return
      notifications.forEach((notification) => {
        const shown = sendNativeNotification(
          notification.title,
          notification.message,
          notification.image ? `http://localhost:5000${notification.image}` : undefined
        )
        if (!shown) {
          toast(`${notification.title}: ${notification.message}`)
        }
      })
    }

    socket.on('admin:notification', handleAdminNotification)
    socket.on('mention:received', handleMentionNotification)
    socket.on('pending:notifications', handlePendingNotifications)
    return () => {
      socket.off('admin:notification', handleAdminNotification)
      socket.off('mention:received', handleMentionNotification)
      socket.off('pending:notifications', handlePendingNotifications)
    }
  }, [socket, incrementMentionCount])

  const handleLogout = () => {
    disconnect()
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Главная' },
    { path: '/chat', icon: FiMessageSquare, label: 'Чат', badge: totalMentions },
    { path: '/uploads', icon: FiUpload, label: 'Загрузки' },
    { path: '/tickets', icon: FiMessageCircle, label: 'Тикеты' },
    { path: '/profile', icon: FiUser, label: 'Профиль' },
  ]

  if (['admin', 'moderator'].includes(user?.role)) {
    navItems.push({ path: '/admin', icon: FiShield, label: 'Админ' })
  }

  const avatarUrl = user?.avatar ? `http://localhost:5000${user.avatar}` : null

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-accent-500">
            ForRevenge
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {connected ? 'В сети' : 'Оффлайн'}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-accent-500 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[1.35rem] h-6 rounded-full bg-red-500 text-white text-xs font-semibold px-2">
                  {item.badge}
                </span>
              )}
            </motion.button>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.displayName?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{user?.displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Онлайн: {onlineUsers.length}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FiLogOut size={18} />
            <span>Выйти</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}