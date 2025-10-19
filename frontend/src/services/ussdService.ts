// Service pour gérer les données USSD et les interactions avec l'API

export interface USSDPatient {
  id: string
  nom: string
  prenom: string
  age: number
  ville: string
  hopitalPrincipal: string
}

export interface USSDConsultation {
  id: string
  date: string
  medecin: string
  type: string
  diagnostic?: string
  hopital: string
}

export interface USSDPrescription {
  id: string
  medicament: string
  dosage: string
  frequence: string
  duree: string
  dateDebut: string
  dateFin: string
  actif: boolean
}

export interface USSDRendezVous {
  id: string
  date: string
  heure: string
  medecin: string
  hopital: string
  type: string
  statut: 'confirme' | 'en_attente' | 'annule'
}

export interface USSDEmergencyCode {
  code: string
  patientId: string
  validUntil: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface USSDTempAccess {
  code: string
  patientId: string
  validUntil: string
  permissions: string[]
}

class USSDService {
  // private baseUrl = 'https://hedera-health-id-backend.vercel.app/api/v1' // Pour future implémentation

  // Données de démonstration
  private demoData = {
    patients: {
      'BJ2025001': {
        id: 'BJ2025001',
        nom: 'KOSSOU',
        prenom: 'Adjoa',
        age: 34,
        ville: 'Cotonou',
        hopitalPrincipal: 'CHU-MEL'
      },
      'BJ2025002': {
        id: 'BJ2025002',
        nom: 'MENSAH',
        prenom: 'Koffi',
        age: 28,
        ville: 'Porto-Novo',
        hopitalPrincipal: 'CNHU-HKM'
      },
      'BJ2025003': {
        id: 'BJ2025003',
        nom: 'DIALLO',
        prenom: 'Fatou',
        age: 45,
        ville: 'Parakou',
        hopitalPrincipal: 'CHU-MEL'
      }
    },
    consultations: {
      'BJ2025001': [
        {
          id: 'CONS001',
          date: '15/09/2025',
          medecin: 'Dr. ADJAHOUI',
          type: 'Consultation générale',
          diagnostic: 'Hypertension légère',
          hopital: 'CHU-MEL'
        },
        {
          id: 'CONS002',
          date: '10/09/2025',
          medecin: 'Dr. SOSSOU',
          type: 'Suivi pédiatrique',
          hopital: 'CNHU-HKM'
        },
        {
          id: 'CONS003',
          date: '05/09/2025',
          medecin: 'Dr. KOSSOU',
          type: 'Cardiologie',
          diagnostic: 'Contrôle de routine',
          hopital: 'CHU-MEL'
        }
      ]
    },
    prescriptions: {
      'BJ2025001': [
        {
          id: 'PRESC001',
          medicament: 'Paracétamol 500mg',
          dosage: '500mg',
          frequence: '2 fois par jour',
          duree: '5 jours',
          dateDebut: '15/09/2025',
          dateFin: '20/09/2025',
          actif: true
        },
        {
          id: 'PRESC002',
          medicament: 'Amoxicilline 250mg',
          dosage: '250mg',
          frequence: '3 fois par jour',
          duree: '7 jours',
          dateDebut: '15/09/2025',
          dateFin: '22/09/2025',
          actif: true
        },
        {
          id: 'PRESC003',
          medicament: 'Vitamine D',
          dosage: '1000 UI',
          frequence: '1 fois par jour',
          duree: '30 jours',
          dateDebut: '10/09/2025',
          dateFin: '10/10/2025',
          actif: true
        }
      ]
    },
    rendezVous: {
      'BJ2025001': [
        {
          id: 'RDV001',
          date: '20/09/2025',
          heure: '14:30',
          medecin: 'Dr. ADJAHOUI',
          hopital: 'CHU-MEL',
          type: 'Suivi consultation',
          statut: 'confirme' as const
        },
        {
          id: 'RDV002',
          date: '25/09/2025',
          heure: '09:00',
          medecin: 'Dr. KOSSOU',
          hopital: 'CHU-MEL',
          type: 'Contrôle cardiaque',
          statut: 'confirme' as const
        }
      ]
    }
  }

  async getPatient(patientId: string): Promise<USSDPatient | null> {
    // En mode démo, utiliser les données locales
    return this.demoData.patients[patientId as keyof typeof this.demoData.patients] || null
  }

  async getConsultations(patientId: string): Promise<USSDConsultation[]> {
    return this.demoData.consultations[patientId as keyof typeof this.demoData.consultations] || []
  }

  async getPrescriptions(patientId: string): Promise<USSDPrescription[]> {
    const prescriptions = this.demoData.prescriptions[patientId as keyof typeof this.demoData.prescriptions] || []
    return prescriptions.filter(p => p.actif)
  }

  async getRendezVous(patientId: string): Promise<USSDRendezVous[]> {
    const rdvs = this.demoData.rendezVous[patientId as keyof typeof this.demoData.rendezVous] || []
    // Filtrer les RDV futurs
    const today = new Date()
    return rdvs.filter(rdv => {
      const rdvDate = this.parseDate(rdv.date)
      return rdvDate >= today
    })
  }

  async createEmergencyAccess(patientId: string, location?: { latitude: number, longitude: number }): Promise<USSDEmergencyCode> {
    const code = `UR${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    const validUntil = new Date()
    validUntil.setHours(validUntil.getHours() + 24) // Valide 24h

    return {
      code,
      patientId,
      validUntil: validUntil.toISOString(),
      location
    }
  }

  async createTempAccess(patientId: string, duration: number = 2): Promise<USSDTempAccess> {
    const code = `TMP${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    const validUntil = new Date()
    validUntil.setHours(validUntil.getHours() + duration)

    return {
      code,
      patientId,
      validUntil: validUntil.toISOString(),
      permissions: ['read_consultations', 'read_prescriptions', 'read_basic_info']
    }
  }

  private parseDate(dateStr: string): Date {
    // Format: DD/MM/YYYY
    const [day, month, year] = dateStr.split('/')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  formatTime(timeStr: string): string {
    return timeStr
  }

  isValidPatientId(patientId: string): boolean {
    return /^BJ\d{7}$/.test(patientId)
  }

  parseUSSDCode(code: string): { isValid: boolean, patientId?: string } {
    // Format attendu: *789*BJ2025001#
    const match = code.match(/^\*789\*([A-Z]{2}\d{7})\#$/)
    if (match && this.isValidPatientId(match[1])) {
      return { isValid: true, patientId: match[1] }
    }
    return { isValid: false }
  }
}

export const ussdService = new USSDService()
export default ussdService
