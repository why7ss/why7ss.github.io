import { create } from 'zustand'
import { io } from 'socket.io-client'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  onlineUsers: [],
  typingUsers: new Map(),
  mentionCounts: {},
  totalMentions: 0,

  connect: (token) => {
    if (get().socket?.connected) return
    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    })
    socket.on('connect', () => set({ connected: true }))
    socket.on('disconnect', () => set({ connected: false }))
    socket.on('users:online', (users) => set({ onlineUsers: users }))
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    set({ socket })
  },

  disconnect: () => {
    const socket = get().socket
    if (socket) {
      socket.disconnect()
      set({ socket: null, connected: false, onlineUsers: [], mentionCounts: {}, totalMentions: 0 })
    }
  },

  incrementMentionCount: (channel) => {
    const mentionCounts = { ...get().mentionCounts }
    mentionCounts[channel] = (mentionCounts[channel] || 0) + 1
    const totalMentions = Object.values(mentionCounts).reduce((sum, value) => sum + value, 0)
    set({ mentionCounts, totalMentions })
  },

  clearMentionCount: (channel) => {
    const mentionCounts = { ...get().mentionCounts }
    if (mentionCounts[channel]) {
      delete mentionCounts[channel]
    }
    const totalMentions = Object.values(mentionCounts).reduce((sum, value) => sum + value, 0)
    set({ mentionCounts, totalMentions })
  },

  emit: (event, data) => {
    const socket = get().socket
    console.log('emit check:', { event, connected: socket?.connected })
    if (socket?.connected) {
      console.log('Emitting:', event, data)
      socket.emit(event, data)
      return true
    } else {
      console.error('Socket not connected for emit:', event)
      return false
    }
  },

  on: (event, callback) => {
    const socket = get().socket
    if (socket) socket.on(event, callback)
  },

  off: (event, callback) => {
    const socket = get().socket
    if (socket) socket.off(event, callback)
  }
}))