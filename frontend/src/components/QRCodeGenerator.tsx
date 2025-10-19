import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, Share2, Copy, RefreshCw, QrCode } from 'lucide-react'
import Button from '@/components/ui/Button'

interface QRCodeGeneratorProps {
  patientData: {
    patientId: string
    nom: string
    prenom: string
    dateNaissance: string
    telephone: string
    ville: string
    hopitalPrincipal: string
  }
  className?: string
}

export default function QRCodeGenerator({ patientData, className = '' }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Données à encoder dans le QR Code
  const qrData = {
    id: patientData.patientId,
    nom: patientData.nom,
    prenom: patientData.prenom,
    naissance: patientData.dateNaissance,
    tel: patientData.telephone,
    ville: patientData.ville,
    hopital: patientData.hopitalPrincipal,
    timestamp: new Date().toISOString(),
    version: '1.0'
  }

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Configuration du QR Code avec couleurs Hedera
      const options = {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a365d', // Bleu foncé
          light: '#ffffff'  // Blanc
        },
        errorCorrectionLevel: 'M' as const
      }

      // Génération du QR Code
      const url = await QRCode.toDataURL(JSON.stringify(qrData), options)
      setQrCodeUrl(url)
      setShowQRCode(true)

      // Génération sur canvas pour téléchargement
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, JSON.stringify(qrData), options)
      }
    } catch (error) {
      console.error('Erreur génération QR Code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `qr-code-${patientData.patientId}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const shareQRCode = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        // Convertir data URL en blob
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const file = new File([blob], `qr-code-${patientData.patientId}.png`, { type: 'image/png' })

        await navigator.share({
          title: 'Mon QR Code Hedera Health',
          text: `QR Code pour ${patientData.prenom} ${patientData.nom}`,
          files: [file]
        })
      } catch (error) {
        console.error('Erreur partage:', error)
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2))
      alert('Données copiées dans le presse-papiers!')
    } catch (error) {
      console.error('Erreur copie:', error)
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <QrCode className="h-6 w-6 text-hedera-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            QR Code Personnel
          </h3>
        </div>

        {!showQRCode ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                Votre QR Code contiendra :
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• ID Patient: {patientData.patientId}</li>
                <li>• Nom complet: {patientData.prenom} {patientData.nom}</li>
                <li>• Téléphone: {patientData.telephone}</li>
                <li>• Hôpital: {patientData.hopitalPrincipal}</li>
              </ul>
            </div>

            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="w-full"
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Générer mon QR Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code affiché */}
            <div className="bg-white p-4 rounded-lg border-2 border-hedera-200 inline-block">
              <img 
                src={qrCodeUrl} 
                alt="QR Code Patient" 
                className="w-64 h-64 mx-auto"
              />
            </div>

            {/* Canvas caché pour téléchargement */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Informations */}
            <div className="bg-hedera-50 rounded-lg p-3">
              <p className="text-sm text-hedera-700 font-medium">
                QR Code généré avec succès !
              </p>
              <p className="text-xs text-hedera-600 mt-1">
                Présentez ce code aux médecins pour accéder à votre dossier
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>

              <Button
                onClick={shareQRCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>

              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
            </div>

            {/* Régénérer */}
            <Button
              onClick={generateQRCode}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Régénérer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
