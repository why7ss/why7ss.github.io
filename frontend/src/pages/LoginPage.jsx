import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLogIn, FiUser, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(formData.username, formData.password)
    if (result.success) {
      toast.success('Вход выполнен!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiLogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ForRevenge</h1>
            <p className="text-gray-400">Войдите в свой аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  placeholder="Введите имя"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                  placeholder="Введите пароль"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}