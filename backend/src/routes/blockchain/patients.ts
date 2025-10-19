import { Router, Request, Response } from 'express';
import { patientIdentityService, HederaUtils } from '../../services/hedera';
import { z } from 'zod';

const router = Router();

/**
 * Schémas de validation Zod
 */
const CreatePatientSchema = z.object({
    personalData: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        dateOfBirth: z.string(),
        gender: z.enum(['M', 'F', 'Other']),
        nationalId: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional(),
        address: z.object({
            street: z.string(),
            city: z.string(),
            country: z.string(),
            postalCode: z.string().optional()
        }).optional()
    }),
    patientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    metadataHash: z.string().optional()
});

const UpdatePatientSchema = z.object({
    patientId: z.number().positive(),
    personalData: z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional(),
        address: z.object({
            street: z.string(),
            city: z.string(),
            country: z.string(),
            postalCode: z.string().optional()
        }).optional()
    }),
    metadataHash: z.string().optional()
});

const AccessControlSchema = z.object({
    patientId: z.number().positive(),
    doctorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide')
});

/**
 * POST /api/hedera/create-patient
 * Crée un nouveau patient sur la blockchain
 */
router.post('/create-patient', async (req: Request, res: Response) => {
    try {
        // Validation des données
        const validatedData = CreatePatientSchema.parse(req.body);

        // Enregistrement sur la blockchain
        const result = await patientIdentityService.registerPatient({
            personalData: validatedData.personalData,
            patientAddress: validatedData.patientAddress,
            metadataHash: validatedData.metadataHash
        });

        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Patient créé avec succès sur la blockchain',
                data: {
                    transactionId: result.transactionId,
                    encryptedData: result.encryptedData
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la création du patient',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur création patient:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * GET /api/hedera/patient/:id
 * Récupère les informations d'un patient
 */
router.get('/patient/:id', async (req: Request, res: Response) => {
    try {
        const patientId = parseInt(req.params.id);
        
        if (isNaN(patientId) || patientId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID patient invalide'
            });
        }

        const result = await patientIdentityService.getPatient(patientId);

        if (result.success) {
            return res.json({
                success: true,
                data: {
                    patient: result.patient,
                    timestamp: HederaUtils.formatTimestamp(result.patient.creationDate)
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Patient non trouvé',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Erreur récupération patient:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * PUT /api/hedera/patient/update
 * Met à jour les données d'un patient
 */
router.put('/patient/update', async (req: Request, res: Response) => {
    try {
        const validatedData = UpdatePatientSchema.parse(req.body);

        const result = await patientIdentityService.updatePatientData(
            validatedData.patientId,
            validatedData.personalData,
            validatedData.metadataHash
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Données patient mises à jour avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la mise à jour',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur mise à jour patient:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * POST /api/hedera/authorize-doctor
 * Autorise un médecin à accéder aux données d'un patient
 */
router.post('/authorize-doctor', async (req: Request, res: Response) => {
    try {
        const validatedData = AccessControlSchema.parse(req.body);

        const result = await patientIdentityService.grantAccess(
            validatedData.patientId,
            validatedData.doctorAddress
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Accès accordé au médecin avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'autorisation',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur autorisation médecin:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * DELETE /api/hedera/revoke-doctor
 * Révoque l'accès d'un médecin aux données d'un patient
 */
router.delete('/revoke-doctor', async (req: Request, res: Response) => {
    try {
        const validatedData = AccessControlSchema.parse(req.body);

        const result = await patientIdentityService.revokeAccess(
            validatedData.patientId,
            validatedData.doctorAddress
        );

        if (result.success) {
            res.json({
                success: true,
                message: 'Accès révoqué avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Erreur lors de la révocation',
                error: result.error
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.errors
            });
        } else {
            console.error('Erreur révocation médecin:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

export default router;
