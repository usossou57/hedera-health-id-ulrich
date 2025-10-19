import { Client, PrivateKey, AccountId, ContractId, ContractExecuteTransaction, ContractCallQuery, ContractFunctionParameters, Hbar } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service de base pour les interactions avec Hedera
 */
export class HederaService {
    private client: Client | null = null;
    private operatorId: AccountId | null = null;
    private operatorKey: PrivateKey | null = null;

    constructor() {
        this.initializeClient();
    }

    /**
     * Initialise le client Hedera
     */
    private initializeClient(): void {
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = process.env.OPERATOR_KEY;

        if (!operatorId || !operatorKey) {
            throw new Error('OPERATOR_ID et OPERATOR_KEY doivent être définis dans .env');
        }

        this.operatorId = AccountId.fromString(operatorId);
        this.operatorKey = PrivateKey.fromString(operatorKey);

        // Configuration du client selon l'environnement
        if (process.env.HEDERA_NETWORK === 'mainnet') {
            this.client = Client.forMainnet();
        } else {
            this.client = Client.forTestnet();
        }

        this.client.setOperator(this.operatorId, this.operatorKey);
    }

    /**
     * Exécute une transaction sur un smart contract
     */
    async executeContractFunction(
        contractId: string,
        functionName: string,
        parameters?: ContractFunctionParameters,
        gasLimit: number = 100000
    ): Promise<any> {
        try {
            if (!this.client) {
                throw new Error('Client Hedera non initialisé');
            }

            const contractIdObj = ContractId.fromString(contractId);

            let transaction = new ContractExecuteTransaction()
                .setContractId(contractIdObj)
                .setGas(gasLimit)
                .setFunction(functionName, parameters);

            const txResponse = await transaction.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);
            
            return {
                success: true,
                transactionId: txResponse.transactionId.toString(),
                status: receipt.status.toString(),
                receipt
            };
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Appelle une fonction de lecture sur un smart contract
     */
    async callContractFunction(
        contractId: string,
        functionName: string,
        parameters?: ContractFunctionParameters
    ): Promise<any> {
        try {
            const contractIdObj = ContractId.fromString(contractId);
            
            let query = new ContractCallQuery()
                .setContractId(contractIdObj)
                .setGas(100000)
                .setFunction(functionName, parameters);

            if (!this.client) {
                throw new Error('Client Hedera non initialisé');
            }

            const result = await query.execute(this.client);
            
            return {
                success: true,
                result
            };
        } catch (error) {
            console.error('Erreur lors de l\'appel de la fonction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Obtient le client Hedera
     */
    getClient(): Client {
        if (!this.client) {
            throw new Error('Client Hedera non initialisé');
        }
        return this.client;
    }

    /**
     * Obtient l'ID de l'opérateur
     */
    getOperatorId(): AccountId {
        if (!this.operatorId) {
            throw new Error('Operator ID non initialisé');
        }
        return this.operatorId;
    }

    /**
     * Ferme la connexion client
     */
    close(): void {
        if (this.client) {
            this.client.close();
        }
    }
}

// Instance singleton - Service Hedera activé
export const hederaService = new HederaService();
