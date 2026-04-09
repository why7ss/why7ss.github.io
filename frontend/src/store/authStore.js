import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:5000'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isFetchingUser: false,

      login: async (username, password) => {
        set({ isLoading: true })
        try {
          const { data } = await axios.post('/api/auth/login', { username, password })
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, message: error.response?.data?.message || 'Ошибка входа' }
        }
      },

      register: async (username, password, displayName, inviteCode) => {
        set({ isLoading: true })
        try {
          const { data } = await axios.post('/api/auth/register', { username, password, displayName, inviteCode })
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, message: error.response?.data?.message || 'Ошибка регистрации' }
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        localStorage.removeItem('auth-storage')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      fetchUser: async () => {
        if (get().isFetchingUser) return
        set({ isFetchingUser: true })
        try {
          const { data } = await axios.get('/api/auth/me')
          set({ user: data.user })
        } catch (error) {
          console.error('Ошибка загрузки пользователя:', error)
        } finally {
          set({ isFetchingUser: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.token
        }
      }
    }
  )
)

// Инициализация токена при загрузке
const stored = localStorage.getItem('auth-storage')
if (stored) {
  try {
    const { state } = JSON.parse(stored)
    if (state?.token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + state.token
    }
  } catch (e) {}
}