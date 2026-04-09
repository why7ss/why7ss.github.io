import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Применяем тему при загрузке
const savedAuth = localStorage.getItem('auth-storage')
if (savedAuth) {
  try {
    const { state } = JSON.parse(savedAuth)
    const settings = state?.user?.settings
    
    // Тема
    if (settings?.theme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    }
    
    // Цвет акцента
    if (settings?.accentColor) {
      document.documentElement.setAttribute('data-accent', settings.accentColor)
    }
  } catch (e) {
    document.documentElement.classList.add('dark')
  }
} else {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)