import QRCode from 'qrcode'
import CryptoJS from 'crypto-js'

// Clé de chiffrement pour les données sensibles (en production, utiliser une clé sécurisée)
const ENCRYPTION_KEY = 'hedera-health-secret-key-2025'

export interface PatientQRData {
  patientId: string
  nom: string
  prenom: string
  hopital: string
  dateNaissance?: string
  groupeSanguin?: string
  allergies?: string[]
  timestamp: number
  version: string
}

export interface QRCodeOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

class QRCodeService {
  private defaultOptions: QRCodeOptions = {
    size: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  }

  /**
   * Chiffre les données sensibles du patient
   */
  private encryptData(data: PatientQRData): string {
    const jsonString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
    return encrypted
  }

  /**
   * Déchiffre les données du QR Code
   */
  public decryptData(encryptedData: string): PatientQRData | null {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8)
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error)
      return null
    }
  }

  /**
   * Génère un QR Code pour un patient avec données chiffrées
   */
  public async generatePatientQRCode(
    patientData: Omit<PatientQRData, 'timestamp' | 'version'>,
    options?: QRCodeOptions
  ): Promise<string> {
    try {
      const qrData: PatientQRData = {
        ...patientData,
        timestamp: Date.now(),
        version: '1.0'
      }

      // Chiffrement des données
      const encryptedData = this.encryptData(qrData)
      
      // Configuration QR Code
      const qrOptions = { ...this.defaultOptions, ...options }
      
      // Génération du QR Code
      const qrCodeDataURL = await QRCode.toDataURL(encryptedData, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel
      })

      return qrCodeDataURL
    } catch (error) {
      console.error('Erreur lors de la génération du QR Code:', error)
      throw new Error('Impossible de générer le QR Code')
    }
  }

  /**
   * Génère un QR Code simple (non chiffré) pour les démos
   */
  public async generateSimpleQRCode(
    data: string,
    options?: QRCodeOptions
  ): Promise<string> {
    try {
      const qrOptions = { ...this.defaultOptions, ...options }
      
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: qrOptions.size,
        margin: qrOptions.margin,
        color: qrOptions.color,
        errorCorrectionLevel: qrOptions.errorCorrectionLevel
      })

      return qrCodeDataURL
    } catch (error) {
      console.error('Erreur lors de la génération du QR Code simple:', error)
      throw new Error('Impossible de générer le QR Code')
    }
  }

  /**
   * Télécharge un QR Code en tant qu'image
   */
  public downloadQRCode(dataURL: string, filename: string = 'qr-code.png'): void {
    try {
      const link = document.createElement('a')
      link.href = dataURL
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      throw new Error('Impossible de télécharger le QR Code')
    }
  }

  /**
   * Partage un QR Code via l'API Web Share (si disponible)
   */
  public async shareQRCode(
    dataURL: string, 
    patientData: { nom: string; prenom: string; patientId: string }
  ): Promise<boolean> {
    try {
      if (navigator.share && navigator.canShare) {
        // Convertir dataURL en blob pour le partage
        const response = await fetch(dataURL)
        const blob = await response.blob()
        const file = new File([blob], `qr-code-${patientData.patientId}.png`, { type: 'image/png' })

        const shareData = {
          title: 'Mon Carnet de Santé Hedera Health ID',
          text: `QR Code de ${patientData.prenom} ${patientData.nom} (ID: ${patientData.patientId})`,
          files: [file]
        }

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return true
        }
      }
      
      // Fallback: copier dans le presse-papiers
      await this.copyToClipboard(patientData)
      return false
    } catch (error) {
      console.error('Erreur lors du partage:', error)
      // Fallback: copier dans le presse-papiers
      await this.copyToClipboard(patientData)
      return false
    }
  }

  /**
   * Copie les informations du patient dans le presse-papiers
   */
  private async copyToClipboard(patientData: { nom: string; prenom: string; patientId: string }): Promise<void> {
    const textToCopy = `Mon Carnet de Santé Hedera Health ID
Nom: ${patientData.prenom} ${patientData.nom}
ID Patient: ${patientData.patientId}
Code USSD: *789*${patientData.patientId}#`

    try {
      await navigator.clipboard.writeText(textToCopy)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  /**
   * Valide un QR Code scanné
   */
  public validateQRCode(encryptedData: string): { isValid: boolean; data?: PatientQRData; error?: string } {
    try {
      const data = this.decryptData(encryptedData)
      
      if (!data) {
        return { isValid: false, error: 'Données invalides ou corrompues' }
      }

      // Vérification de la structure des données
      if (!data.patientId || !data.nom || !data.prenom) {
        return { isValid: false, error: 'Données patient incomplètes' }
      }

      // Vérification de l'âge du QR Code (expire après 24h pour sécurité)
      const now = Date.now()
      const qrAge = now - data.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 heures

      if (qrAge > maxAge) {
        return { isValid: false, error: 'QR Code expiré' }
      }

      return { isValid: true, data }
    } catch (error) {
      return { isValid: false, error: 'Erreur lors de la validation' }
    }
  }

  /**
   * Génère différentes tailles de QR Code
   */
  public async generateMultipleSizes(
    patientData: Omit<PatientQRData, 'timestamp' | 'version'>
  ): Promise<{ small: string; medium: string; large: string }> {
    const [small, medium, large] = await Promise.all([
      this.generatePatientQRCode(patientData, { size: 128 }),
      this.generatePatientQRCode(patientData, { size: 256 }),
      this.generatePatientQRCode(patientData, { size: 512 })
    ])

    return { small, medium, large }
  }
}

// Instance singleton
export const qrCodeService = new QRCodeService()
export default qrCodeService
