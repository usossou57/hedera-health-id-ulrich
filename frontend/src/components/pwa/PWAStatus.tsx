import React, { useState } from 'react'
import { RefreshCw, Wifi, WifiOff, Smartphone, Download } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'

interface PWAStatusProps {
  className?: string
  showDetails?: boolean
}

const PWAStatus: React.FC<PWAStatusProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const { 
    isInstalled, 
    isOffline, 
    isUpdateAvailable, 
    isInstallable,
    updateApp, 
    installApp 
  } = usePWA()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      updateApp()
      // L'app va se recharger automatiquement
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setIsUpdating(false)
    }
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await installApp()
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  if (!showDetails && !isUpdateAvailable && !isOffline) {
    return null
  }

  return (
    <div className={`${className}`}>
      {/* Bannière de mise à jour */}
      {isUpdateAvailable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Mise à jour disponible
                </h4>
                <p className="text-xs text-blue-700">
                  Une nouvelle version de l'application est prête
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-1"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Mettre à jour
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Statut hors ligne */}
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">
                Mode hors ligne
              </h4>
              <p className="text-xs text-yellow-700">
                Vous naviguez en mode hors ligne. Certaines fonctionnalités peuvent être limitées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bannière d'installation (version compacte) */}
      {isInstallable && !isInstalled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-green-900">
                  Installation disponible
                </h4>
                <p className="text-xs text-green-700">
                  Installez l'app pour un accès rapide
                </p>
              </div>
            </div>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-1"></div>
                  Installation...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1" />
                  Installer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Détails PWA */}
      {showDetails && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Statut de l'application
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mode d'installation:</span>
              <span className={`font-medium ${isInstalled ? 'text-green-600' : 'text-gray-500'}`}>
                {isInstalled ? 'Installée' : 'Navigateur'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Connexion réseau:</span>
              <div className="flex items-center">
                {isOffline ? (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500 mr-1" />
                    <span className="text-red-600 font-medium">Hors ligne</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">En ligne</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Service Worker:</span>
              <span className="text-green-600 font-medium">
                {'serviceWorker' in navigator ? 'Supporté' : 'Non supporté'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cache:</span>
              <span className="text-green-600 font-medium">
                {'caches' in window ? 'Actif' : 'Non disponible'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PWAStatus
