import { useEffect, useRef, useCallback, useState } from 'react'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  duration: number
  velocity: number
}

interface TapGesture {
  x: number
  y: number
  timestamp: number
}

interface TouchGestureOptions {
  onSwipe?: (gesture: SwipeGesture) => void
  onTap?: (gesture: TapGesture) => void
  onDoubleTap?: (gesture: TapGesture) => void
  onLongPress?: (gesture: TapGesture) => void
  swipeThreshold?: number
  tapThreshold?: number
  doubleTapDelay?: number
  longPressDelay?: number
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipe,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    tapThreshold = 10,
    doubleTapDelay = 300,
    longPressDelay = 500
  } = options

  const touchStartRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<TapGesture | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return

    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    touchStartRef.current = touchPoint

    // Démarrer le timer pour long press
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          onLongPress({
            x: touchPoint.x,
            y: touchPoint.y,
            timestamp: touchPoint.timestamp
          })
        }
      }, longPressDelay)
    }
  }, [onLongPress, longPressDelay])

  const handleTouchMove = useCallback((_event: TouchEvent) => {
    // Annuler le long press si l'utilisateur bouge
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Annuler le long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    const touchStart = touchStartRef.current
    if (!touchStart) return

    const touch = event.changedTouches[0]
    if (!touch) return

    const touchEnd: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = touchEnd.timestamp - touchStart.timestamp

    // Déterminer si c'est un swipe ou un tap
    if (distance >= swipeThreshold && onSwipe) {
      // C'est un swipe
      const velocity = distance / duration
      let direction: SwipeGesture['direction']

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      onSwipe({
        direction,
        distance,
        duration,
        velocity
      })
    } else if (distance <= tapThreshold) {
      // C'est un tap
      const tapGesture: TapGesture = {
        x: touchEnd.x,
        y: touchEnd.y,
        timestamp: touchEnd.timestamp
      }

      // Vérifier si c'est un double tap
      if (onDoubleTap && lastTapRef.current) {
        const timeSinceLastTap = touchEnd.timestamp - lastTapRef.current.timestamp
        if (timeSinceLastTap <= doubleTapDelay) {
          onDoubleTap(tapGesture)
          lastTapRef.current = null
          return
        }
      }

      // Simple tap
      if (onTap) {
        onTap(tapGesture)
      }

      lastTapRef.current = tapGesture
    }

    touchStartRef.current = null
  }, [onSwipe, onTap, onDoubleTap, swipeThreshold, tapThreshold, doubleTapDelay])

  const attachGestures = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      // Nettoyer les anciens listeners
      elementRef.current.removeEventListener('touchstart', handleTouchStart)
      elementRef.current.removeEventListener('touchmove', handleTouchMove)
      elementRef.current.removeEventListener('touchend', handleTouchEnd)
    }

    elementRef.current = element

    if (element) {
      // Ajouter les nouveaux listeners
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchmove', handleTouchMove, { passive: true })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  useEffect(() => {
    return () => {
      // Cleanup
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart)
        elementRef.current.removeEventListener('touchmove', handleTouchMove)
        elementRef.current.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { attachGestures }
}

// Hook pour détecter les appareils mobiles
export function useIsMobile() {
  const checkIsMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768
  }, [])

  const [isMobile, setIsMobile] = useState(checkIsMobile())

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [checkIsMobile])

  return isMobile
}

// Hook pour la détection d'orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  })

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

export default useTouchGestures
