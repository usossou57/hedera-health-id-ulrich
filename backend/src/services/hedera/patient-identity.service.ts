import { ContractFunctionParameters } from '@hashgraph/sdk';
import { hederaService } from './hedera.service';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

/**
 * Service pour la gestion des identités patients sur Hedera
 */
export class PatientIdentityService {
    private contractId: string;

    constructor() {
        this.contractId = process.env.PATIENT_IDENTITY_CONTRACT_ID || '';
        if (!this.contractId) {
            console.warn('PATIENT_IDENTITY_CONTRACT_ID non défini dans .env');
        }
    }

    /**
     * Enregistre un nouveau patient sur la blockchain (WALLET INVISIBLE)
     */
    async registerPatient(patientData: {
        personalData: any;
        patientAddress: string;
        metadataHash?: string;
    }): Promise<any> {
        try {
            console.log(`👤 Enregistrement patient INCOGNITO: ${patientData.personalData.name}`);
            
            // 1. CRÉER WALLET INVISIBLE (SEUL BACKEND SAIT !)
            const { PrivateKey } = await import('@hashgraph/sdk');
            const newKey = PrivateKey.generateED25519();
            const walletAddress = "0.0." + newKey.publicKey.toString(10);
            
            // 2. Chiffrer les données personnelles
            const encryptedData = this.encryptPatientData(patientData.personalData);
            
            // 3. Utiliser WALLET INVISIBLE au lieu de patientAddress fourni
            const functionParameters = new ContractFunctionParameters()
                .addString(encryptedData)
                .addAddress(walletAddress)  // ← WALLET SECRET !
                .addString(patientData.metadataHash || '');

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }

            const result = await hederaService.executeContractFunction(
                this.contractId,
                'registerPatient',
                functionParameters,
                200000  // Gas augmenté pour wallet
            );

            if (result.success) {
                console.log(`✅ Patient ${patientData.personalData.name} enregistré INCOGNITO ! Wallet secret: ${walletAddress}`);
                
                // 4. SAUVER WALLET SECRET DANS DB APRÈS SUCCÈS
                const patientId = Date.now();
                await db.patient.create({
                    data: {
                        id: patientId,
                        name: patientData.personalData.name,
                        birthdate: patientData.personalData.birthdate,
                        walletAddress,
                        privateKey: newKey.toString(),  // 🔒 SECRET !
                        hederaAccountId: walletAddress
                    }
                });
                
                console.log(`🔒 Clé privée sauvée: ${newKey.toString().substring(0, 10)}...`);
                
                return {
                    success: true,
                    transactionId: result.transactionId,
                    message: "Patient enregistré avec succès !",  // ZÉRO WALLET !
                    patientId  // ID simple
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du patient:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Signe transaction AUTO avec wallet patient
     */
    async signTransactionWithPatientWallet(
        patientId: number, 
        contractId: string, 
        functionName: string, 
        params: ContractFunctionParameters
    ): Promise<any> {
        try {
            const { PrivateKey, ContractExecuteTransaction, Client } = await import('@hashgraph/sdk');
            const { client } = await import('./hedera.service');
            
            // 1. Récupère CLÉ SECRET
            const patient = await db.patient.findUnique({ where: { id: patientId } });
            if (!patient?.privateKey) throw new Error('Wallet introuvable');
            
            // 2. SIGNE AUTO
            const patientKey = PrivateKey.fromString(patient.privateKey);
            const tx = new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(200000)
                .setFunction(functionName, params)
                .freezeWith(client)
                .sign(patientKey);  // ← MAGIC !
            
            const txResponse = await tx.execute(client);
            const receipt = await txResponse.getReceipt(client);
            
            console.log(`✅ Transaction signée AUTO pour patient ${patientId}: ${txResponse.transactionId}`);
            
            return {
                success: true,
                transactionId: txResponse.transactionId.toString()
            };
        } catch (error) {
            console.error('Erreur signature auto:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Met à jour les données d'un patient (SIGNATURE AUTO)
     */
    async updatePatientData(
        patientId: number,
        newData: any,
        newMetadataHash?: string
    ): Promise<any> {
        try {
            const encryptedData = this.encryptPatientData(newData);
            
            const functionParameters = new ContractFunctionParameters()
                .addUint256(patientId)
                .addString(encryptedData)
                .addString(newMetadataHash || '');

            // UTILISE SIGNATURE AUTO !
            const result = await this.signTransactionWithPatientWallet(
                patientId,
                this.contractId,
                'updatePatientData',
                functionParameters
            );

            if (result.success) {
                console.log(`Données patient mises à jour AUTO: ${result.transactionId}`);
                return result;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Récupère les informations d'un patient
     */
    async getPatient(patientId: number): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(patientId);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }

            const result = await hederaService.callContractFunction(
                this.contractId,
                'getPatient',
                functionParameters
            );

            if (result.success) {
                return {
                    success: true,
                    patient: this.parsePatientData(result.result)
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du patient:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Accorde l'accès à un médecin
     */
    async grantAccess(patientId: number, doctorAddress: string): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(patientId)
                .addAddress(doctorAddress);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }

            const result = await hederaService.executeContractFunction(
                this.contractId,
                'grantAccess',
                functionParameters,
                100000
            );

            if (result.success) {
                console.log(`Accès accordé au médecin: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'octroi d\'accès:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Révoque l'accès d'un médecin
     */
    async revokeAccess(patientId: number, doctorAddress: string): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(patientId)
                .addAddress(doctorAddress);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }

            const result = await hederaService.executeContractFunction(
                this.contractId,
                'revokeAccess',
                functionParameters,
                100000
            );

            if (result.success) {
                console.log(`Accès révoqué pour le médecin: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la révocation d\'accès:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Chiffre les données du patient
     */
    private encryptPatientData(data: any): string {
        const key = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here';
        const cipher = crypto.createCipher('aes-256-cbc', key);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * Parse les données du patient depuis la blockchain
     */
    private parsePatientData(result: any): any {
        return {
            patientId: result.getUint256(0),
            encryptedPersonalData: result.getString(1),
            patientAddress: result.getAddress(2),
            isActive: result.getBool(3),
            creationDate: result.getUint256(4),
            metadataHash: result.getString(5)
        };
    }
}

export const patientIdentityService = new PatientIdentityService();