import React, { useState } from 'react'
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'

interface PWAInstallBannerProps {
  className?: string
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isOffline, installApp, dismissInstall } = usePWA()
  const [isVisible, setIsVisible] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)

  // Ne pas afficher si déjà installé ou non installable ou masqué
  if (!isVisible || isInstalled || !isInstallable) {
    return null
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const success = await installApp()
      if (success) {
        setIsVisible(false)
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    dismissInstall()
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-lg p-4 mx-auto max-w-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center flex-1">
            <div className="bg-white/20 rounded-full p-2 mr-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">
                Installer Hedera Health ID
              </h3>
              <p className="text-xs text-blue-100 mb-3">
                Accédez rapidement à votre carnet de santé, même hors ligne !
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="bg-white text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></div>
                      Installation...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      Installer
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="text-blue-100 hover:text-white text-xs underline"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-blue-100 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Indicateur de statut réseau */}
        <div className="flex items-center mt-2 pt-2 border-t border-white/20">
          <div className="flex items-center text-xs text-blue-100">
            {isOffline ? (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Mode hors ligne disponible
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Fonctionne hors ligne après installation
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallBanner
