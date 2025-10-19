export interface PatientData {
  patientId: string
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email: string
  hopitalPrincipal: string
}

export interface Consultation {
  id: string
  date: string
  medecin: string
  hopital: string
  type: string
  statut: 'terminee' | 'programmee' | 'annulee'
  resume?: string
  diagnostic?: string
  traitement?: string
}

export interface MedecinAutorise {
  id: string
  nom: string
  prenom: string
  specialite: string
  hopital: string
  dateAutorisation: string
  statut: 'actif' | 'suspendu'
}

export type DashboardTab = 'overview' | 'consultations' | 'documents' | 'permissions' | 'settings'
