import { useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './services/firebase'
import { useAuthStore } from './store/authStore'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import InstallPrompt from './components/pwa/InstallPrompt';
import OfflineIndicator from './components/pwa/OfflineIndicator';

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Players from './pages/Players'
import Stats from './pages/Stats'
import { ThemeProvider } from './providers/theme'
import { LoadingSpinner } from './components/ui/LoadingSpinner/LoadingSpinner'

function App() {
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
    return <LoadingSpinner />
  }

  return (
    <>
    <OfflineIndicator />
    <InstallPrompt />
    <ThemeProvider>
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="matches" element={<Matches />} />
                <Route path="players" element={<Players />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
    </>
  )
}

export default App