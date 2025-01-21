import { useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { useAuthStore } from './store/authStore'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Players from './pages/Players'
import Stats from './pages/Stats'

function App() {
  // Use separate selectors to avoid unnecessary re-renders
  const setUser = useAuthStore(useCallback(state => state.setUser, []))
  const setInitialized = useAuthStore(useCallback(state => state.setInitialized, []))
  const initialized = useAuthStore(useCallback(state => state.initialized, []))

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [setUser, setInitialized])

  if (!initialized) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="matches" element={<Matches />} />
            <Route path="players" element={<Players />} />
            <Route path="stats" element={<Stats />} />
          </Route>
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App