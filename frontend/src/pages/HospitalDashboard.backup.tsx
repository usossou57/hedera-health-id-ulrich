import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Users, FileText, DollarSign, Clock,
  TrendingUp, Download, BarChart3, Calendar, Bell, Settings,
  Menu, X, Home, Activity, UserCheck, Database, LogOut
} from 'lucide-react'
import Button from '@/components/ui/Button'
import ApiStatus from '@/components/ApiStatus'
import PatientManagement from '@/components/hospital/PatientManagement'
import MedecinManagement from '@/components/hospital/MedecinManagement'
import ConsultationManagement from '@/components/hospital/ConsultationManagement'
import StorageTest from '@/components/StorageTest'

interface HospitalStats {
  patients: {
    actifs: number
    croissance: string
  }
  consultations: {
    total: number
    croissance: string
  }
  economies: {
    montant: number
    unite: string
  }
  temps: {
    economise: number
    unite: string
  }
  adoption: {
    systeme: number
    medecinsActifs: number
    patientsInscrits: number
    satisfaction: number
  }
}

interface ActiviteRecente {
  id: string
  type: string
  titre: string
  description?: string
  count?: number
  statut: string
  createdAt: string
}

export default function HospitalDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('mois')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<HospitalStats | null>(null)
  const [activites, setActivites] = useState<ActiviteRecente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Charger les données réelles
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError('')

    // Utiliser l'API service configuré
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const url = `${API_URL}/api/v1/statistiques/dashboard`

    console.log(`🔄 Chargement des données depuis: ${url}`)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        // Timeout de 10 secondes
        signal: AbortSignal.timeout(10000)
      })

      console.log(`📡 Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP Error ${response.status}:`, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Données reçues:', data)

      if (data.success) {
        console.log('✅ Données chargées avec succès depuis:', url)
        setStats(data.data.statistiques)
        setActivites(data.data.activitesRecentes)
        setError('') // Effacer toute erreur précédente
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des données')
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err)
      setError(`Impossible de charger les données du dashboard: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)

      // Données par défaut en cas d'erreur
      setStats({
        patients: { actifs: 0, croissance: '+0%' },
        consultations: { total: 0, croissance: '+0%' },
        economies: { montant: 0, unite: 'M FCFA' },
        temps: { economise: 0, unite: 'heures' },
        adoption: {
          systeme: 0,
          medecinsActifs: 0,
          patientsInscrits: 0,
          satisfaction: 0
        }
      })
      setActivites([])
    }

    setIsLoading(false)
  }

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('fr-FR', {
  //     style: 'currency',
  //     currency: 'XOF',
  //     minimumFractionDigits: 0
  //   }).format(amount)
  // }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'medecins', label: 'Médecins', icon: UserCheck },
    { id: 'consultations', label: 'Consultations', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'activite', label: 'Activité', icon: Activity },
    { id: 'base-donnees', label: 'Base de données', icon: Database },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed lg:inset-y-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-hedera-500" />
            <span className="text-xl font-bold text-gray-800">CHU-MEL</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-hedera-50 text-hedera-700 border-r-2 border-hedera-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-3">
          {/* Statut API */}
          <div className="px-3">
            <ApiStatus showDetails={false} />
          </div>

          <Link to="/" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50">
            <LogOut className="h-5 w-5" />
            <span>Retour accueil</span>
          </Link>
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-hedera-500"
              >
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
              </select>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="p-4 sm:p-6 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* Titre de section */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-hedera-500" />
                  <span>STATISTIQUES DU {selectedPeriod.toUpperCase()}</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                  <span className="text-xs text-gray-500">
                    {error ? 'Hors ligne' : 'En ligne'}
                  </span>
                </div>
              </div>

              {/* Affichage d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Indicateur de chargement */}
              {isLoading && !stats && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hedera-500"></div>
                  <span className="ml-2 text-gray-600">Chargement des données...</span>
                </div>
              )}

              {/* Métriques principales */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Patients */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-hedera-500" />
                        <span className="font-medium text-gray-700">PATIENTS</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-800 animate-pulse">{formatNumber(stats.patients.actifs)} <span className="text-lg text-gray-600">actifs</span></p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">{stats.patients.croissance} vs mois</span>
                      </div>
                    </div>
                  </div>

                  {/* Consultations */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-gray-700">CONSULT.</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.consultations.total)} <span className="text-lg text-gray-600">total</span></p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">{stats.consultations.croissance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Économies */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium text-gray-700">ÉCONOMIES</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-800">{stats.economies.montant} {stats.economies.unite}</p>
                      <p className="text-sm text-gray-600">économisés</p>
                    </div>
                  </div>

                  {/* Temps */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <span className="font-medium text-gray-700">TEMPS</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-800">{stats.temps.economise} {stats.temps.unite}</p>
                      <p className="text-sm text-gray-600">économisées</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Graphique d'utilisation */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-hedera-500" />
                      <span>GRAPHIQUE UTILISATION</span>
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Adoption système</span>
                        <span className="text-sm font-medium text-gray-800">{stats.adoption.systeme}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-hedera-500 h-4 rounded-full transition-all duration-300"
                          style={{ width: `${stats.adoption.systeme}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{stats.adoption.medecinsActifs}%</p>
                          <p className="text-xs text-gray-500">Médecins actifs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{stats.adoption.patientsInscrits}%</p>
                          <p className="text-xs text-gray-500">Patients inscrits</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{stats.adoption.satisfaction}%</p>
                          <p className="text-xs text-gray-500">Satisfaction</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activité récente */}
                  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-hedera-500" />
                      <span>ACTIVITÉ RÉCENTE</span>
                    </h3>
            
            <div className="space-y-4">
              {activites.length > 0 ? (
                activites.slice(0, 3).map((activite) => {
                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case 'nouveau_patient': return { bg: 'bg-green-50', dot: 'bg-green-500' }
                      case 'medecin_connecte': return { bg: 'bg-blue-50', dot: 'bg-blue-500' }
                      case 'maintenance': return { bg: 'bg-yellow-50', dot: 'bg-yellow-500' }
                      default: return { bg: 'bg-gray-50', dot: 'bg-gray-500' }
                    }
                  }

                  const colors = getActivityColor(activite.type)

                  return (
                    <div key={activite.id} className={`flex items-center space-x-3 p-3 ${colors.bg} rounded-lg`}>
                      <div className={`w-2 h-2 ${colors.dot} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activite.titre}</p>
                        <p className="text-xs text-gray-500">{activite.description}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Aucune activité récente</p>
                </div>
              )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>RAPPORT DÉTAILLÉ</span>
                </Button>

                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>EXPORTER DONNÉES</span>
                </Button>
              </div>
            </>
          )}

          {/* Autres onglets */}
          {activeTab === 'patients' && (
            <PatientManagement />
          )}

          {activeTab === 'medecins' && (
            <MedecinManagement />
          )}

          {activeTab === 'consultations' && (
            <ConsultationManagement />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics Avancées</h3>
              <p className="text-gray-600">Analytics avancées en cours de développement...</p>
            </div>
          )}

          {activeTab === 'activite' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Journal d'Activité</h3>
              <p className="text-gray-600">Journal d'activité en cours de développement...</p>
            </div>
          )}

          {activeTab === 'base-donnees' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Base de Données</h3>
                <ApiStatus showDetails={true} className="mb-4" />
              </div>

              <StorageTest />

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="font-semibold mb-3">Gestion des données</h4>
                <p className="text-gray-600 text-sm">Interface de gestion de la base de données en cours de développement...</p>
              </div>
            </div>
          )}

          {activeTab === 'parametres' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Paramètres</h3>
              <p className="text-gray-600">Paramètres système en cours de développement...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
