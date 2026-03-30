import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import DashboardHome from './pages/DashboardHome'
import Placeholder from './pages/Placeholder'
import ClientsList from './pages/clients/ClientsList'
import ClientDetail from './pages/clients/ClientDetail'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="submissions" element={<Placeholder />} />
            <Route path="carriers" element={<Placeholder />} />
            <Route path="proposals" element={<Placeholder />} />
            <Route path="leads" element={<Placeholder />} />
            <Route path="reports" element={<Placeholder />} />
            <Route path="settings" element={<Placeholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
