import { Router, Request, Response } from 'express';
import { accessControlService, UserRole, HederaUtils } from '../../services/hedera';
import { z } from 'zod';

const router = Router();

/**
 * Schémas de validation Zod
 */
const RegisterUserSchema = z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    role: z.nativeEnum(UserRole),
    publicKey: z.string().min(1, 'Clé publique requise'),
    professionalId: z.string().optional()
});

const GrantPermissionSchema = z.object({
    grantorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    granteeAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    patientId: z.number().positive(),
    expirationDate: z.string().datetime().or(z.number().positive()),
    allowedActions: z.array(z.string()).min(1, 'Au moins une action autorisée requise')
});

const CheckPermissionSchema = z.object({
    userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    patientId: z.number().positive(),
    action: z.string().min(1, 'Action requise')
});

const LogAccessSchema = z.object({
    accessor: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    patientId: z.number().positive(),
    action: z.string().min(1, 'Action requise'),
    success: z.boolean(),
    details: z.string().optional().default('')
});

/**
 * POST /api/hedera/access-control/register-user
 * Enregistre un nouvel utilisateur dans le système de contrôle d'accès
 */
router.post('/register-user', async (req: Request, res: Response) => {
    try {
        const validatedData = RegisterUserSchema.parse(req.body);

        const result = await accessControlService.registerUser({
            userAddress: validatedData.userAddress,
            role: validatedData.role,
            publicKey: validatedData.publicKey,
            professionalId: validatedData.professionalId
        });

        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Utilisateur enregistré avec succès',
                data: {
                    transactionId: result.transactionId,
                    userRole: UserRole[validatedData.role]
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'enregistrement de l\'utilisateur',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur enregistrement utilisateur:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * POST /api/hedera/access-control/grant-permission
 * Accorde une permission d'accès
 */
router.post('/grant-permission', async (req: Request, res: Response) => {
    try {
        const validatedData = GrantPermissionSchema.parse(req.body);

        // Convertir la date d'expiration en timestamp si nécessaire
        let expirationTimestamp: number;
        if (typeof validatedData.expirationDate === 'string') {
            expirationTimestamp = HederaUtils.dateToTimestamp(new Date(validatedData.expirationDate));
        } else {
            expirationTimestamp = validatedData.expirationDate;
        }

        const result = await accessControlService.grantPermission({
            grantorAddress: validatedData.grantorAddress,
            granteeAddress: validatedData.granteeAddress,
            patientId: validatedData.patientId,
            expirationDate: expirationTimestamp,
            allowedActions: validatedData.allowedActions
        });

        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Permission accordée avec succès',
                data: {
                    transactionId: result.transactionId,
                    expirationDate: HederaUtils.formatTimestamp(expirationTimestamp)
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'octroi de permission',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur octroi permission:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * DELETE /api/hedera/access-control/revoke-permission/:permissionId
 * Révoque une permission d'accès
 */
router.delete('/revoke-permission/:permissionId', async (req: Request, res: Response) => {
    try {
        const permissionId = parseInt(req.params.permissionId);
        
        if (isNaN(permissionId) || permissionId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de permission invalide'
            });
        }

        const result = await accessControlService.revokePermission(permissionId);

        if (result.success) {
            return res.json({
                success: true,
                message: 'Permission révoquée avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de la révocation',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Erreur révocation permission:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * POST /api/hedera/access-control/check-permission
 * Vérifie si un utilisateur a une permission spécifique
 */
router.post('/check-permission', async (req: Request, res: Response) => {
    try {
        const validatedData = CheckPermissionSchema.parse(req.body);

        const result = await accessControlService.hasPermission(
            validatedData.userAddress,
            validatedData.patientId,
            validatedData.action
        );

        if (result.success) {
            return res.json({
                success: true,
                data: {
                    hasPermission: result.hasPermission,
                    userAddress: validatedData.userAddress,
                    patientId: validatedData.patientId,
                    action: validatedData.action
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de la vérification de permission',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur vérification permission:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * GET /api/hedera/access-control/user/:address
 * Récupère les informations d'un utilisateur
 */
router.get('/user/:address', async (req: Request, res: Response) => {
    try {
        const userAddress = req.params.address;

        if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Adresse Ethereum invalide'
            });
        }

        const result = await accessControlService.getUser(userAddress);

        if (result.success) {
            return res.json({
                success: true,
                data: {
                    user: {
                        ...result.user,
                        roleName: UserRole[result.user.role],
                        formattedRegistrationDate: HederaUtils.formatTimestamp(result.user.registrationDate)
                    }
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * POST /api/hedera/access-control/log-access
 * Enregistre un log d'accès
 */
router.post('/log-access', async (req: Request, res: Response) => {
    try {
        const validatedData = LogAccessSchema.parse(req.body);

        const result = await accessControlService.logAccess({
            accessor: validatedData.accessor,
            patientId: validatedData.patientId,
            action: validatedData.action,
            success: validatedData.success,
            details: validatedData.details
        });

        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Log d\'accès enregistré avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'enregistrement du log',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur enregistrement log:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

export default router;
