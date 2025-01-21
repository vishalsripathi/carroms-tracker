import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCallback } from 'react'

const ProtectedRoute = () => {
  const user = useAuthStore(useCallback(state => state.user, []))
  const initialized = useAuthStore(useCallback(state => state.initialized, []))

  if (!initialized) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute