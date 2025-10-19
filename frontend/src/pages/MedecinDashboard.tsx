import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Stethoscope, ArrowLeft, Users, Calendar, Clock, Activity,
  Search, Plus, Bell, LogOut, TrendingUp, Camera,
  AlertTriangle, CheckCircle, BarChart3, User
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import QRScanner from '@/components/QRScanner'
import { PatientQRData } from '@/services/qrCodeService'
import { getMedecinData, clearMedecinData } from '@/utils/storage'
// import { useApi } from '@/services/api'

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
  lastLogin?: string
}

interface DailyStats {
  consultationsToday: number
  patientsVus: number
  rdvProgrammes: number
  urgences: number
}

interface Patient {
  id: string
  patientId: string
  nom: string
  prenom: string
  age: number
  lastConsultation?: string
  status: 'normal' | 'urgent' | 'critique'
}

interface RendezVous {
  id: string
  patientNom: string
  patientPrenom: string
  heure: string
  type: string
  status: 'confirme' | 'en_attente' | 'annule'
}

export default function MedecinDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  // const api = useApi() // Pour les futures intégrations API

  const [medecinData, setMedecinData] = useState<MedecinData | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const [todayAppointments, setTodayAppointments] = useState<RendezVous[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

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

    loadDashboardData()
  }, [location.state, navigate])

  useEffect(() => {
    // Mise à jour de l'heure toutes les minutes
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Simulation des données - en production, appeler les APIs
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDailyStats({
        consultationsToday: 12,
        patientsVus: 8,
        rdvProgrammes: 6,
        urgences: 2
      })

      setRecentPatients([
        {
          id: '1',
          patientId: 'BJ2025001',
          nom: 'KOSSOU',
          prenom: 'Adjoa',
          age: 34,
          lastConsultation: '2025-01-15',
          status: 'normal'
        },
        {
          id: '2',
          patientId: 'BJ2025002',
          nom: 'DOSSOU',
          prenom: 'Koffi',
          age: 45,
          lastConsultation: '2025-01-14',
          status: 'urgent'
        },
        {
          id: '3',
          patientId: 'BJ2025003',
          nom: 'AGBODJAN',
          prenom: 'Marie',
          age: 28,
          lastConsultation: '2025-01-13',
          status: 'normal'
        }
      ])

      setTodayAppointments([
        {
          id: '1',
          patientNom: 'HOUNSOU',
          patientPrenom: 'Jean',
          heure: '14:30',
          type: 'Consultation',
          status: 'confirme'
        },
        {
          id: '2',
          patientNom: 'AKPOVI',
          patientPrenom: 'Sylvie',
          heure: '15:00',
          type: 'Suivi',
          status: 'en_attente'
        },
        {
          id: '3',
          patientNom: 'TOSSOU',
          patientPrenom: 'Paul',
          heure: '15:30',
          type: 'Urgence',
          status: 'confirme'
        }
      ])
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQRScanSuccess = (patientData: PatientQRData) => {
    // Redirection vers le dossier patient
    navigate('/medecin/patient', {
      state: {
        patientData,
        medecinData
      }
    })
  }

  const handleLogout = () => {
    clearMedecinData()
    navigate('/medecin/login')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'text-orange-600 bg-orange-50'
      case 'critique': return 'text-red-600 bg-red-50'
      case 'confirme': return 'text-green-600 bg-green-50'
      case 'en_attente': return 'text-yellow-600 bg-yellow-50'
      case 'annule': return 'text-gray-600 bg-gray-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <QRScanner
              onScanSuccess={handleQRScanSuccess}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-medical-500" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Dr. {medecinData?.nom} {medecinData?.prenom}
                </h1>
                <p className="text-sm text-gray-600">
                  {medecinData?.specialite} • {medecinData?.hopital.nom}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-gray-800">
                {formatDate(currentTime)}
              </p>
              <p className="text-lg font-bold text-medical-600">
                {formatTime(currentTime)}
              </p>
            </div>

            <Button
              onClick={() => setShowScanner(true)}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

  {/* Daily KPIs */}
        {dailyStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Consultations</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{dailyStats.consultationsToday}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Patients seen</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{dailyStats.patientsVus}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Scheduled appointments</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{dailyStats.rdvProgrammes}</p>
              <p className="text-xs text-gray-500">Remaining</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Emergencies</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{dailyStats.urgences}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        )}

  {/* Quick search and Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recherche patients */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Patient Search</h3>
              <Button
                onClick={() => navigate('/medecin/patients')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>All patients</span>
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, surname or patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Patients récents */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Recent patients</h4>
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate('/medecin/patient', { state: { patientId: patient.patientId } })}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-hedera-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-hedera-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {patient.nom} {patient.prenom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {patient.patientId} • {patient.age} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          </div>

    {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/medecin/consultation/new')}
                variant="primary"
                className="w-full flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Consultation</span>
              </Button>

              <Button
                onClick={() => setShowScanner(true)}
                variant="secondary"
                className="w-full flex items-center justify-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Scan Patient QR</span>
              </Button>

              <Button
                onClick={() => navigate('/medecin/planning')}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>My Schedule</span>
              </Button>

              <Button
                onClick={() => navigate('/medecin/statistics')}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>My Statistics</span>
              </Button>
            </div>
          </div>
        </div>

  {/* Today's schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Today's Schedule</h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {todayAppointments.length} appointments
              </span>
            </div>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map((rdv) => (
                <div
                  key={rdv.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-medical-600">{rdv.heure}</p>
                      <p className="text-xs text-gray-500">{rdv.type}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {rdv.patientNom} {rdv.patientPrenom}
                      </p>
                      <p className="text-sm text-gray-600">{rdv.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rdv.status)}`}>
                      {rdv.status === 'confirme' ? 'Confirmed' :
                       rdv.status === 'en_attente' ? 'Pending' : 'Cancelled'}
                    </span>
                    <Button
                      onClick={() => navigate('/medecin/consultation/new', {
                        state: { patientNom: rdv.patientNom, patientPrenom: rdv.patientPrenom }
                      })}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled today</p>
            </div>
          )}
        </div>

  {/* Notifications and alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    New patient registered
                  </p>
                  <p className="text-xs text-blue-600">
                    KOSSOU Adjoa - BJ2025001
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Appointment to confirm
                  </p>
                  <p className="text-xs text-yellow-600">
                    AKPOVI Sylvie - 15:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Personal Statistics</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Consultations this week</span>
                <span className="font-bold text-gray-800">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unique patients</span>
                <span className="font-bold text-gray-800">32</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfaction rate</span>
                <span className="font-bold text-green-600">98%</span>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/medecin/statistics')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  View details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
