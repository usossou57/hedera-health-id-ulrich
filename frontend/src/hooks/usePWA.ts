import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  isUpdateAvailable: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

interface PWAActions {
  installApp: () => Promise<boolean>
  updateApp: () => void
  dismissInstall: () => void
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    isUpdateAvailable: false,
    installPrompt: null
  })

  // Vérifier si l'app est déjà installée
  const checkIfInstalled = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isInstalled = isStandalone || isInWebAppiOS
    
    setState(prev => ({ ...prev, isInstalled }))
  }, [])

  // Vérifier le statut offline
  const checkOfflineStatus = useCallback(() => {
    setState(prev => ({ ...prev, isOffline: !navigator.onLine }))
  }, [])

  // Installer l'application
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt) {
      console.warn('PWA: Aucun prompt d\'installation disponible')
      return false
    }

    try {
      await state.installPrompt.prompt()
      const choiceResult = await state.installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ PWA: Installation acceptée')
        setState(prev => ({ 
          ...prev, 
          isInstallable: false, 
          installPrompt: null,
          isInstalled: true 
        }))
        return true
      } else {
        console.log('❌ PWA: Installation refusée')
        return false
      }
    } catch (error) {
      console.error('❌ PWA: Erreur lors de l\'installation:', error)
      return false
    }
  }, [state.installPrompt])

  // Mettre à jour l'application
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update().then(() => {
            console.log('🔄 PWA: Mise à jour déclenchée')
            window.location.reload()
          })
        }
      })
    }
  }, [])

  // Rejeter l'installation
  const dismissInstall = useCallback(() => {
    setState(prev => ({ ...prev, isInstallable: false, installPrompt: null }))
  }, [])

  useEffect(() => {
    // Vérifications initiales
    checkIfInstalled()
    checkOfflineStatus()

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installEvent = e as BeforeInstallPromptEvent
      
      console.log('📱 PWA: Prompt d\'installation disponible')
      setState(prev => ({ 
        ...prev, 
        isInstallable: true, 
        installPrompt: installEvent 
      }))
    }

    // Écouter les changements de statut réseau
    const handleOnline = () => checkOfflineStatus()
    const handleOffline = () => checkOfflineStatus()

    // Écouter les changements de mode d'affichage
    const handleDisplayModeChange = () => checkIfInstalled()

    // Écouter les mises à jour du service worker
    const handleServiceWorkerUpdate = () => {
      setState(prev => ({ ...prev, isUpdateAvailable: true }))
    }

    // Enregistrer les event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', handleDisplayModeChange)

    // Service Worker registration et mise à jour
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker enregistré:', registration.scope)
          
          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 PWA: Nouvelle version disponible')
                  handleServiceWorkerUpdate()
                }
              })
            }
          })

          // Vérifier les mises à jour périodiquement
          setInterval(() => {
            registration.update()
          }, 60000) // Vérifier toutes les minutes
        })
        .catch(error => {
          console.error('❌ Service Worker registration failed:', error)
        })

      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          handleServiceWorkerUpdate()
        }
      })
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [checkIfInstalled, checkOfflineStatus])

  return {
    ...state,
    installApp,
    updateApp,
    dismissInstall
  }
}

// Hook pour les notifications PWA
export function usePWANotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window)
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error)
      return false
    }
  }, [isSupported])

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      return new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options
      })
    }
    return null
  }, [permission, isSupported])

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification
  }
}

export default usePWA
