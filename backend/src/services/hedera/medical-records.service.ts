import { ContractFunctionParameters } from '@hashgraph/sdk';
import { hederaService } from './hedera.service';
import crypto from 'crypto';

/**
 * Énumération des types d'enregistrements médicaux
 */
export enum RecordType {
    CONSULTATION = 0,
    PRESCRIPTION = 1,
    TEST_RESULT = 2,
    SURGERY = 3,
    VACCINATION = 4,
    EMERGENCY = 5,
    FOLLOW_UP = 6,
    DISCHARGE_SUMMARY = 7
}

/**
 * Énumération des statuts d'enregistrement
 */
export enum RecordStatus {
    DRAFT = 0,
    FINALIZED = 1,
    AMENDED = 2,
    CANCELLED = 3
}

/**
 * Service pour la gestion des dossiers médicaux sur Hedera
 */
export class MedicalRecordsService {
    private contractId: string;

    constructor() {
        this.contractId = process.env.MEDICAL_RECORDS_CONTRACT_ID || '';
        if (!this.contractId) {
            console.warn('MEDICAL_RECORDS_CONTRACT_ID non défini dans .env');
        }
    }

    /**
     * Crée un nouvel enregistrement médical
     */
    async createMedicalRecord(recordData: {
        patientId: number;
        doctorAddress: string;
        recordType: RecordType;
        medicalData: any;
        attachmentHashes?: string[];
        metadata?: string;
        isEmergency?: boolean;
        authorizedViewers?: string[];
    }): Promise<any> {
        try {
            // Chiffrer les données médicales
            const encryptedDataHash = this.encryptMedicalData(recordData.medicalData);
            const originalDataHash = this.hashData(recordData.medicalData);

            const functionParameters = new ContractFunctionParameters()
                .addUint256(recordData.patientId)
                .addAddress(recordData.doctorAddress)
                .addUint8(recordData.recordType)
                .addString(encryptedDataHash)
                .addString(originalDataHash)
                .addStringArray(recordData.attachmentHashes || [])
                .addString(recordData.metadata || '')
                .addBool(recordData.isEmergency || false)
                .addAddressArray(recordData.authorizedViewers || []);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'createMedicalRecord',
                functionParameters,
                200000
            );

            if (result.success) {
                console.log(`Dossier médical créé: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId,
                    encryptedDataHash
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la création du dossier:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Récupère un enregistrement médical
     */
    async getMedicalRecord(recordId: number): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(recordId);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.callContractFunction(
                this.contractId,
                'getMedicalRecord',
                functionParameters
            );

            if (result.success) {
                return {
                    success: true,
                    record: this.parseMedicalRecord(result.result)
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du dossier:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Met à jour le statut d'un enregistrement
     */
    async updateRecordStatus(recordId: number, newStatus: RecordStatus): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(recordId)
                .addUint8(newStatus);

            if (!hederaService) {


                throw new Error('Hedera service not available');
            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'updateRecordStatus',
                functionParameters,
                100000
            );

            if (result.success) {
                console.log(`Statut du dossier mis à jour: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Amende un enregistrement médical
     */
    async amendMedicalRecord(
        recordId: number,
        reason: string,
        newMedicalData: any
    ): Promise<any> {
        try {
            const newEncryptedDataHash = this.encryptMedicalData(newMedicalData);

            const functionParameters = new ContractFunctionParameters()
                .addUint256(recordId)
                .addString(reason)
                .addString(newEncryptedDataHash);

            if (!hederaService) {


                throw new Error('Hedera service not available');


            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'amendMedicalRecord',
                functionParameters,
                150000
            );

            if (result.success) {
                console.log(`Dossier médical amendé: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'amendement:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Récupère l'historique médical d'un patient
     */
    async getPatientMedicalHistory(patientId: number): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(patientId);

            if (!hederaService) {


                throw new Error('Hedera service not available');


            }


            const result = await hederaService.callContractFunction(
                this.contractId,
                'getPatientRecords',
                functionParameters
            );

            if (result.success) {
                return {
                    success: true,
                    records: this.parseRecordsList(result.result)
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Autorise un utilisateur à voir un enregistrement
     */
    async authorizeViewer(recordId: number, viewerAddress: string): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(recordId)
                .addAddress(viewerAddress);

            if (!hederaService) {


                throw new Error('Hedera service not available');


            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'authorizeViewer',
                functionParameters,
                100000
            );

            if (result.success) {
                console.log(`Visualiseur autorisé: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'autorisation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Chiffre les données médicales
     */
    private encryptMedicalData(data: any): string {
        const key = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here';
        const cipher = crypto.createCipher('aes-256-cbc', key);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Crée un hash des données pour l'intégrité
     */
    private hashData(data: any): string {
        return crypto.createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    /**
     * Parse un enregistrement médical depuis la blockchain
     */
    private parseMedicalRecord(result: any): any {
        return {
            recordId: result.getUint256(0),
            patientId: result.getUint256(1),
            doctorAddress: result.getAddress(2),
            recordType: result.getUint8(3),
            status: result.getUint8(4),
            encryptedDataHash: result.getString(5),
            originalDataHash: result.getString(6),
            timestamp: result.getUint256(7),
            lastModified: result.getUint256(8),
            isEmergency: result.getBool(9)
        };
    }

    /**
     * Parse une liste d'enregistrements
     */
    private parseRecordsList(result: any): any[] {
        // Cette fonction devra être adaptée selon le format exact
        // de retour du smart contract
        const records = [];
        const recordCount = result.getUint256(0);
        
        for (let i = 0; i < recordCount; i++) {
            // Parse chaque enregistrement
            records.push({
                recordId: result.getUint256(i * 10 + 1),
                // ... autres champs
            });
        }
        
        return records;
    }
}

export const medicalRecordsService = new MedicalRecordsService();
