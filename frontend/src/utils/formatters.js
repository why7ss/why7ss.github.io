export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Б'
  
  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('ru-RU').format(num)
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const generateAvatar = (name) => {
  const colors = [
    'from-red-500 to-red-700',
    'from-orange-500 to-orange-700',
    'from-yellow-500 to-yellow-700',
    'from-green-500 to-green-700',
    'from-blue-500 to-blue-700',
    'from-indigo-500 to-indigo-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700'
  ]
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}