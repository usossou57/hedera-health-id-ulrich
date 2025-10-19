import React, { useState, useEffect, useCallback } from 'react'
import { Phone, Signal, Battery, Wifi } from 'lucide-react'
import ussdService, { USSDPatient, USSDConsultation, USSDPrescription, USSDRendezVous, USSDEmergencyCode, USSDTempAccess } from '../../services/ussdService'
import USSDMenus from './USSDMenus'

interface USSDSession {
  isActive: boolean
  currentMenu: string
  sessionId: string
  timeRemaining: number
  history: string[]
  patientId?: string
  patient?: USSDPatient | null
  consultations?: USSDConsultation[]
  prescriptions?: USSDPrescription[]
  rendezVous?: USSDRendezVous[]
  emergencyCode?: USSDEmergencyCode
  tempAccess?: USSDTempAccess
}

interface USSDSimulatorProps {
  onClose?: () => void
}

const USSDSimulator: React.FC<USSDSimulatorProps> = ({ onClose }) => {
  const [session, setSession] = useState<USSDSession>({
    isActive: false,
    currentMenu: '',
    sessionId: '',
    timeRemaining: 0,
    history: [],
    patientId: undefined,
    patient: null,
    consultations: [],
    prescriptions: [],
    rendezVous: []
  })
  
  const [input, setInput] = useState('')
  const [display, setDisplay] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Session timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (session.isActive && session.timeRemaining > 0) {
      timer = setInterval(() => {
        setSession(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }))
      }, 1000)
    } else if (session.isActive && session.timeRemaining === 0) {
      endSession()
    }
    return () => clearInterval(timer)
  }, [session.isActive, session.timeRemaining])

  const startSession = useCallback(async (code: string) => {
    setIsLoading(true)
    setDisplay(USSDMenus.generateLoadingMenu('Connexion au serveur...'))

    try {
      // Valider le code USSD
      const parseResult = ussdService.parseUSSDCode(code)

      if (!parseResult.isValid || !parseResult.patientId) {
        setDisplay('Code USSD invalide.\nUtilisez *789*ID_PATIENT#\nExemple: *789*BJ2025001#')
        setIsLoading(false)
        return
      }

      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Récupérer les données du patient
      const patient = await ussdService.getPatient(parseResult.patientId)
      const consultations = await ussdService.getConsultations(parseResult.patientId)
      const prescriptions = await ussdService.getPrescriptions(parseResult.patientId)
      const rendezVous = await ussdService.getRendezVous(parseResult.patientId)

      const sessionId = `USSD_${Date.now()}`
      const newSession = {
        isActive: true,
        currentMenu: 'main',
        sessionId,
        timeRemaining: 180, // 3 minutes
        history: [code],
        patientId: parseResult.patientId,
        patient,
        consultations,
        prescriptions,
        rendezVous
      }

      setSession(newSession)

      // Afficher le menu principal
      const mainMenu = USSDMenus.generateMainMenu({
        patientId: parseResult.patientId,
        patient,
        timeRemaining: 180,
        onMenuChange: () => {},
        onEndSession: () => {}
      })

      setDisplay(mainMenu)
      setIsLoading(false)
      setInput('')
    } catch (error) {
      console.error('Erreur lors du démarrage de session USSD:', error)
      setDisplay(USSDMenus.generateErrorMenu('Erreur de connexion', 0))
      setIsLoading(false)
    }
  }, [])

  const endSession = useCallback(() => {
    setDisplay(USSDMenus.generateGoodbyeMenu())

    setTimeout(() => {
      setSession({
        isActive: false,
        currentMenu: '',
        sessionId: '',
        timeRemaining: 0,
        history: [],
        patientId: undefined,
        patient: null,
        consultations: [],
        prescriptions: [],
        rendezVous: []
      })
      setDisplay('')
      setInput('')
    }, 3000)
  }, [])

  const showMainMenu = useCallback(() => {
    if (!session.patientId || !session.patient) return

    const mainMenu = USSDMenus.generateMainMenu({
      patientId: session.patientId,
      patient: session.patient,
      timeRemaining: session.timeRemaining,
      onMenuChange: () => {},
      onEndSession: () => {}
    })

    setDisplay(mainMenu)
    setSession(prev => ({ ...prev, currentMenu: 'main' }))
  }, [session.patientId, session.patient, session.timeRemaining])

  const handleMenuSelection = useCallback(async (choice: string) => {
    setSession(prev => ({
      ...prev,
      history: [...prev.history, choice]
    }))

    if (!session.patientId) return

    try {
      switch (session.currentMenu) {
        case 'main':
          await handleMainMenuSelection(choice)
          break
        case 'consultations':
          await handleConsultationsMenuSelection(choice)
          break
        case 'prescriptions':
          await handlePrescriptionsMenuSelection(choice)
          break
        case 'rendez-vous':
          await handleRendezVousMenuSelection(choice)
          break
        default:
          await handleMainMenuSelection(choice)
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du menu:', error)
      setDisplay(USSDMenus.generateErrorMenu('Erreur lors du traitement', session.timeRemaining))
    }
  }, [session.currentMenu, session.patientId, session.timeRemaining])

  const handleMainMenuSelection = async (choice: string) => {
    switch (choice) {
      case '1':
        setSession(prev => ({ ...prev, currentMenu: 'consultations' }))
        setDisplay(USSDMenus.generateConsultationsMenu(session.consultations || [], session.timeRemaining))
        break

      case '2':
        setSession(prev => ({ ...prev, currentMenu: 'prescriptions' }))
        setDisplay(USSDMenus.generatePrescriptionsMenu(session.prescriptions || [], session.timeRemaining))
        break

      case '3':
        setSession(prev => ({ ...prev, currentMenu: 'rendez-vous' }))
        setDisplay(USSDMenus.generateRendezVousMenu(session.rendezVous || [], session.timeRemaining))
        break

      case '4':
        setIsLoading(true)
        setDisplay(USSDMenus.generateLoadingMenu('Activation mode urgence...'))

        const emergencyCode = await ussdService.createEmergencyAccess(session.patientId!)
        setSession(prev => ({ ...prev, emergencyCode, currentMenu: 'emergency' }))
        setDisplay(USSDMenus.generateEmergencyMenu(emergencyCode, session.timeRemaining))
        setIsLoading(false)
        break

      case '5':
        setIsLoading(true)
        setDisplay(USSDMenus.generateLoadingMenu('Génération code temporaire...'))

        const tempAccess = await ussdService.createTempAccess(session.patientId!)
        setSession(prev => ({ ...prev, tempAccess, currentMenu: 'temp-access' }))
        setDisplay(USSDMenus.generateTempAccessMenu(tempAccess, session.timeRemaining))
        setIsLoading(false)
        break

      case '0':
        endSession()
        break

      default:
        setDisplay(USSDMenus.generateInvalidOptionMenu(choice, session.timeRemaining))
    }
  }

  const handleConsultationsMenuSelection = async (choice: string) => {
    const consultations = session.consultations || []

    if (choice === '9') {
      showMainMenu()
    } else if (choice === '0') {
      endSession()
    } else {
      const index = parseInt(choice) - 1
      if (index >= 0 && index < consultations.length) {
        setDisplay(USSDMenus.generateConsultationDetailMenu(consultations[index], session.timeRemaining))
        setSession(prev => ({ ...prev, currentMenu: 'consultation-detail' }))
      } else {
        setDisplay(USSDMenus.generateInvalidOptionMenu(choice, session.timeRemaining))
      }
    }
  }

  const handlePrescriptionsMenuSelection = async (choice: string) => {
    const prescriptions = session.prescriptions || []

    if (choice === '9') {
      showMainMenu()
    } else if (choice === '0') {
      endSession()
    } else {
      const index = parseInt(choice) - 1
      if (index >= 0 && index < prescriptions.length) {
        setDisplay(USSDMenus.generatePrescriptionDetailMenu(prescriptions[index], session.timeRemaining))
        setSession(prev => ({ ...prev, currentMenu: 'prescription-detail' }))
      } else {
        setDisplay(USSDMenus.generateInvalidOptionMenu(choice, session.timeRemaining))
      }
    }
  }

  const handleRendezVousMenuSelection = async (choice: string) => {
    if (choice === '9') {
      showMainMenu()
    } else if (choice === '0') {
      endSession()
    } else {
      setDisplay(USSDMenus.generateInvalidOptionMenu(choice, session.timeRemaining))
    }
  }

  const handleKeyPress = (key: string) => {
    if (!session.isActive) {
      if (key === 'Call' && input.includes('*') && input.includes('#')) {
        startSession(input)
      } else if (key === 'Clear') {
        setInput('')
      } else if (key !== 'Call') {
        setInput(prev => prev + key)
      }
    } else {
      if (key === 'Call') {
        handleMenuSelection(input)
        setInput('')
      } else if (key === 'Clear') {
        setInput('')
      } else if (key === 'End') {
        endSession()
      } else {
        setInput(prev => prev + key)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-sm mx-auto bg-gray-900 rounded-3xl p-6 shadow-2xl">
      {/* Phone Header */}
      <div className="flex items-center justify-between text-white text-xs mb-4">
        <div className="flex items-center gap-1">
          <Signal className="w-3 h-3" />
          <span>Moov</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3" />
          <Battery className="w-3 h-3" />
          <span>12:34</span>
        </div>
      </div>

      {/* Screen */}
      <div className="bg-green-900 text-green-100 p-4 rounded-lg mb-4 h-48 overflow-y-auto font-mono text-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin">⟳</div>
            <span className="ml-2">Connexion...</span>
          </div>
        ) : session.isActive ? (
          <div>
            <div className="text-right text-xs mb-2">
              Session: {formatTime(session.timeRemaining)}
            </div>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed">
              {display}
            </pre>
          </div>
        ) : (
          <div className="text-center text-xs">
            <div className="mb-4">📱 Simulateur USSD</div>
            <div className="mb-2">Tapez: *789*ID_PATIENT#</div>
            <div className="mb-2">Exemple: *789*BJ2025001#</div>
            <div className="text-green-300">Puis appuyez sur APPEL</div>
          </div>
        )}
      </div>

      {/* Input Display */}
      <div className="bg-gray-800 text-white p-2 rounded mb-4 text-center font-mono">
        {input || (session.isActive ? 'Tapez votre choix...' : 'Tapez le code USSD...')}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
          <button
            key={key}
            onClick={() => handleKeyPress(key)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded text-lg font-bold transition-colors"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleKeyPress('Call')}
          className="bg-green-600 hover:bg-green-500 text-white p-2 rounded flex items-center justify-center transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleKeyPress('Clear')}
          className="bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded text-sm transition-colors"
        >
          CLEAR
        </button>
        <button
          onClick={() => handleKeyPress('End')}
          className="bg-red-600 hover:bg-red-500 text-white p-2 rounded text-sm transition-colors"
        >
          END
        </button>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white p-2 rounded transition-colors"
        >
          Fermer Simulateur
        </button>
      )}
    </div>
  )
}

export default USSDSimulator
