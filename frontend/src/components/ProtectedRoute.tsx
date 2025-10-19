import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'patient' | 'medecin' | 'hospital'
}

interface SessionData {
  patientId?: string
  medecinId?: string
  hospitalId?: string
  isAuthenticated: boolean
  loginTime: string
}

export default function ProtectedRoute({ children, requiredRole = 'patient' }: ProtectedRouteProps) {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const sessionKey = `${requiredRole}_session`
        const sessionStr = localStorage.getItem(sessionKey)
        
        if (!sessionStr) {
          setIsAuthenticated(false)
          return
        }

        const session: SessionData = JSON.parse(sessionStr)
        
        // Vérifier si la session est valide (pas expirée)
        const loginTime = new Date(session.loginTime)
        const now = new Date()
        const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
        
        // Session expire après 24 heures
        if (hoursSinceLogin > 24) {
          localStorage.removeItem(sessionKey)
          setIsAuthenticated(false)
          return
        }

        // Vérifier si la session correspond au rôle requis
        const hasRequiredRole = 
          (requiredRole === 'patient' && session.patientId) ||
          (requiredRole === 'medecin' && session.medecinId) ||
          (requiredRole === 'hospital' && session.hospitalId)

        if (session.isAuthenticated && hasRequiredRole) {
          setSessionData(session)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuthentication()
  }, [requiredRole])

  // Affichage de chargement pendant la vérification
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hedera-50 to-medical-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hedera-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  // Redirection vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    const loginPath = `/${requiredRole}/login`
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  // Rendu des enfants si authentifié
  return <>{children}</>
}

// Hook pour accéder aux données de session
export function useSession(role: 'patient' | 'medecin' | 'hospital' = 'patient') {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    const sessionKey = `${role}_session`
    const sessionStr = localStorage.getItem(sessionKey)
    
    if (sessionStr) {
      try {
        const session: SessionData = JSON.parse(sessionStr)
        setSessionData(session)
      } catch (error) {
        console.error('Erreur lors de la lecture de la session:', error)
      }
    }
  }, [role])

  const logout = () => {
    const sessionKey = `${role}_session`
    localStorage.removeItem(sessionKey)
    setSessionData(null)
    window.location.href = '/'
  }

  return {
    sessionData,
    isAuthenticated: !!sessionData?.isAuthenticated,
    logout
  }
}
