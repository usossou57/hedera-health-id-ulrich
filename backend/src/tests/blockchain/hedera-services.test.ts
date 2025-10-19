import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { 
    hederaService, 
    patientIdentityService, 
    accessControlService, 
    medicalRecordsService,
    UserRole,
    RecordType,
    RecordStatus 
} from '../../services/hedera';

/**
 * Tests d'intégration pour les services Hedera
 * 
 * Ces tests nécessitent une configuration Hedera valide dans .env
 * et des contrats déployés sur le testnet.
 */
describe('Services Hedera - Tests d\'intégration', () => {
    let testPatientId: number;
    let testRecordId: number;
    const testPatientAddress = '0x1234567890123456789012345678901234567890';
    const testDoctorAddress = '0x0987654321098765432109876543210987654321';

    beforeAll(async () => {
        // Vérifier que les variables d'environnement sont configurées
        expect(process.env.OPERATOR_ID).toBeDefined();
        expect(process.env.OPERATOR_KEY).toBeDefined();
        expect(process.env.PATIENT_IDENTITY_CONTRACT_ID).toBeDefined();
        expect(process.env.ACCESS_CONTROL_CONTRACT_ID).toBeDefined();
        expect(process.env.MEDICAL_RECORDS_CONTRACT_ID).toBeDefined();
    });

    afterAll(async () => {
        // Fermer la connexion Hedera
        hederaService.close();
    });

    describe('Service d\'identité patient', () => {
        test('Devrait enregistrer un nouveau patient', async () => {
            const patientData = {
                personalData: {
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    dateOfBirth: '1990-01-01',
                    gender: 'M',
                    nationalId: '123456789',
                    phoneNumber: '+33123456789',
                    email: 'jean.dupont@example.com'
                },
                patientAddress: testPatientAddress,
                metadataHash: 'test-metadata-hash'
            };

            const result = await patientIdentityService.registerPatient(patientData);
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
            expect(result.encryptedData).toBeDefined();
            
            // Stocker l'ID pour les tests suivants
            // Note: Dans un vrai test, vous devriez récupérer l'ID depuis l'événement de transaction
            testPatientId = 1; // Simulé pour cet exemple
        }, 30000);

        test('Devrait récupérer les informations d\'un patient', async () => {
            if (!testPatientId) {
                testPatientId = 1; // Utiliser un ID existant pour le test
            }

            const result = await patientIdentityService.getPatient(testPatientId);
            
            expect(result.success).toBe(true);
            expect(result.patient).toBeDefined();
            expect(result.patient.patientId).toBe(testPatientId);
        }, 15000);

        test('Devrait accorder l\'accès à un médecin', async () => {
            if (!testPatientId) {
                testPatientId = 1;
            }

            const result = await patientIdentityService.grantAccess(
                testPatientId,
                testDoctorAddress
            );
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
        }, 20000);

        test('Devrait révoquer l\'accès d\'un médecin', async () => {
            if (!testPatientId) {
                testPatientId = 1;
            }

            const result = await patientIdentityService.revokeAccess(
                testPatientId,
                testDoctorAddress
            );
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
        }, 20000);
    });

    describe('Service de contrôle d\'accès', () => {
        test('Devrait enregistrer un nouvel utilisateur', async () => {
            const userData = {
                userAddress: testDoctorAddress,
                role: UserRole.DOCTOR,
                publicKey: 'test-public-key-123',
                professionalId: 'DOC123456'
            };

            const result = await accessControlService.registerUser(userData);
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
        }, 25000);

        test('Devrait récupérer les informations d\'un utilisateur', async () => {
            const result = await accessControlService.getUser(testDoctorAddress);
            
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.user.userAddress).toBe(testDoctorAddress);
            expect(result.user.role).toBe(UserRole.DOCTOR);
        }, 15000);

        test('Devrait vérifier les permissions d\'un utilisateur', async () => {
            if (!testPatientId) {
                testPatientId = 1;
            }

            const result = await accessControlService.hasPermission(
                testDoctorAddress,
                testPatientId,
                'READ_MEDICAL_RECORD'
            );
            
            expect(result.success).toBe(true);
            expect(typeof result.hasPermission).toBe('boolean');
        }, 15000);

        test('Devrait enregistrer un log d\'accès', async () => {
            if (!testPatientId) {
                testPatientId = 1;
            }

            const logData = {
                accessor: testDoctorAddress,
                patientId: testPatientId,
                action: 'READ_MEDICAL_RECORD',
                success: true,
                details: 'Test access log'
            };

            const result = await accessControlService.logAccess(logData);
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
        }, 20000);
    });

    describe('Service de dossiers médicaux', () => {
        test('Devrait créer un nouveau dossier médical', async () => {
            if (!testPatientId) {
                testPatientId = 1;
            }

            const recordData = {
                patientId: testPatientId,
                doctorAddress: testDoctorAddress,
                recordType: RecordType.CONSULTATION,
                medicalData: {
                    diagnosis: 'Hypertension artérielle',
                    symptoms: ['Maux de tête', 'Fatigue'],
                    treatment: 'Repos et médication',
                    medications: [{
                        name: 'Lisinopril',
                        dosage: '10mg',
                        frequency: '1 fois par jour',
                        duration: '30 jours'
                    }],
                    notes: 'Patient répondant bien au traitement',
                    vitalSigns: {
                        bloodPressure: '140/90',
                        heartRate: 75,
                        temperature: 36.8,
                        weight: 70,
                        height: 175
                    }
                },
                metadata: 'Consultation de routine',
                isEmergency: false,
                authorizedViewers: [testDoctorAddress]
            };

            const result = await medicalRecordsService.createMedicalRecord(recordData);
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
            expect(result.encryptedDataHash).toBeDefined();
            
            // Stocker l'ID pour les tests suivants
            testRecordId = 1; // Simulé pour cet exemple
        }, 35000);

        test('Devrait récupérer un dossier médical', async () => {
            if (!testRecordId) {
                testRecordId = 1;
            }

            const result = await medicalRecordsService.getMedicalRecord(testRecordId);
            
            expect(result.success).toBe(true);
            expect(result.record).toBeDefined();
            expect(result.record.recordId).toBe(testRecordId);
        }, 15000);

        test('Devrait récupérer l\'historique médical d\'un patient', async () => {
            if (!testPatientId) {
                testPatientId = 1;
            }

            const result = await medicalRecordsService.getPatientMedicalHistory(testPatientId);
            
            expect(result.success).toBe(true);
            expect(result.records).toBeDefined();
            expect(Array.isArray(result.records)).toBe(true);
        }, 20000);

        test('Devrait mettre à jour le statut d\'un dossier', async () => {
            if (!testRecordId) {
                testRecordId = 1;
            }

            const result = await medicalRecordsService.updateRecordStatus(
                testRecordId,
                RecordStatus.FINALIZED
            );
            
            expect(result.success).toBe(true);
            expect(result.transactionId).toBeDefined();
        }, 20000);
    });

    describe('Tests d\'erreur et de validation', () => {
        test('Devrait gérer les erreurs de patient inexistant', async () => {
            const result = await patientIdentityService.getPatient(99999);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        }, 15000);

        test('Devrait gérer les erreurs d\'utilisateur inexistant', async () => {
            const result = await accessControlService.getUser('0x0000000000000000000000000000000000000000');
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        }, 15000);

        test('Devrait gérer les erreurs de dossier inexistant', async () => {
            const result = await medicalRecordsService.getMedicalRecord(99999);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        }, 15000);
    });
});
