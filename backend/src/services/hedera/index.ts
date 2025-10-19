/**
 * Services Hedera pour l'intégration blockchain
 * 
 * Ce module exporte tous les services nécessaires pour interagir
 * avec les smart contracts Hedera du système de santé.
 */

// Service de base
export { HederaService, hederaService } from './hedera.service';

// Services spécialisés
export { 
    PatientIdentityService, 
    patientIdentityService 
} from './patient-identity.service';

export { 
    AccessControlService, 
    accessControlService,
    UserRole 
} from './access-control.service';

export { 
    MedicalRecordsService, 
    medicalRecordsService,
    RecordType,
    RecordStatus 
} from './medical-records.service';

/**
 * Interface pour les réponses des services Hedera
 */
export interface HederaResponse {
    success: boolean;
    transactionId?: string;
    error?: string;
    data?: any;
}

/**
 * Interface pour les données de patient
 */
export interface PatientData {
    personalData: any;
    patientAddress: string;
    metadataHash?: string;
}

/**
 * Interface pour les données utilisateur
 */
export interface UserData {
    userAddress: string;
    role: import('./access-control.service').UserRole;
    publicKey: string;
    professionalId?: string;
}

/**
 * Interface pour les permissions
 */
export interface PermissionData {
    grantorAddress: string;
    granteeAddress: string;
    patientId: number;
    expirationDate: number;
    allowedActions: string[];
}

/**
 * Interface pour les enregistrements médicaux
 */
export interface MedicalRecordData {
    patientId: number;
    doctorAddress: string;
    recordType: import('./medical-records.service').RecordType;
    medicalData: any;
    attachmentHashes?: string[];
    metadata?: string;
    isEmergency?: boolean;
    authorizedViewers?: string[];
}

/**
 * Utilitaires pour la validation des adresses Hedera
 */
export class HederaUtils {
    /**
     * Valide un ID de compte Hedera
     */
    static isValidAccountId(accountId: string): boolean {
        const pattern = /^0\.0\.\d+$/;
        return pattern.test(accountId);
    }

    /**
     * Valide un ID de contrat Hedera
     */
    static isValidContractId(contractId: string): boolean {
        const pattern = /^0\.0\.\d+$/;
        return pattern.test(contractId);
    }

    /**
     * Formate un timestamp Unix en date lisible
     */
    static formatTimestamp(timestamp: number): string {
        return new Date(timestamp * 1000).toISOString();
    }

    /**
     * Convertit une date en timestamp Unix
     */
    static dateToTimestamp(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }
}

/**
 * Configuration par défaut pour les services Hedera
 */
export const HEDERA_CONFIG = {
    DEFAULT_GAS_LIMIT: 100000,
    PATIENT_REGISTRATION_GAS: 150000,
    MEDICAL_RECORD_GAS: 200000,
    PERMISSION_GAS: 120000,
    QUERY_GAS: 100000
};

/**
 * Messages d'erreur standardisés
 */
export const HEDERA_ERRORS = {
    MISSING_CONTRACT_ID: 'ID de contrat manquant dans la configuration',
    INVALID_ACCOUNT_ID: 'ID de compte Hedera invalide',
    INVALID_CONTRACT_ID: 'ID de contrat Hedera invalide',
    ENCRYPTION_FAILED: 'Échec du chiffrement des données',
    TRANSACTION_FAILED: 'Échec de la transaction blockchain',
    PERMISSION_DENIED: 'Permission refusée pour cette action',
    PATIENT_NOT_FOUND: 'Patient non trouvé',
    RECORD_NOT_FOUND: 'Enregistrement médical non trouvé'
};
