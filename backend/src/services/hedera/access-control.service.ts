import { ContractFunctionParameters } from '@hashgraph/sdk';
import { hederaService } from './hedera.service';

/**
 * Énumération des rôles utilisateur
 */
export enum UserRole {
    PATIENT = 0,
    DOCTOR = 1,
    ADMIN = 2,
    NURSE = 3,
    PHARMACIST = 4
}

/**
 * Service pour la gestion du contrôle d'accès sur Hedera
 */
export class AccessControlService {
    private contractId: string;

    constructor() {
        this.contractId = process.env.ACCESS_CONTROL_CONTRACT_ID || '';
        if (!this.contractId) {
            console.warn('ACCESS_CONTROL_CONTRACT_ID non défini dans .env');
        }
    }

    /**
     * Enregistre un nouvel utilisateur
     */
    async registerUser(userData: {
        userAddress: string;
        role: UserRole;
        publicKey: string;
        professionalId?: string;
    }): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addAddress(userData.userAddress)
                .addUint8(userData.role)
                .addString(userData.publicKey)
                .addString(userData.professionalId || '');

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'registerUser',
                functionParameters,
                120000
            );

            if (result.success) {
                console.log(`Utilisateur enregistré: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement utilisateur:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Accorde une permission d'accès
     */
    async grantPermission(permissionData: {
        grantorAddress: string;
        granteeAddress: string;
        patientId: number;
        expirationDate: number;
        allowedActions: string[];
    }): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addAddress(permissionData.grantorAddress)
                .addAddress(permissionData.granteeAddress)
                .addUint256(permissionData.patientId)
                .addUint256(permissionData.expirationDate)
                .addStringArray(permissionData.allowedActions);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'grantPermission',
                functionParameters,
                150000
            );

            if (result.success) {
                console.log(`Permission accordée: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'octroi de permission:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Révoque une permission
     */
    async revokePermission(permissionId: number): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addUint256(permissionId);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'revokePermission',
                functionParameters,
                100000
            );

            if (result.success) {
                console.log(`Permission révoquée: ${result.transactionId}`);
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la révocation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Vérifie si un utilisateur a une permission
     */
    async hasPermission(
        userAddress: string,
        patientId: number,
        action: string
    ): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addAddress(userAddress)
                .addUint256(patientId)
                .addString(action);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.callContractFunction(
                this.contractId,
                'hasPermission',
                functionParameters
            );

            if (result.success) {
                return {
                    success: true,
                    hasPermission: result.result.getBool(0)
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de permission:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Récupère les informations d'un utilisateur
     */
    async getUser(userAddress: string): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addAddress(userAddress);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.callContractFunction(
                this.contractId,
                'getUser',
                functionParameters
            );

            if (result.success) {
                return {
                    success: true,
                    user: this.parseUserData(result.result)
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération utilisateur:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Enregistre un log d'accès
     */
    async logAccess(logData: {
        accessor: string;
        patientId: number;
        action: string;
        success: boolean;
        details: string;
    }): Promise<any> {
        try {
            const functionParameters = new ContractFunctionParameters()
                .addAddress(logData.accessor)
                .addUint256(logData.patientId)
                .addString(logData.action)
                .addBool(logData.success)
                .addString(logData.details);

            if (!hederaService) {
                throw new Error('Hedera service not available');
            }


            const result = await hederaService.executeContractFunction(
                this.contractId,
                'logAccess',
                functionParameters,
                100000
            );

            if (result.success) {
                return {
                    success: true,
                    transactionId: result.transactionId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du log:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Parse les données utilisateur depuis la blockchain
     */
    private parseUserData(result: any): any {
        return {
            userAddress: result.getAddress(0),
            role: result.getUint8(1),
            isActive: result.getBool(2),
            publicKey: result.getString(3),
            professionalId: result.getString(4),
            registrationDate: result.getUint256(5)
        };
    }
}

export const accessControlService = new AccessControlService();
