import { Router } from 'express';
import patientsRouter from './patients';
import medicalRecordsRouter from './medical-records';
import accessControlRouter from './access-control';

/**
 * Router principal pour toutes les routes blockchain Hedera
 */
const blockchainRouter = Router();

/**
 * Middleware de logging pour les routes blockchain
 */
blockchainRouter.use((req, res, next) => {
    console.log(`[BLOCKCHAIN] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
});

/**
 * Routes pour la gestion des patients
 * - POST /api/hedera/create-patient
 * - GET /api/hedera/patient/:id
 * - PUT /api/hedera/patient/update
 * - POST /api/hedera/authorize-doctor
 * - DELETE /api/hedera/revoke-doctor
 */
blockchainRouter.use('/', patientsRouter);

/**
 * Routes pour la gestion des dossiers médicaux
 * - POST /api/hedera/add-consultation
 * - GET /api/hedera/medical-history/:patientId
 * - GET /api/hedera/medical-record/:recordId
 * - PUT /api/hedera/medical-record/status
 * - POST /api/hedera/medical-record/amend
 * - POST /api/hedera/medical-record/authorize-viewer
 */
blockchainRouter.use('/', medicalRecordsRouter);

/**
 * Routes pour le contrôle d'accès
 * - POST /api/hedera/access-control/register-user
 * - POST /api/hedera/access-control/grant-permission
 * - DELETE /api/hedera/access-control/revoke-permission/:permissionId
 * - POST /api/hedera/access-control/check-permission
 * - GET /api/hedera/access-control/user/:address
 * - POST /api/hedera/access-control/log-access
 */
blockchainRouter.use('/access-control', accessControlRouter);

/**
 * Route de santé pour vérifier le statut des services blockchain
 */
blockchainRouter.get('/health', async (req, res) => {
    try {
        // Vérifier la configuration des contrats
        const contractsStatus = {
            patientIdentityContract: !!process.env.PATIENT_IDENTITY_CONTRACT_ID,
            accessControlContract: !!process.env.ACCESS_CONTROL_CONTRACT_ID,
            medicalRecordsContract: !!process.env.MEDICAL_RECORDS_CONTRACT_ID
        };

        // Vérifier la configuration Hedera
        const hederaConfig = {
            operatorId: !!process.env.OPERATOR_ID,
            operatorKey: !!process.env.OPERATOR_KEY,
            network: process.env.HEDERA_NETWORK || 'testnet'
        };

        const allContractsConfigured = Object.values(contractsStatus).every(status => status);
        const hederaConfigured = hederaConfig.operatorId && hederaConfig.operatorKey;

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            status: allContractsConfigured && hederaConfigured ? 'healthy' : 'warning',
            services: {
                hedera: {
                    configured: hederaConfigured,
                    network: hederaConfig.network
                },
                contracts: contractsStatus
            },
            warnings: [
                ...(!hederaConfig.operatorId ? ['OPERATOR_ID non configuré'] : []),
                ...(!hederaConfig.operatorKey ? ['OPERATOR_KEY non configuré'] : []),
                ...(!contractsStatus.patientIdentityContract ? ['PATIENT_IDENTITY_CONTRACT_ID non configuré'] : []),
                ...(!contractsStatus.accessControlContract ? ['ACCESS_CONTROL_CONTRACT_ID non configuré'] : []),
                ...(!contractsStatus.medicalRecordsContract ? ['MEDICAL_RECORDS_CONTRACT_ID non configuré'] : [])
            ]
        });
    } catch (error) {
        console.error('Erreur health check blockchain:', error);
        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Erreur lors de la vérification du statut',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
});

/**
 * Route d'information sur les contrats déployés
 */
blockchainRouter.get('/contracts', (req, res) => {
    res.json({
        success: true,
        contracts: {
            patientIdentity: {
                contractId: process.env.PATIENT_IDENTITY_CONTRACT_ID || 'Non configuré',
                description: 'Gestion des identités patients'
            },
            accessControl: {
                contractId: process.env.ACCESS_CONTROL_CONTRACT_ID || 'Non configuré',
                description: 'Contrôle d\'accès et permissions'
            },
            medicalRecords: {
                contractId: process.env.MEDICAL_RECORDS_CONTRACT_ID || 'Non configuré',
                description: 'Gestion des dossiers médicaux'
            }
        },
        network: process.env.HEDERA_NETWORK || 'testnet',
        operatorId: process.env.OPERATOR_ID || 'Non configuré'
    });
});

/**
 * Middleware de gestion d'erreurs pour les routes blockchain
 */
blockchainRouter.use((error: any, req: any, res: any, next: any) => {
    console.error('[BLOCKCHAIN ERROR]', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }

    if (error instanceof Error ? error.message : 'Erreur inconnue'?.includes('Hedera')) {
        return res.status(503).json({
            success: false,
            message: 'Service Hedera temporairement indisponible',
            error: 'Veuillez réessayer plus tard'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur blockchain',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Erreur inconnue' : 'Une erreur inattendue s\'est produite'
    });
});

export default blockchainRouter;
