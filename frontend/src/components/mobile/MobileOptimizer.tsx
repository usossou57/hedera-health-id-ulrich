import React, { useEffect } from 'react'
import { useIsMobile, useOrientation } from '../../hooks/useTouchGestures'

interface MobileOptimizerProps {
  children: React.ReactNode
}

const MobileOptimizer: React.FC<MobileOptimizerProps> = ({ children }) => {
  const isMobile = useIsMobile()
  const orientation = useOrientation()

  useEffect(() => {
    // Optimisations pour mobile
    if (isMobile) {
      // Désactiver le zoom sur double tap
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        )
      }

      // Améliorer les performances de scroll
      document.body.style.overscrollBehavior = 'none'
      document.body.style.touchAction = 'pan-x pan-y'

      // Optimiser les animations
      document.documentElement.style.setProperty('--animation-duration', '0.2s')
    } else {
      // Restaurer les paramètres desktop
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
      }
      
      document.body.style.overscrollBehavior = 'auto'
      document.body.style.touchAction = 'auto'
      document.documentElement.style.setProperty('--animation-duration', '0.3s')
    }

    return () => {
      // Cleanup
      document.body.style.overscrollBehavior = 'auto'
      document.body.style.touchAction = 'auto'
    }
  }, [isMobile])

  useEffect(() => {
    // Ajuster l'interface selon l'orientation
    document.documentElement.setAttribute('data-orientation', orientation)
    
    // Ajuster la hauteur de viewport sur mobile pour gérer la barre d'adresse
    if (isMobile) {
      const setVH = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
      
      setVH()
      window.addEventListener('resize', setVH)
      window.addEventListener('orientationchange', setVH)
      
      return () => {
        window.removeEventListener('resize', setVH)
        window.removeEventListener('orientationchange', setVH)
      }
    }
  }, [orientation, isMobile])

  return (
    <div 
      className={`mobile-optimizer ${isMobile ? 'mobile' : 'desktop'} ${orientation}`}
      data-mobile={isMobile}
      data-orientation={orientation}
    >
      {children}
    </div>
  )
}

export default MobileOptimizer
