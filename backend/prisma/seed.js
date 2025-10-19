"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Début du seeding...');
    const hopitaux = await Promise.all([
        prisma.hopital.upsert({
            where: { code: 'chu-mel' },
            update: {},
            create: {
                code: 'chu-mel',
                nom: 'CHU-MEL',
                ville: 'Cotonou',
                adresse: 'Avenue Clozel, Cotonou',
                telephone: '+229 21 30 01 00',
                email: 'contact@chu-mel.bj',
                directeur: 'Prof. ADJAHOUI Jean',
            },
        }),
        prisma.hopital.upsert({
            where: { code: 'cnhu-hkm' },
            update: {},
            create: {
                code: 'cnhu-hkm',
                nom: 'CNHU-HKM',
                ville: 'Cotonou',
                adresse: 'Avenue Steinmetz, Cotonou',
                telephone: '+229 21 30 02 00',
                email: 'contact@cnhu-hkm.bj',
                directeur: 'Prof. KOSSOU Marie',
            },
        }),
        prisma.hopital.upsert({
            where: { code: 'chu-borgou' },
            update: {},
            create: {
                code: 'chu-borgou',
                nom: 'CHU-BORGOU',
                ville: 'Parakou',
                adresse: 'Route de Tchaourou, Parakou',
                telephone: '+229 23 61 01 00',
                email: 'contact@chu-borgou.bj',
                directeur: 'Dr. SOSSOU Pierre',
            },
        }),
    ]);
    console.log('✅ Hôpitaux créés');
    const passwordHash = await bcrypt_1.default.hash('medecin123', 10);
    const medecins = await Promise.all([
        prisma.medecin.upsert({
            where: { medecinId: 'MED-CHU-001' },
            update: {},
            create: {
                medecinId: 'MED-CHU-001',
                nom: 'ADJAHOUI',
                prenom: 'Dr. Jean',
                email: 'j.adjahoui@chu-mel.bj',
                telephone: '+229 97 11 11 11',
                specialite: 'Médecine Générale',
                numeroOrdre: 'ORD-BJ-001',
                hopitalId: hopitaux[0].id,
                service: 'Médecine Interne',
                passwordHash,
            },
        }),
        prisma.medecin.upsert({
            where: { medecinId: 'MED-CHU-002' },
            update: {},
            create: {
                medecinId: 'MED-CHU-002',
                nom: 'KOSSOU',
                prenom: 'Dr. Marie',
                email: 'm.kossou@chu-mel.bj',
                telephone: '+229 97 22 22 22',
                specialite: 'Cardiologie',
                numeroOrdre: 'ORD-BJ-002',
                hopitalId: hopitaux[0].id,
                service: 'Cardiologie',
                passwordHash,
            },
        }),
        prisma.medecin.upsert({
            where: { medecinId: 'MED-CNHU-001' },
            update: {},
            create: {
                medecinId: 'MED-CNHU-001',
                nom: 'SOSSOU',
                prenom: 'Dr. Pierre',
                email: 'p.sossou@cnhu-hkm.bj',
                telephone: '+229 97 33 33 33',
                specialite: 'Pédiatrie',
                numeroOrdre: 'ORD-BJ-003',
                hopitalId: hopitaux[1].id,
                service: 'Pédiatrie',
                passwordHash,
            },
        }),
    ]);
    console.log('✅ Médecins créés');
    const patients = await Promise.all([
        prisma.patient.upsert({
            where: { patientId: 'BJ20250001' },
            update: {},
            create: {
                patientId: 'BJ20250001',
                nom: 'KOSSOU',
                prenom: 'Adjoa',
                dateNaissance: new Date('1990-05-12'),
                telephone: '+229 97 45 50 90',
                email: 'adjoa.kossou@email.com',
                adresse: 'Quartier Fidjrossè, Cotonou',
                ville: 'Cotonou',
                groupeSanguin: 'A+',
                allergies: ['Pénicilline'],
                maladiesChroniques: [],
                contactUrgence: '+229 97 45 50 91',
                hopitalPrincipal: 'chu-mel',
            },
        }),
        prisma.patient.upsert({
            where: { patientId: 'BJ20250002' },
            update: {},
            create: {
                patientId: 'BJ20250002',
                nom: 'ADJAHOUI',
                prenom: 'Kossi',
                dateNaissance: new Date('1985-08-20'),
                telephone: '+229 96 12 34 56',
                email: 'kossi.adjahoui@email.com',
                adresse: 'Quartier Akpakpa, Cotonou',
                ville: 'Cotonou',
                groupeSanguin: 'O+',
                allergies: [],
                maladiesChroniques: ['Hypertension'],
                contactUrgence: '+229 96 12 34 57',
                hopitalPrincipal: 'chu-mel',
            },
        }),
        prisma.patient.upsert({
            where: { patientId: 'BJ20250003' },
            update: {},
            create: {
                patientId: 'BJ20250003',
                nom: 'SOSSOU',
                prenom: 'Fatima',
                dateNaissance: new Date('1995-12-03'),
                telephone: '+229 95 78 90 12',
                email: 'fatima.sossou@email.com',
                adresse: 'Quartier Godomey, Abomey-Calavi',
                ville: 'Abomey-Calavi',
                groupeSanguin: 'B+',
                allergies: ['Aspirine'],
                maladiesChroniques: [],
                contactUrgence: '+229 95 78 90 13',
                hopitalPrincipal: 'cnhu-hkm',
            },
        }),
    ]);
    console.log('✅ Patients créés');
    const consultations = await Promise.all([
        prisma.consultation.create({
            data: {
                consultationId: 'CONS-2025-001',
                patientId: patients[0].id,
                medecinId: medecins[0].id,
                hopitalId: hopitaux[0].id,
                dateConsultation: new Date('2025-01-02T09:00:00Z'),
                type: 'consultation_generale',
                motif: 'Contrôle de routine',
                diagnostic: 'Patient en bonne santé générale',
                prescription: 'Vitamines C - 1 comprimé/jour pendant 30 jours',
                examensPrescrits: ['Bilan sanguin complet'],
                poids: 65.5,
                taille: 1.68,
                tensionArterielle: '120/80',
                temperature: 36.8,
                pouls: 72,
                statut: 'TERMINEE',
                notes: 'Contrôle annuel satisfaisant',
            },
        }),
        prisma.consultation.create({
            data: {
                consultationId: 'CONS-2025-002',
                patientId: patients[1].id,
                medecinId: medecins[1].id,
                hopitalId: hopitaux[0].id,
                dateConsultation: new Date('2025-01-15T14:30:00Z'),
                type: 'suivi_cardiologique',
                motif: 'Suivi hypertension artérielle',
                diagnostic: 'Hypertension contrôlée sous traitement',
                prescription: 'Amlodipine 5mg - 1 comprimé matin',
                examensPrescrits: ['ECG', 'Échocardiographie'],
                poids: 78.2,
                taille: 1.75,
                tensionArterielle: '135/85',
                temperature: 36.6,
                pouls: 68,
                statut: 'PROGRAMMEE',
                notes: 'Bon contrôle tensionnel',
            },
        }),
    ]);
    console.log('✅ Consultations créées');
    await Promise.all([
        prisma.permissionMedecin.create({
            data: {
                patientId: patients[0].id,
                medecinId: medecins[0].id,
                statut: 'ACTIVE',
                dateAutorisation: new Date(),
                typeAcces: 'COMPLET',
            },
        }),
        prisma.permissionMedecin.create({
            data: {
                patientId: patients[1].id,
                medecinId: medecins[1].id,
                statut: 'ACTIVE',
                dateAutorisation: new Date(),
                typeAcces: 'COMPLET',
            },
        }),
    ]);
    console.log('✅ Permissions créées');
    console.log('🎉 Seeding terminé avec succès!');
}
main()
    .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map