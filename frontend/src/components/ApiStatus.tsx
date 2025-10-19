import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Database, Server, Clock } from 'lucide-react'
import { useApi, isApiError } from '@/services/api'

interface ApiStatusProps {
  className?: string
  showDetails?: boolean
}

export default function ApiStatus({ className = '', showDetails = false }: ApiStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  
  const api = useApi()

  const checkConnection = async () => {
    setIsLoading(true)
    try {
      // Test de connectivité
      const connected = await api.checkConnectivity()
      setIsConnected(connected)

      if (connected && showDetails) {
        // Récupération des statistiques
        const statsResponse = await api.testApi()
        if (!isApiError(statsResponse)) {
          setStats(statsResponse.data)
        }
      }

      setLastCheck(new Date())
    } catch (error) {
      console.error('Erreur test connectivité:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
    
    // Vérification périodique toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [showDetails])

  const getStatusColor = () => {
    if (isLoading) return 'text-gray-500'
    if (isConnected) return 'text-green-500'
    return 'text-red-500'
  }

  const getStatusText = () => {
    if (isLoading) return 'Vérification...'
    if (isConnected) return 'Connecté'
    return 'Déconnecté'
  }

  const getStatusIcon = () => {
    if (isLoading) return <Clock className="h-4 w-4 animate-pulse" />
    if (isConnected) return <Wifi className="h-4 w-4" />
    return <WifiOff className="h-4 w-4" />
  }

  return (
    <div className={`${className}`}>
      {/* Statut principal */}
      <div className="flex items-center space-x-2">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {lastCheck && (
          <span className="text-xs text-gray-400">
            {lastCheck.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Détails étendus */}
      {showDetails && (
        <div className="mt-4 space-y-3">
          {isConnected && stats ? (
            <>
              {/* Statistiques base de données */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Base de données active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                  <div>Hôpitaux: {stats.database_stats?.hopitaux || 0}</div>
                  <div>Médecins: {stats.database_stats?.medecins || 0}</div>
                  <div>Patients: {stats.database_stats?.patients || 0}</div>
                  <div>Consultations: {stats.database_stats?.consultations || 0}</div>
                </div>
              </div>

              {/* Informations serveur */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Server className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    API Backend
                  </span>
                </div>
                <div className="text-xs text-blue-700">
                  <div>Message: {stats.message}</div>
                  <div>Timestamp: {new Date(stats.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </>
          ) : !isConnected ? (
            <div className="bg-red-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Connexion échouée
                </span>
              </div>
              <div className="text-xs text-red-700">
                <div>• Vérifiez votre connexion internet</div>
                <div>• Le serveur backend est peut-être indisponible</div>
                <div>• Réessayez dans quelques instants</div>
              </div>
            </div>
          ) : null}

          {/* Bouton de test manuel */}
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="w-full text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded px-3 py-2 transition-colors"
          >
            {isLoading ? 'Test en cours...' : 'Tester la connexion'}
          </button>
        </div>
      )}
    </div>
  )
}
