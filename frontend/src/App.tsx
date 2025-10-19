import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PatientLogin from './pages/PatientLogin'
import PatientDashboard from './pages/PatientDashboard'
import PatientRegistration from './pages/PatientRegistration'
import PatientIdGeneration from './pages/PatientIdGeneration'
import MedecinLogin from './pages/MedecinLogin'
import MedecinDashboard from './pages/MedecinDashboardModern'
import PatientRecord from './pages/PatientRecord'
import NewConsultation from './pages/NewConsultation'
import HospitalDashboard from './pages/HospitalDashboard'
import HospitalLogin from './pages/HospitalLogin'
import USSDPage from './pages/USSDPage'
import ProtectedRoute from './components/ProtectedRoute'
import PWAInstallBanner from './components/pwa/PWAInstallBanner'
import PWAStatus from './components/pwa/PWAStatus'
import MobileOptimizer from './components/mobile/MobileOptimizer'

function App() {
  return (
    <MobileOptimizer>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ussd" element={<USSDPage />} />
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/patient/register" element={<PatientRegistration />} />
            <Route path="/patient/id-generated" element={<PatientIdGeneration />} />
            <Route path="/patient/dashboard" element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/*" element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/medecin/login" element={<MedecinLogin />} />
            <Route path="/medecin/dashboard" element={<MedecinDashboard />} />
            <Route path="/medecin/patient" element={<PatientRecord />} />
            <Route path="/medecin/consultation/new" element={<NewConsultation />} />
            <Route path="/medecin/*" element={<MedecinDashboard />} />
            <Route path="/hospital/login" element={<HospitalLogin />} />
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          </Routes>

          {/* PWA Components */}
          <PWAInstallBanner />
          <PWAStatus />
        </div>
      </Router>
    </MobileOptimizer>
  )
}

export default App
