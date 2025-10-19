import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Stethoscope, Users, Calendar, Clock, Activity,
  Search, Plus, Bell, LogOut, Camera,
  AlertTriangle, BarChart3, User, Heart, Menu, X
} from 'lucide-react'
import Button from '@/components/ui/Button'
import QRScanner from '@/components/QRScanner'
import { PatientQRData } from '@/services/qrCodeService'
import { getMedecinData, clearMedecinData } from '@/utils/storage'

interface MedecinData {
  id: string
  medecinId: string
  nom: string
  prenom: string
  email: string
  specialite: string
  service: string
  hopital: {
    nom: string
    code: string
  }
}

interface StatCard {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}

interface Patient {
  id: string
  nom: string
  prenom: string
  age: number
  status: string
  lastVisit: string
  urgence?: boolean
}

interface RendezVous {
  id: string
  patient: string
  time: string
  type: string
  status: string
}

export default function MedecinDashboardNew() {
  const navigate = useNavigate()
  const location = useLocation()
  const [medecinData, setMedecinData] = useState<MedecinData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Données fictives enrichies
  const stats: StatCard[] = [
    {
      title: "Patients Today",
      value: "12",
      change: "+3 vs yesterday",
      icon: <Users className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Consultations",
      value: "8",
      change: "+2 vs yesterday",
      icon: <Stethoscope className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Emergencies",
      value: "2",
      change: "Stable",
      icon: <AlertTriangle className="h-6 w-6" />,
      color: "bg-red-500"
    },
    {
      title: "Satisfaction",
      value: "98%",
      change: "+2% this month",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-purple-500"
    }
  ]

  const recentPatients: Patient[] = [
    {
      id: '1',
      nom: 'KOUASSI',
      prenom: 'Marie',
      age: 45,
      status: 'In consultation',
      lastVisit: '10:30',
      urgence: false
    },
    {
      id: '2',
      nom: 'DOSSOU',
      prenom: 'Jean',
      age: 32,
      status: 'Waiting',
      lastVisit: '11:00',
      urgence: true
    },
    {
      id: '3',
      nom: 'AGBODJAN',
      prenom: 'Fatou',
      age: 28,
      status: 'Completed',
      lastVisit: '09:45',
      urgence: false
    },
    {
      id: '4',
      nom: 'TOSSOU',
      prenom: 'Paul',
      age: 67,
      status: 'Scheduled',
      lastVisit: '14:30',
      urgence: false
    }
  ]

  const prochainRendezVous: RendezVous[] = [
    {
      id: '1',
      patient: 'KOUASSI Marie',
      time: '14:00',
      type: 'Consultation',
      status: 'confirmed'
    },
    {
      id: '2',
      patient: 'DOSSOU Jean',
      time: '14:30',
      type: 'Follow-up',
      status: 'waiting'
    },
    {
      id: '3',
      patient: 'AGBODJAN Fatou',
      time: '15:00',
      type: 'Emergency',
      status: 'urgent'
    }
  ]

  useEffect(() => {
    // Récupérer les données du médecin depuis la navigation ou le stockage
    const stateData = location.state?.medecinData
    
    if (stateData) {
      setMedecinData(stateData)
    } else {
      // Utiliser l'utilitaire sécurisé pour récupérer les données
      const storedMedecinData = getMedecinData()
      
      if (storedMedecinData) {
        setMedecinData(storedMedecinData)
      } else {
        // Rediriger vers la connexion si pas de données valides
        navigate('/medecin/login')
        return
      }
    }

    setIsLoading(false)
  }, [location.state, navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    clearMedecinData()
    navigate('/medecin/login')
  }

  const handleNavClick = () => {
    // Fermer la sidebar sur mobile après navigation
    setSidebarOpen(false)
  }

  const handleQRScanSuccess = (patientData: PatientQRData) => {
    setShowQRScanner(false)
    navigate('/medecin/patient', {
      state: {
        patientData,
        medecinData
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In consultation': return 'bg-blue-100 text-blue-800'
      case 'Waiting': return 'bg-yellow-100 text-yellow-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Scheduled': return 'bg-purple-100 text-purple-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (showQRScanner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <QRScanner
              onScanSuccess={handleQRScanSuccess}
              onClose={() => setShowQRScanner(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Hedera Health</h1>
              <p className="text-xs text-gray-500">Dr. {medecinData?.prenom} {medecinData?.nom}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-white shadow-lg border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col lg:min-h-screen`}>
        {/* Logo/Header - Hidden on mobile */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Hedera Health</h1>
              <p className="text-sm text-gray-500">Interface Médecin</p>
            </div>
          </div>
        </div>

        {/* Profil médecin */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Dr. {medecinData?.prenom} {medecinData?.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {medecinData?.specialite}
              </p>
              <p className="text-xs text-blue-600 truncate">
                {medecinData?.hopital?.nom}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            
            <Link
              to="/medecin/consultation/new"
              onClick={handleNavClick}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Consultation</span>
            </Link>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Users className="h-4 w-4" />
              <span>Mes Patients</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span>Planning</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Activity className="h-4 w-4" />
              <span>Historique</span>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Outils
            </h3>
            
            <button
              onClick={() => {
                setShowQRScanner(!showQRScanner)
                handleNavClick()
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Camera className="h-4 w-4" />
              <span>Scanner QR Patient</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Search className="h-4 w-4" />
              <span>Recherche Patient</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Médecin</h1>
                <p className="text-sm text-gray-500">
                  Bienvenue, Dr. {medecinData?.prenom} {medecinData?.nom}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime.toLocaleDateString('fr-FR')}</span>
                  <span className="font-mono">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <Button size="sm" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>3</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patients Récents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Patients Récents</h2>
                  <Button size="sm" variant="outline">
                    Voir tout
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.prenom} {patient.nom}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.age} ans • {patient.lastVisit}
                          </p>
                        </div>
                        {patient.urgence && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prochains Rendez-vous */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Prochains Rendez-vous</h2>
                  <Button size="sm" variant="outline">
                    Planning
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {prochainRendezVous.map((rdv) => (
                    <div key={rdv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rdv.patient}</p>
                          <p className="text-sm text-gray-500">
                            {rdv.time} • {rdv.type}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(rdv.status)}`}>
                        {rdv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/medecin/consultation/new"
                className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Nouvelle Consultation</p>
                  <p className="text-sm text-blue-600">Créer un nouveau dossier</p>
                </div>
              </Link>

              <button
                onClick={() => setShowQRScanner(true)}
                className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Camera className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Scanner QR Patient</p>
                  <p className="text-sm text-green-600">Accès rapide au dossier</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Search className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Recherche Patient</p>
                  <p className="text-sm text-purple-600">Trouver un dossier</p>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
