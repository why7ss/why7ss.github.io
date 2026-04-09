// Service Worker для фоновых уведомлений
console.log('🔧 Service Worker загружен')

self.addEventListener('message', (event) => {
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data
    console.log('📩 Получено сообщение для отправки уведомления:', title)
    
    try {
      self.registration.showNotification(title, {
        ...options,
        timestamp: Date.now()
      })
      console.log('✅ Уведомление успешно показано:', title)
    } catch (err) {
      console.error('❌ Ошибка при показе уведомления:', err)
    }
  }
  
  // Обработка запроса на подписку на push notifications
  if (event.data.type === 'SUBSCRIBE_TO_PUSH') {
    console.log('🔔 Запрос на подписку на push notifications')
    subscribeToPush(event.ports[0])
  }
})

async function subscribeToPush(port) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Токен авторизации не найден')
    }

    // Получаем VAPID ключ с сервера
    const response = await fetch('/api/users/push-vapid-key', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Не удалось получить VAPID ключ')
    }
    
    const { vapidPublicKey } = await response.json()
    
    // Подписываемся на push notifications
    const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })
    
    // Отправляем subscription на сервер
    const subResponse = await fetch('/api/users/push-subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription })
    })
    
    if (subResponse.ok) {
      console.log('✅ Успешно подписались на push notifications')
      if (port) {
        port.postMessage({ success: true, message: 'Подписаны на push notifications' })
      }
    } else {
      throw new Error(`Ошибка сервера: ${subResponse.status}`)
    }
  } catch (error) {
    console.error('❌ Ошибка при подписке на push notifications:', error)
    if (port) {
      port.postMessage({ success: false, error: error.message })
    }
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

self.addEventListener('push', (event) => {
  console.log('📨 Получено push событие')
  
  if (!event.data) {
    console.warn('⚠️ Push событие без данных')
    return
  }

  try {
    const data = event.data.json()
    console.log('📦 Данные push уведомления:', data.title)
    
    const options = {
      body: data.message || data.body || '',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'notification',
      requireInteraction: true,
      timestamp: Date.now(),
      actions: [
        {
          action: 'open',
          title: 'Открыть'
        },
        {
          action: 'close',
          title: 'Закрыть'
        }
      ]
    }

    if (data.image) {
      options.image = data.image
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'ForRevenge', options)
    )
    
    console.log('✅ Push уведомление показано')
  } catch (error) {
    console.error('❌ Ошибка обработки push уведомления:', error)
    event.waitUntil(
      self.registration.showNotification('ForRevenge', {
        body: 'Новое уведомление',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    )
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('👆 Клик по уведомлению: ' + event.action)
  
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Пытаемся найти уже открытое окно приложения
      for (let client of clientList) {
        if (client.url.includes(self.location.origin)) {
          if ('focus' in client) {
            console.log('🔍 Найдено открытое окно, фокусируем его')
            return client.focus()
          }
        }
      }
      
      // Если окна нет, открываем новое
      console.log('📂 Открываем новое окно приложения')
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('❌ Уведомление закрыто: ' + event.notification.tag)
})

self.addEventListener('install', (event) => {
  console.log('📥 Service Worker установлен')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker активирован')
  event.waitUntil(clients.claim())
})
