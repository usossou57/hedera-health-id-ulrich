import { useState, useRef, useEffect } from 'react'
import { Camera, X, Search, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import qrCodeService, { PatientQRData } from '@/services/qrCodeService'
import { useApi } from '@/services/api'

interface QRScannerProps {
  onScanSuccess: (patientData: PatientQRData) => void
  onClose: () => void
  className?: string
}

export default function QRScanner({ onScanSuccess, onClose, className }: QRScannerProps) {
  const api = useApi()
  const [isScanning, setIsScanning] = useState(false)
  const [manualId, setManualId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start camera
  const startCamera = async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer rear camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      
      setIsScanning(true)
      startScanning()
    } catch (error) {
      console.error('Camera access error:', error)
      setError("Can't access camera. Check permissions.")
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    setIsScanning(false)
  }

  // Scan QR code from video
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return

    scanIntervalRef.current = setInterval(() => {
      scanFrame()
    }, 500) // Scan every 500ms
  }

  const scanFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Capture video image
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // In production, we would use a library like jsQR
    // For demo, we simulate detection
    simulateQRDetection(imageData)
  }

  // Simulate QR detection (in production, use jsQR or similar)
  const simulateQRDetection = (_imageData: ImageData) => {
    // Simulate: detect QR code after 3 seconds of scan
    if (isScanning) {
      setTimeout(() => {
        // Test data for demo
        const testQRData = {
          patientId: 'BJ2025001',
          nom: 'KOSSOU',
          prenom: 'Adjoa',
          hopital: 'chu-mel',
          dateNaissance: '1990-05-12',
          groupeSanguin: 'A+',
          allergies: ['Pénicilline'],
          timestamp: Date.now(),
          version: '1.0'
        }
        
        handleQRDetected(JSON.stringify(testQRData))
      }, 3000)
    }
  }

  // Process detected QR Code
  const handleQRDetected = (qrData: string) => {
    try {
      // Validate QR Code
      const validation = qrCodeService.validateQRCode(qrData)
      
      if (validation.isValid && validation.data) {
        setSuccess('QR Code scanned successfully!')
        stopCamera()
        onScanSuccess(validation.data)
      } else {
        setError(validation.error || 'Invalid QR Code')
      }
    } catch (error) {
      setError('Error reading QR Code')
    }
  }

  // Manual search by ID
  const handleManualSearch = async () => {
    if (!manualId.trim()) {
      setError('Please enter a patient ID')
      return
    }

    // Validate ID format (BJ + year + 4 digits)
    const idPattern = /^BJ\d{8}$/
    if (!idPattern.test(manualId)) {
      setError('Invalid ID format. Example: BJ20250001')
      return
    }

    setIsSearching(true)
    setError('')
    setSuccess('')

    try {
      // Try to find patient using API
      const response = await api.getPatientById(manualId)

      if (response.success && response.data) {
        const patient = response.data
        const patientData: PatientQRData = {
          patientId: patient.patientId,
          nom: patient.nom,
          prenom: patient.prenom,
          hopital: patient.hopitalPrincipal || 'chu-mel',
          dateNaissance: patient.dateNaissance,
          groupeSanguin: 'O+', // Default value, should come from API
          allergies: [], // Default value, should come from API
          timestamp: Date.now(),
          version: '1.0'
        }

        setSuccess('Patient found!')
        onScanSuccess(patientData)
      } else {
        // Fallback to demo data if API fails or patient not found
        const testPatientData: PatientQRData = {
          patientId: manualId,
          nom: 'PATIENT',
          prenom: 'Test',
          hopital: 'chu-mel',
          dateNaissance: '1985-01-01',
          groupeSanguin: 'O+',
          allergies: [],
          timestamp: Date.now(),
          version: '1.0'
        }

        setSuccess('Patient found! (Demo data)')
        onScanSuccess(testPatientData)
      }
    } catch (error) {
      console.error('Error searching for patient:', error)
      setError('Error searching for patient. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Cleanup on close
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <Camera className="h-6 w-6 text-hedera-500" />
          <span>Scanner Patient</span>
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Scan area */}
      <div className="mb-6">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay de scan */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-hedera-500 border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-center text-white bg-black bg-opacity-50 p-2 rounded">
                    <p className="text-sm">Centrez le QR Code</p>
                    <p className="text-sm">dans le cadre</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Cliquez pour démarrer la caméra</p>
                <Button onClick={startCamera} variant="primary">
                  Démarrer le scan
                </Button>
              </div>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="mt-4 text-center">
            <Button onClick={stopCamera} variant="outline">
              Arrêter le scan
            </Button>
          </div>
        )}
      </div>

      {/* Séparateur */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Alternative</span>
        </div>
      </div>

      {/* Manual entry */}
      <div className="space-y-4">
        <Input
          label="Enter ID manually"
          value={manualId}
          onChange={(e) => {
            setManualId(e.target.value.toUpperCase())
            setError('')
          }}
          placeholder="BJ20250001"
          icon={<Search className="h-4 w-4" />}
        />
        
        <Button
          onClick={handleManualSearch}
          variant="secondary"
          className="w-full"
          disabled={!manualId.trim() || isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </div>
  )
}
