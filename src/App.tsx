import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LoginPage from './pages/login/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import UserManagement from './pages/users/UserManagement'
import PostsPage from './pages/dashboard/PostsPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import BusinessesPage from './pages/dashboard/BusinessesPage'
import CategoriesPage from './pages/dashboard/CategoriesPage'
import SettingsPage from './pages/dashboard/SettingsPage'

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="businesses" element={<BusinessesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
