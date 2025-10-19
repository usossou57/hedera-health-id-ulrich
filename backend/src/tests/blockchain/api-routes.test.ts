import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import blockchainRouter from '../../routes/blockchain';

/**
 * Tests d'intégration pour les routes API blockchain
 * 
 * Ces tests nécessitent une configuration Hedera valide et des contrats déployés.
 */
describe('Routes API Blockchain - Tests d\'intégration', () => {
    let app: express.Application;
    let testPatientId: number;
    let testRecordId: number;

    beforeAll(async () => {
        // Configuration de l'application Express pour les tests
        app = express();
        app.use(express.json());
        app.use('/api/hedera', blockchainRouter);

        // Vérifier la configuration
        expect(process.env.OPERATOR_ID).toBeDefined();
        expect(process.env.OPERATOR_KEY).toBeDefined();
    });

    describe('Routes des patients', () => {
        test('POST /api/hedera/create-patient - Devrait créer un nouveau patient', async () => {
            const patientData = {
                personalData: {
                    firstName: 'Marie',
                    lastName: 'Martin',
                    dateOfBirth: '1985-05-15',
                    gender: 'F',
                    nationalId: '987654321',
                    phoneNumber: '+33987654321',
                    email: 'marie.martin@example.com',
                    address: {
                        street: '123 Rue de la Paix',
                        city: 'Paris',
                        country: 'France',
                        postalCode: '75001'
                    }
                },
                patientAddress: '0x1111111111111111111111111111111111111111',
                metadataHash: 'test-metadata-hash-api'
            };

            const response = await request(app)
                .post('/api/hedera/create-patient')
                .send(patientData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
            expect(response.body.data.encryptedData).toBeDefined();
        }, 30000);

        test('GET /api/hedera/patient/:id - Devrait récupérer un patient', async () => {
            const patientId = 1; // Utiliser un ID existant

            const response = await request(app)
                .get(`/api/hedera/patient/${patientId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.patient).toBeDefined();
            expect(response.body.data.timestamp).toBeDefined();
        }, 20000);

        test('PUT /api/hedera/patient/update - Devrait mettre à jour un patient', async () => {
            const updateData = {
                patientId: 1,
                personalData: {
                    phoneNumber: '+33111222333',
                    email: 'marie.martin.updated@example.com'
                },
                metadataHash: 'updated-metadata-hash'
            };

            const response = await request(app)
                .put('/api/hedera/patient/update')
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
        }, 25000);

        test('POST /api/hedera/authorize-doctor - Devrait autoriser un médecin', async () => {
            const authData = {
                patientId: 1,
                doctorAddress: '0x2222222222222222222222222222222222222222'
            };

            const response = await request(app)
                .post('/api/hedera/authorize-doctor')
                .send(authData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
        }, 25000);

        test('DELETE /api/hedera/revoke-doctor - Devrait révoquer un médecin', async () => {
            const revokeData = {
                patientId: 1,
                doctorAddress: '0x2222222222222222222222222222222222222222'
            };

            const response = await request(app)
                .delete('/api/hedera/revoke-doctor')
                .send(revokeData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
        }, 25000);
    });

    describe('Routes des dossiers médicaux', () => {
        test('POST /api/hedera/add-consultation - Devrait ajouter une consultation', async () => {
            const consultationData = {
                patientId: 1,
                doctorAddress: '0x2222222222222222222222222222222222222222',
                recordType: 0, // CONSULTATION
                medicalData: {
                    diagnosis: 'Grippe saisonnière',
                    symptoms: ['Fièvre', 'Toux', 'Fatigue'],
                    treatment: 'Repos et hydratation',
                    medications: [{
                        name: 'Paracétamol',
                        dosage: '500mg',
                        frequency: '3 fois par jour',
                        duration: '7 jours'
                    }],
                    notes: 'Symptômes légers, récupération attendue sous 7 jours',
                    vitalSigns: {
                        bloodPressure: '120/80',
                        heartRate: 80,
                        temperature: 38.2,
                        weight: 65,
                        height: 165
                    }
                },
                metadata: 'Consultation d\'urgence',
                isEmergency: false,
                authorizedViewers: ['0x2222222222222222222222222222222222222222']
            };

            const response = await request(app)
                .post('/api/hedera/add-consultation')
                .send(consultationData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
            expect(response.body.data.encryptedDataHash).toBeDefined();
        }, 35000);

        test('GET /api/hedera/medical-history/:patientId - Devrait récupérer l\'historique', async () => {
            const patientId = 1;

            const response = await request(app)
                .get(`/api/hedera/medical-history/${patientId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.patientId).toBe(patientId);
            expect(response.body.data.records).toBeDefined();
            expect(Array.isArray(response.body.data.records)).toBe(true);
        }, 25000);

        test('GET /api/hedera/medical-record/:recordId - Devrait récupérer un dossier', async () => {
            const recordId = 1;

            const response = await request(app)
                .get(`/api/hedera/medical-record/${recordId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.record).toBeDefined();
        }, 20000);

        test('PUT /api/hedera/medical-record/status - Devrait mettre à jour le statut', async () => {
            const statusData = {
                recordId: 1,
                status: 1 // FINALIZED
            };

            const response = await request(app)
                .put('/api/hedera/medical-record/status')
                .send(statusData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
            expect(response.body.data.newStatus).toBe('FINALIZED');
        }, 25000);
    });

    describe('Routes de contrôle d\'accès', () => {
        test('POST /api/hedera/access-control/register-user - Devrait enregistrer un utilisateur', async () => {
            const userData = {
                userAddress: '0x3333333333333333333333333333333333333333',
                role: 1, // DOCTOR
                publicKey: 'test-public-key-api-123',
                professionalId: 'DOC789012'
            };

            const response = await request(app)
                .post('/api/hedera/access-control/register-user')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.transactionId).toBeDefined();
            expect(response.body.data.userRole).toBe('DOCTOR');
        }, 30000);

        test('GET /api/hedera/access-control/user/:address - Devrait récupérer un utilisateur', async () => {
            const userAddress = '0x3333333333333333333333333333333333333333';

            const response = await request(app)
                .get(`/api/hedera/access-control/user/${userAddress}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.userAddress).toBe(userAddress);
        }, 20000);

        test('POST /api/hedera/access-control/check-permission - Devrait vérifier les permissions', async () => {
            const permissionData = {
                userAddress: '0x3333333333333333333333333333333333333333',
                patientId: 1,
                action: 'READ_MEDICAL_RECORD'
            };

            const response = await request(app)
                .post('/api/hedera/access-control/check-permission')
                .send(permissionData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(typeof response.body.data.hasPermission).toBe('boolean');
        }, 20000);
    });

    describe('Routes utilitaires', () => {
        test('GET /api/hedera/health - Devrait retourner le statut de santé', async () => {
            const response = await request(app)
                .get('/api/hedera/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.status).toBeDefined();
            expect(response.body.services).toBeDefined();
        });

        test('GET /api/hedera/contracts - Devrait retourner les informations des contrats', async () => {
            const response = await request(app)
                .get('/api/hedera/contracts')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.contracts).toBeDefined();
            expect(response.body.network).toBeDefined();
        });
    });

    describe('Tests de validation et d\'erreur', () => {
        test('POST /api/hedera/create-patient - Devrait rejeter des données invalides', async () => {
            const invalidData = {
                personalData: {
                    firstName: '', // Invalide
                    lastName: 'Test'
                },
                patientAddress: 'invalid-address' // Invalide
            };

            const response = await request(app)
                .post('/api/hedera/create-patient')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        test('GET /api/hedera/patient/:id - Devrait gérer un ID invalide', async () => {
            const response = await request(app)
                .get('/api/hedera/patient/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('invalide');
        });

        test('GET /api/hedera/patient/:id - Devrait gérer un patient inexistant', async () => {
            const response = await request(app)
                .get('/api/hedera/patient/99999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });
});
