import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Trails from './pages/Trails'
import TrailDetail from './pages/TrailDetail'
import Pivots from './pages/Pivots'
import Profile from './pages/Profile'
import PasswordChange from './components/PasswordChange'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex h-screen bg-dark-graphite text-white">
      {isAuthenticated && <Sidebar />}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/trails" element={<PrivateRoute><Trails /></PrivateRoute>} />
          <Route path="/trails/:id" element={<PrivateRoute><TrailDetail /></PrivateRoute>} />
          <Route path="/pivots" element={<PrivateRoute><Pivots /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/password" element={<PrivateRoute><PasswordChange /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
