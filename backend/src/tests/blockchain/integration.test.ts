import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { 
    hederaService, 
    patientIdentityService, 
    accessControlService, 
    medicalRecordsService,
    UserRole,
    RecordType,
    RecordStatus,
    HederaUtils
} from '../../services/hedera';

/**
 * Test d'intégration complète du système Hedera Health ID
 * 
 * Ce test simule un workflow complet :
 * 1. Enregistrement d'un patient
 * 2. Enregistrement d'un médecin
 * 3. Octroi de permissions
 * 4. Création d'un dossier médical
 * 5. Consultation du dossier
 * 6. Mise à jour et amendement
 * 7. Révocation des accès
 */
describe('Intégration complète - Workflow Hedera Health ID', () => {
    let patientId: number;
    let recordId: number;
    let permissionId: number;

    const testData = {
        patient: {
            personalData: {
                firstName: 'Alice',
                lastName: 'Dubois',
                dateOfBirth: '1992-03-20',
                gender: 'F',
                nationalId: '192032012345',
                phoneNumber: '+33123456789',
                email: 'alice.dubois@example.com',
                address: {
                    street: '456 Avenue des Champs',
                    city: 'Lyon',
                    country: 'France',
                    postalCode: '69000'
                }
            },
            patientAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            metadataHash: 'patient-alice-metadata-hash'
        },
        doctor: {
            userAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            role: UserRole.DOCTOR,
            publicKey: 'doctor-public-key-integration-test',
            professionalId: 'DOC-INTEGRATION-001'
        },
        medicalRecord: {
            recordType: RecordType.CONSULTATION,
            medicalData: {
                diagnosis: 'Consultation de routine - Bilan de santé',
                symptoms: ['Aucun symptôme particulier'],
                treatment: 'Maintenir un mode de vie sain',
                medications: [{
                    name: 'Vitamine D',
                    dosage: '1000 UI',
                    frequency: '1 fois par jour',
                    duration: '3 mois'
                }],
                notes: 'Patient en bonne santé générale. Recommandations préventives données.',
                vitalSigns: {
                    bloodPressure: '115/75',
                    heartRate: 68,
                    temperature: 36.6,
                    weight: 62,
                    height: 168
                }
            },
            metadata: 'Bilan de santé annuel',
            isEmergency: false
        }
    };

    beforeAll(async () => {
        // Vérifier la configuration
        expect(process.env.OPERATOR_ID).toBeDefined();
        expect(process.env.OPERATOR_KEY).toBeDefined();
        expect(process.env.PATIENT_IDENTITY_CONTRACT_ID).toBeDefined();
        expect(process.env.ACCESS_CONTROL_CONTRACT_ID).toBeDefined();
        expect(process.env.MEDICAL_RECORDS_CONTRACT_ID).toBeDefined();

        console.log('🚀 Début du test d\'intégration complète');
    });

    afterAll(async () => {
        hederaService.close();
        console.log('✅ Test d\'intégration complète terminé');
    });

    test('Workflow complet - De l\'enregistrement à la consultation', async () => {
        console.log('📝 Étape 1: Enregistrement du patient');
        
        // 1. Enregistrer le patient
        const patientResult = await patientIdentityService.registerPatient(testData.patient);
        expect(patientResult.success).toBe(true);
        expect(patientResult.transactionId).toBeDefined();
        
        // Simuler l'ID patient (dans un vrai test, récupérer depuis l'événement)
        patientId = 1;
        console.log(`✅ Patient enregistré avec l'ID: ${patientId}`);

        console.log('👨‍⚕️ Étape 2: Enregistrement du médecin');
        
        // 2. Enregistrer le médecin
        const doctorResult = await accessControlService.registerUser(testData.doctor);
        expect(doctorResult.success).toBe(true);
        expect(doctorResult.transactionId).toBeDefined();
        console.log('✅ Médecin enregistré avec succès');

        console.log('🔐 Étape 3: Octroi des permissions');
        
        // 3. Accorder des permissions au médecin
        const permissionData = {
            grantorAddress: testData.patient.patientAddress,
            granteeAddress: testData.doctor.userAddress,
            patientId: patientId,
            expirationDate: HederaUtils.dateToTimestamp(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 jours
            allowedActions: ['READ_MEDICAL_RECORD', 'WRITE_MEDICAL_RECORD', 'UPDATE_MEDICAL_RECORD']
        };

        const permissionResult = await accessControlService.grantPermission(permissionData);
        expect(permissionResult.success).toBe(true);
        expect(permissionResult.transactionId).toBeDefined();
        console.log('✅ Permissions accordées au médecin');

        console.log('📋 Étape 4: Vérification des permissions');
        
        // 4. Vérifier que le médecin a les permissions
        const hasPermissionResult = await accessControlService.hasPermission(
            testData.doctor.userAddress,
            patientId,
            'READ_MEDICAL_RECORD'
        );
        expect(hasPermissionResult.success).toBe(true);
        expect(hasPermissionResult.hasPermission).toBe(true);
        console.log('✅ Permissions vérifiées');

        console.log('🏥 Étape 5: Création du dossier médical');
        
        // 5. Créer un dossier médical
        const recordData = {
            patientId: patientId,
            doctorAddress: testData.doctor.userAddress,
            ...testData.medicalRecord,
            authorizedViewers: [testData.doctor.userAddress]
        };

        const recordResult = await medicalRecordsService.createMedicalRecord(recordData);
        expect(recordResult.success).toBe(true);
        expect(recordResult.transactionId).toBeDefined();
        expect(recordResult.encryptedDataHash).toBeDefined();
        
        recordId = 1; // Simulé
        console.log(`✅ Dossier médical créé avec l'ID: ${recordId}`);

        console.log('📖 Étape 6: Consultation du dossier');
        
        // 6. Récupérer le dossier médical
        const getRecordResult = await medicalRecordsService.getMedicalRecord(recordId);
        expect(getRecordResult.success).toBe(true);
        expect(getRecordResult.record).toBeDefined();
        expect(getRecordResult.record.patientId).toBe(patientId);
        console.log('✅ Dossier médical récupéré avec succès');

        console.log('📚 Étape 7: Consultation de l\'historique');
        
        // 7. Récupérer l'historique médical du patient
        const historyResult = await medicalRecordsService.getPatientMedicalHistory(patientId);
        expect(historyResult.success).toBe(true);
        expect(historyResult.records).toBeDefined();
        expect(Array.isArray(historyResult.records)).toBe(true);
        console.log(`✅ Historique récupéré: ${historyResult.records.length} enregistrement(s)`);

        console.log('✏️ Étape 8: Finalisation du dossier');
        
        // 8. Finaliser le dossier médical
        const statusResult = await medicalRecordsService.updateRecordStatus(
            recordId,
            RecordStatus.FINALIZED
        );
        expect(statusResult.success).toBe(true);
        expect(statusResult.transactionId).toBeDefined();
        console.log('✅ Statut du dossier mis à jour: FINALIZED');

        console.log('📝 Étape 9: Enregistrement des logs d\'accès');
        
        // 9. Enregistrer un log d'accès
        const logResult = await accessControlService.logAccess({
            accessor: testData.doctor.userAddress,
            patientId: patientId,
            action: 'READ_MEDICAL_RECORD',
            success: true,
            details: 'Consultation du dossier médical lors du bilan de santé'
        });
        expect(logResult.success).toBe(true);
        expect(logResult.transactionId).toBeDefined();
        console.log('✅ Log d\'accès enregistré');

        console.log('🔒 Étape 10: Test de révocation d\'accès');
        
        // 10. Révoquer l'accès du médecin (test de sécurité)
        const revokeResult = await patientIdentityService.revokeAccess(
            patientId,
            testData.doctor.userAddress
        );
        expect(revokeResult.success).toBe(true);
        expect(revokeResult.transactionId).toBeDefined();
        console.log('✅ Accès révoqué avec succès');

        console.log('🎉 Workflow complet terminé avec succès !');
        
    }, 300000); // 5 minutes timeout pour le test complet

    test('Test de récupération des informations utilisateur', async () => {
        console.log('👤 Test de récupération des informations utilisateur');
        
        const userResult = await accessControlService.getUser(testData.doctor.userAddress);
        expect(userResult.success).toBe(true);
        expect(userResult.user).toBeDefined();
        expect(userResult.user.role).toBe(UserRole.DOCTOR);
        expect(userResult.user.professionalId).toBe(testData.doctor.professionalId);
        
        console.log('✅ Informations utilisateur récupérées avec succès');
    }, 30000);

    test('Test de récupération des informations patient', async () => {
        console.log('🏥 Test de récupération des informations patient');
        
        if (!patientId) patientId = 1;
        
        const patientResult = await patientIdentityService.getPatient(patientId);
        expect(patientResult.success).toBe(true);
        expect(patientResult.patient).toBeDefined();
        expect(patientResult.patient.patientId).toBe(patientId);
        
        console.log('✅ Informations patient récupérées avec succès');
    }, 30000);

    test('Test de gestion d\'erreurs', async () => {
        console.log('❌ Test de gestion d\'erreurs');
        
        // Test avec un patient inexistant
        const invalidPatientResult = await patientIdentityService.getPatient(99999);
        expect(invalidPatientResult.success).toBe(false);
        expect(invalidPatientResult.error).toBeDefined();
        
        // Test avec un utilisateur inexistant
        const invalidUserResult = await accessControlService.getUser('0x0000000000000000000000000000000000000000');
        expect(invalidUserResult.success).toBe(false);
        expect(invalidUserResult.error).toBeDefined();
        
        // Test avec un dossier inexistant
        const invalidRecordResult = await medicalRecordsService.getMedicalRecord(99999);
        expect(invalidRecordResult.success).toBe(false);
        expect(invalidRecordResult.error).toBeDefined();
        
        console.log('✅ Gestion d\'erreurs validée');
    }, 60000);
});
