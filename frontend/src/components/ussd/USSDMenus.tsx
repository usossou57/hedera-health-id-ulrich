// USSDMenus - Générateur de menus USSD
import { 
  USSDPatient, 
  USSDConsultation, 
  USSDPrescription, 
  USSDRendezVous,
  USSDEmergencyCode,
  USSDTempAccess 
} from '../../services/ussdService'

export interface USSDMenuProps {
  patientId: string
  patient: USSDPatient | null
  timeRemaining: number
  onMenuChange: (menu: string) => void
  onEndSession: () => void
}

export interface USSDMenuData {
  consultations?: USSDConsultation[]
  prescriptions?: USSDPrescription[]
  rendezVous?: USSDRendezVous[]
  emergencyCode?: USSDEmergencyCode
  tempAccess?: USSDTempAccess
}

export class USSDMenus {
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  static generateMainMenu(props: USSDMenuProps): string {
    const { patientId, patient, timeRemaining } = props
    
    if (!patient) {
      return `Patient non trouvé: ${patientId}

Vérifiez votre ID patient
et réessayez.

0. Quitter`
    }

    return `Hedera Health ID
${patient.prenom} ${patient.nom}
ID: ${patientId}

1. Consultations récentes
2. Prescriptions actives  
3. Prochains RDV
4. Mode urgence
5. Partager dossier
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }

  static generateConsultationsMenu(consultations: USSDConsultation[], timeRemaining: number): string {
    if (consultations.length === 0) {
      return `Consultations récentes:

Aucune consultation
trouvée dans votre
historique.

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
    }

    let menu = `Consultations récentes:\n\n`
    
    consultations.slice(0, 3).forEach((consultation, index) => {
      menu += `${index + 1}. ${consultation.date} - ${consultation.medecin}
   ${consultation.type}`
      
      if (consultation.diagnostic) {
        menu += `\n   ${consultation.diagnostic}`
      }
      
      menu += `\n   ${consultation.hopital}\n\n`
    })

    menu += `9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`

    return menu
  }

  static generatePrescriptionsMenu(prescriptions: USSDPrescription[], timeRemaining: number): string {
    if (prescriptions.length === 0) {
      return `Prescriptions actives:

Aucune prescription
active trouvée.

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
    }

    let menu = `Prescriptions actives:\n\n`
    
    prescriptions.slice(0, 3).forEach((prescription, index) => {
      menu += `${index + 1}. ${prescription.medicament}
   ${prescription.frequence}
   Jusqu'au ${prescription.dateFin}\n\n`
    })

    menu += `9. Menu principal  
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`

    return menu
  }

  static generateRendezVousMenu(rendezVous: USSDRendezVous[], timeRemaining: number): string {
    if (rendezVous.length === 0) {
      return `Prochains RDV:

Aucun rendez-vous
programmé.

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
    }

    let menu = `Prochains RDV:\n\n`
    
    rendezVous.slice(0, 2).forEach((rdv, index) => {
      const statusIcon = rdv.statut === 'confirme' ? '✓' : '?'
      menu += `${index + 1}. ${rdv.date} ${rdv.heure} ${statusIcon}
   ${rdv.medecin} - ${rdv.hopital}
   ${rdv.type}\n\n`
    })

    menu += `9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`

    return menu
  }

  static generateEmergencyMenu(emergencyCode: USSDEmergencyCode, timeRemaining: number): string {
    return `MODE URGENCE ACTIVÉ

Votre position sera partagée
avec l'hôpital le plus proche.

Code d'urgence: ${emergencyCode.code}
Valide jusqu'à: ${new Date(emergencyCode.validUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}

Montrez ce code au personnel
médical pour accès immédiat
à votre dossier.

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }

  static generateTempAccessMenu(tempAccess: USSDTempAccess, timeRemaining: number): string {
    const validUntil = new Date(tempAccess.validUntil)
    const duration = Math.round((validUntil.getTime() - Date.now()) / (1000 * 60 * 60))
    
    return `Partage temporaire activé

Code d'accès: ${tempAccess.code}
Valide: ${duration}h

Donnez ce code au médecin
pour consulter votre dossier
sans scanner QR.

Permissions accordées:
• Informations de base
• Consultations récentes
• Prescriptions actives

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }

  static generateConsultationDetailMenu(consultation: USSDConsultation, timeRemaining: number): string {
    return `Consultation du ${consultation.date}

Médecin: ${consultation.medecin}
Type: ${consultation.type}
Hôpital: ${consultation.hopital}

${consultation.diagnostic ? `Diagnostic:\n${consultation.diagnostic}\n\n` : ''}9. Menu principal
8. Retour consultations
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }

  static generatePrescriptionDetailMenu(prescription: USSDPrescription, timeRemaining: number): string {
    const daysLeft = Math.ceil((new Date(prescription.dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    return `${prescription.medicament}

Dosage: ${prescription.dosage}
Fréquence: ${prescription.frequence}
Durée: ${prescription.duree}

Début: ${prescription.dateDebut}
Fin: ${prescription.dateFin}
${daysLeft > 0 ? `Reste: ${daysLeft} jours` : 'Traitement terminé'}

9. Menu principal
8. Retour prescriptions
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }

  static generateInvalidOptionMenu(option: string, timeRemaining: number): string {
    return `Option invalide: ${option}

Veuillez choisir une option
valide du menu.

Les options disponibles
sont affichées avec des
numéros (1, 2, 3, etc.)

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }

  static generateSessionExpiredMenu(): string {
    return `Session expirée

Votre session USSD a expiré
pour des raisons de sécurité.

Pour accéder à nouveau à
vos informations, composez:
*789*VOTRE_ID#

Merci d'utiliser
Hedera Health ID`
  }

  static generateGoodbyeMenu(): string {
    return `Au revoir !

Merci d'avoir utilisé
Hedera Health ID.

Pour accéder à nouveau à
vos informations:
*789*VOTRE_ID#

Prenez soin de vous !`
  }

  static generateLoadingMenu(action: string): string {
    return `Chargement...

${action}

Veuillez patienter...

⟳`
  }

  static generateErrorMenu(error: string, timeRemaining: number): string {
    return `Erreur

${error}

Veuillez réessayer ou
contacter le support.

9. Menu principal
0. Quitter

Temps: ${this.formatTime(timeRemaining)}`
  }
}

export default USSDMenus
