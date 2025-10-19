import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PatientOverview from '../PatientOverview'
import { PatientData, Consultation, MedecinAutorise } from '@/types/patient'

describe('PatientOverview', () => {
  const mockPatientData: PatientData = {
    patientId: 'BJ20250001',
    nom: 'KOSSOU',
    prenom: 'Adjoa',
    dateNaissance: '1990-05-12',
    telephone: '+229 97 XX XX XX',
    email: 'adjoa@example.com',
    hopitalPrincipal: 'chu-mel'
  }

  const mockConsultations: Consultation[] = [
    {
      id: '1',
      date: '2025-01-02',
      medecin: 'Dr. ADJAHOUI',
      hopital: 'CHU-MEL',
      type: 'Consultation générale',
      statut: 'terminee',
      resume: 'Contrôle de routine'
    },
    {
      id: '2',
      date: '2025-01-15',
      medecin: 'Dr. KOSSOU',
      hopital: 'CHU-MEL',
      type: 'Suivi cardiologique',
      statut: 'programmee'
    }
  ]

  const mockMedecins: MedecinAutorise[] = [
    {
      id: '1',
      nom: 'ADJAHOUI',
      prenom: 'Dr. Jean',
      specialite: 'Médecine Générale',
      hopital: 'CHU-MEL',
      dateAutorisation: '2024-01-15',
      statut: 'actif'
    }
  ]

  it('renders patient information correctly', () => {
    render(
      <PatientOverview 
        patientData={mockPatientData}
        consultations={mockConsultations}
        medecinsAutorises={mockMedecins}
      />
    )

    expect(screen.getByText('BJ20250001')).toBeInTheDocument()
    expect(screen.getByText('Adjoa KOSSOU')).toBeInTheDocument()
    expect(screen.getByText('CHU-MEL')).toBeInTheDocument()
  })

  it('displays medical information', () => {
    render(
      <PatientOverview 
        patientData={mockPatientData}
        consultations={mockConsultations}
        medecinsAutorises={mockMedecins}
      />
    )

    expect(screen.getByText('A+')).toBeInTheDocument()
    expect(screen.getByText('Pénicilline')).toBeInTheDocument()
    expect(screen.getByText('Actif')).toBeInTheDocument()
  })

  it('shows activity statistics', () => {
    render(
      <PatientOverview 
        patientData={mockPatientData}
        consultations={mockConsultations}
        medecinsAutorises={mockMedecins}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument() // Nombre de consultations
    expect(screen.getByText('1')).toBeInTheDocument() // Nombre de médecins autorisés
  })

  it('displays upcoming appointments', () => {
    render(
      <PatientOverview 
        patientData={mockPatientData}
        consultations={mockConsultations}
        medecinsAutorises={mockMedecins}
      />
    )

    expect(screen.getByText('Dr. KOSSOU')).toBeInTheDocument()
    expect(screen.getByText('Suivi cardiologique')).toBeInTheDocument()
  })

  it('shows no appointments message when none are scheduled', () => {
    const consultationsWithoutFuture = mockConsultations.filter(c => c.statut !== 'programmee')
    
    render(
      <PatientOverview 
        patientData={mockPatientData}
        consultations={consultationsWithoutFuture}
        medecinsAutorises={mockMedecins}
      />
    )

    expect(screen.getByText('No scheduled appointments')).toBeInTheDocument()
  })
})
