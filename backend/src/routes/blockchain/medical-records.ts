import { Router, Request, Response } from 'express';
import { medicalRecordsService, RecordType, RecordStatus, HederaUtils } from '../../services/hedera';
import { z } from 'zod';

const router = Router();

/**
 * Schémas de validation Zod
 */
const CreateMedicalRecordSchema = z.object({
    patientId: z.number().positive(),
    doctorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide'),
    recordType: z.nativeEnum(RecordType),
    medicalData: z.object({
        diagnosis: z.string().optional(),
        symptoms: z.array(z.string()).optional(),
        treatment: z.string().optional(),
        medications: z.array(z.object({
            name: z.string(),
            dosage: z.string(),
            frequency: z.string(),
            duration: z.string().optional()
        })).optional(),
        notes: z.string().optional(),
        vitalSigns: z.object({
            bloodPressure: z.string().optional(),
            heartRate: z.number().optional(),
            temperature: z.number().optional(),
            weight: z.number().optional(),
            height: z.number().optional()
        }).optional()
    }),
    attachmentHashes: z.array(z.string()).optional(),
    metadata: z.string().optional(),
    isEmergency: z.boolean().optional(),
    authorizedViewers: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).optional()
});

const UpdateRecordStatusSchema = z.object({
    recordId: z.number().positive(),
    status: z.nativeEnum(RecordStatus)
});

const AmendRecordSchema = z.object({
    recordId: z.number().positive(),
    reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères'),
    newMedicalData: z.object({
        diagnosis: z.string().optional(),
        symptoms: z.array(z.string()).optional(),
        treatment: z.string().optional(),
        medications: z.array(z.object({
            name: z.string(),
            dosage: z.string(),
            frequency: z.string(),
            duration: z.string().optional()
        })).optional(),
        notes: z.string().optional()
    })
});

/**
 * POST /api/hedera/add-consultation
 * Ajoute une nouvelle consultation médicale
 */
router.post('/add-consultation', async (req: Request, res: Response) => {
    try {
        const validatedData = CreateMedicalRecordSchema.parse(req.body);

        const result = await medicalRecordsService.createMedicalRecord({
            patientId: validatedData.patientId,
            doctorAddress: validatedData.doctorAddress,
            recordType: validatedData.recordType,
            medicalData: validatedData.medicalData,
            attachmentHashes: validatedData.attachmentHashes,
            metadata: validatedData.metadata,
            isEmergency: validatedData.isEmergency,
            authorizedViewers: validatedData.authorizedViewers
        });

        if (result.success) {
            return res.status(201).json({
                success: true,
                message: 'Consultation ajoutée avec succès',
                data: {
                    transactionId: result.transactionId,
                    encryptedDataHash: result.encryptedDataHash
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'ajout de la consultation',
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
            console.error('Erreur ajout consultation:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * GET /api/hedera/medical-history/:patientId
 * Récupère l'historique médical complet d'un patient
 */
router.get('/medical-history/:patientId', async (req: Request, res: Response) => {
    try {
        const patientId = parseInt(req.params.patientId);
        
        if (isNaN(patientId) || patientId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID patient invalide'
            });
        }

        const result = await medicalRecordsService.getPatientMedicalHistory(patientId);

        if (result.success) {
            // Formater les timestamps pour une meilleure lisibilité
            const formattedRecords = result.records.map((record: any) => ({
                ...record,
                formattedTimestamp: HederaUtils.formatTimestamp(record.timestamp),
                formattedLastModified: HederaUtils.formatTimestamp(record.lastModified)
            }));

            return res.json({
                success: true,
                data: {
                    patientId,
                    recordCount: formattedRecords.length,
                    records: formattedRecords
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Historique médical non trouvé',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Erreur récupération historique:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * GET /api/hedera/medical-record/:recordId
 * Récupère un enregistrement médical spécifique
 */
router.get('/medical-record/:recordId', async (req: Request, res: Response) => {
    try {
        const recordId = parseInt(req.params.recordId);
        
        if (isNaN(recordId) || recordId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'enregistrement invalide'
            });
        }

        const result = await medicalRecordsService.getMedicalRecord(recordId);

        if (result.success) {
            return res.json({
                success: true,
                data: {
                    record: {
                        ...result.record,
                        formattedTimestamp: HederaUtils.formatTimestamp(result.record.timestamp),
                        formattedLastModified: HederaUtils.formatTimestamp(result.record.lastModified)
                    }
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Enregistrement médical non trouvé',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Erreur récupération enregistrement:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

/**
 * PUT /api/hedera/medical-record/status
 * Met à jour le statut d'un enregistrement médical
 */
router.put('/medical-record/status', async (req: Request, res: Response) => {
    try {
        const validatedData = UpdateRecordStatusSchema.parse(req.body);

        const result = await medicalRecordsService.updateRecordStatus(
            validatedData.recordId,
            validatedData.status
        );

        if (result.success) {
            return res.json({
                success: true,
                message: 'Statut mis à jour avec succès',
                data: {
                    transactionId: result.transactionId,
                    newStatus: RecordStatus[validatedData.status]
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de la mise à jour du statut',
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
            console.error('Erreur mise à jour statut:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * POST /api/hedera/medical-record/amend
 * Amende un enregistrement médical existant
 */
router.post('/medical-record/amend', async (req: Request, res: Response) => {
    try {
        const validatedData = AmendRecordSchema.parse(req.body);

        const result = await medicalRecordsService.amendMedicalRecord(
            validatedData.recordId,
            validatedData.reason,
            validatedData.newMedicalData
        );

        if (result.success) {
            return res.json({
                success: true,
                message: 'Enregistrement amendé avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'amendement',
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
            console.error('Erreur amendement:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
});

/**
 * POST /api/hedera/medical-record/authorize-viewer
 * Autorise un utilisateur à voir un enregistrement médical
 */
router.post('/medical-record/authorize-viewer', async (req: Request, res: Response) => {
    try {
        const { recordId, viewerAddress } = req.body;

        if (!recordId || !viewerAddress) {
            return res.status(400).json({
                success: false,
                message: 'recordId et viewerAddress sont requis'
            });
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(viewerAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Adresse Ethereum invalide'
            });
        }

        const result = await medicalRecordsService.authorizeViewer(recordId, viewerAddress);

        if (result.success) {
            return res.json({
                success: true,
                message: 'Visualiseur autorisé avec succès',
                data: {
                    transactionId: result.transactionId
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Erreur lors de l\'autorisation',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Erreur autorisation visualiseur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

export default router;
