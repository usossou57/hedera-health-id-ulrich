import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, CheckCircle, Building2, User, Smartphone } from 'lucide-react'
import Button from '@/components/ui/Button'
import qrCodeService from '@/services/qrCodeService'

interface PatientData {
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email: string
  hopitalPrincipal: string
}

export default function PatientIdGeneration() {
  const location = useLocation()
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [patientId, setPatientId] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [ussdCode, setUssdCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Retrieve patient data from navigation state
    const data = location.state?.patientData
    if (!data) {
      // Redirect to registration if no data
      navigate('/patient/register')
      return
    }

    setPatientData(data)
    
  // Generate a unique ID for the patient
  const generatedId = generatePatientId()
  setPatientId(generatedId)
  setUssdCode(`*789*${generatedId}#`)
    
  // Generate the QR Code (simulation)
  generateQRCode(generatedId)
  }, [location.state, navigate])

  const generatePatientId = (): string => {
  // Format: BJ + year + sequential number
  const year = new Date().getFullYear()
  const sequence = Math.floor(Math.random() * 9999) + 1
  return `BJ${year}${sequence.toString().padStart(4, '0')}`
  }

  const generateQRCode = async (id: string) => {
    try {
      if (!patientData) return

      // Patient data for QR Code
      const qrData = {
        patientId: id,
        nom: patientData.nom,
        prenom: patientData.prenom,
        hopital: patientData.hopitalPrincipal,
        dateNaissance: patientData.dateNaissance,
        // Demo data
        groupeSanguin: 'A+',
        allergies: ['Penicillin']
      }

      // Generate QR Code with encryption
      const qrCodeDataURL = await qrCodeService.generatePatientQRCode(qrData, {
        size: 256,
        color: {
          dark: '#00D4AA', // Hedera color
          light: '#FFFFFF'
        }
      })

      setQrCodeUrl(qrCodeDataURL)
    } catch (error) {
  console.error('Error generating QR Code:', error)
    }
  }

  const handleDownload = () => {
    if (qrCodeUrl && patientId) {
      qrCodeService.downloadQRCode(qrCodeUrl, `hedera-health-id-${patientId}.png`)
    }
  }

  const handleShare = async () => {
    if (qrCodeUrl && patientData && patientId) {
      try {
        const shared = await qrCodeService.shareQRCode(qrCodeUrl, {
          nom: patientData.nom,
          prenom: patientData.prenom,
          patientId
        })

        if (!shared) {
          // Fallback: data copied to clipboard
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      } catch (error) {
  console.error('Error sharing:', error)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const handleAccessDashboard = () => {
    navigate('/patient/dashboard', { 
      state: { 
        patientId,
        patientData 
      } 
    })
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hedera-50 to-medical-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hedera-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const hopitalName = patientData.hopitalPrincipal === 'chu-mel' ? 'CHU-MEL' : 
                     patientData.hopitalPrincipal === 'cnhu' ? 'CNHU' :
                     patientData.hopitalPrincipal === 'pasteur' ? 'Pasteur' : 'Akpakpa'

  return (
    <div className="min-h-screen bg-gradient-to-br from-hedera-50 to-medical-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/patient/register" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-hedera-500" />
              <h1 className="text-2xl font-bold text-gray-800">
                HEDERA HEALTH ID
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-hedera-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Success message */}
            <div className="text-center mb-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                RECORD CREATED!
              </h2>
            </div>

            {/* ID and QR Code */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Your Unique ID:
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex flex-col items-center">
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="Patient QR Code" 
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hedera-500 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Generating...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* ID Patient */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-hedera-600 mb-2 flex items-center justify-center space-x-2">
                      <Smartphone className="h-6 w-6" />
                      <span>{patientId}</span>
                    </div>
                    <div className="text-gray-600">
                      <div className="font-medium">{patientData.prenom} {patientData.nom}</div>
                      <div className="text-sm">{hopitalName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center flex items-center justify-center space-x-2">
                <Smartphone className="h-5 w-5 text-hedera-500" />
                <span>Quick actions:</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>DOWNLOAD</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      <span>SHARE</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* USSD Code */}
            <div className="bg-medical-50 rounded-lg p-4 mb-8">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center justify-center space-x-2">
                  <Smartphone className="h-5 w-5 text-medical-500" />
                  <span>USSD Access:</span>
                </h4>
                <div className="text-xl font-mono font-bold text-medical-600">
                  {ussdCode}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Dial this code on any phone
                </p>
              </div>
            </div>

            {/* Main button */}
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAccessDashboard}
                className="w-full"
              >
                ACCESS MY RECORD
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
