import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import UploadsPage from './pages/UploadsPage'
import AdminPage from './pages/AdminPage'
import ProfilePage from './pages/ProfilePage'
import TicketsPage from './pages/TicketsPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
        } />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="uploads" element={<UploadsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tickets" element={<TicketsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App