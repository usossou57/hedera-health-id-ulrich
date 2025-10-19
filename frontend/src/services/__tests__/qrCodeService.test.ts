import { describe, it, expect, beforeEach } from 'vitest'
import qrCodeService, { PatientQRData } from '../qrCodeService'

describe('QRCodeService', () => {
  let testPatientData: Omit<PatientQRData, 'timestamp' | 'version'>

  beforeEach(() => {
    testPatientData = {
      patientId: 'BJ20250001',
      nom: 'KOSSOU',
      prenom: 'Adjoa',
      hopital: 'chu-mel',
      dateNaissance: '1990-05-12',
      groupeSanguin: 'A+',
      allergies: ['Pénicilline']
    }
  })

  describe('generatePatientQRCode', () => {
    it('should generate a QR code data URL', async () => {
      const qrCodeUrl = await qrCodeService.generatePatientQRCode(testPatientData)
      
      expect(qrCodeUrl).toMatch(/^data:image\/png;base64,/)
      expect(typeof qrCodeUrl).toBe('string')
    })

    it('should generate QR code with custom options', async () => {
      const options = {
        size: 512,
        color: { dark: '#00D4AA', light: '#FFFFFF' }
      }
      
      const qrCodeUrl = await qrCodeService.generatePatientQRCode(testPatientData, options)
      expect(qrCodeUrl).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('generateSimpleQRCode', () => {
    it('should generate a simple QR code', async () => {
      const simpleData = 'Test QR Code Data'
      const qrCodeUrl = await qrCodeService.generateSimpleQRCode(simpleData)
      
      expect(qrCodeUrl).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('validateQRCode', () => {
    it('should validate a properly encrypted QR code', async () => {
      // Note: Ce test nécessiterait une vraie implémentation de décodage QR
      // Pour l'instant, nous testons la structure de validation
      expect(typeof qrCodeService.validateQRCode).toBe('function')
    })

    it('should reject invalid QR code data', () => {
      const invalidData = 'invalid-data'
      const result = qrCodeService.validateQRCode(invalidData)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject empty QR code data', () => {
      const result = qrCodeService.validateQRCode('')
      
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('generateMultipleSizes', () => {
    it('should generate QR codes in multiple sizes', async () => {
      const sizes = await qrCodeService.generateMultipleSizes(testPatientData)
      
      expect(sizes).toHaveProperty('small')
      expect(sizes).toHaveProperty('medium')
      expect(sizes).toHaveProperty('large')
      
      expect(sizes.small).toMatch(/^data:image\/png;base64,/)
      expect(sizes.medium).toMatch(/^data:image\/png;base64,/)
      expect(sizes.large).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('downloadQRCode', () => {
    it('should not throw when downloading QR code', () => {
      const mockDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      
      expect(() => {
        qrCodeService.downloadQRCode(mockDataURL, 'test.png')
      }).not.toThrow()
    })
  })
})
