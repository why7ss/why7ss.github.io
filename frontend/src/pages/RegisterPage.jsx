import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUserPlus, FiUser, FiLock, FiKey, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    inviteCode: ''
  })
  const [validatingCode, setValidatingCode] = useState(false)
  const [codeValid, setCodeValid] = useState(null)

  const validateInviteCode = async (code) => {
    if (!code || code.length < 6) {
      setCodeValid(null)
      return
    }

    setValidatingCode(true)
    try {
      const { data } = await axios.post('/api/invites/validate', { code })
      setCodeValid(data.valid)
    } catch (error) {
      setCodeValid(false)
    } finally {
      setValidatingCode(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!codeValid) {
      toast.error('Пожалуйста, введите действительный код приглашения')
      return
    }

    const result = await register(
      formData.username,
      formData.password,
      formData.displayName,
      formData.inviteCode
    )
    
    if (result.success) {
      toast.success('Регистрация успешна!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-dark-900 to-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <FiUserPlus className="text-white" size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Регистрация
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Создайте свой аккаунт
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Код приглашения
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.inviteCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase()
                    setFormData({ ...formData, inviteCode: code })
                    validateInviteCode(code)
                  }}
                  className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-dark-700 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                    codeValid === true ? 'border-green-500' : 
                    codeValid === false ? 'border-red-500' : 
                    'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="XXXXXXXX"
                  required
                />
                {validatingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  </div>
                )}
                {!validatingCode && codeValid === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</div>
                )}
                {!validatingCode && codeValid === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">✗</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Отображаемое имя
              </label>
              <div className="relative">
                <FiEye className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Как вас будут видеть другие"
                  required
                  minLength={1}
                  maxLength={30}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="username"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_]+"
                  title="Только буквы, цифры и подчеркивания"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Только администраторы будут знать ваш username
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !codeValid}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 font-medium"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}