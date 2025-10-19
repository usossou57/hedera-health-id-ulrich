-- CreateEnum
CREATE TYPE "ConsultationStatut" AS ENUM ('PROGRAMMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE', 'REPORTEE');

-- CreateEnum
CREATE TYPE "PermissionStatut" AS ENUM ('EN_ATTENTE', 'ACTIVE', 'SUSPENDUE', 'REVOQUEE', 'EXPIREE');

-- CreateEnum
CREATE TYPE "TypeAcces" AS ENUM ('LECTURE', 'ECRITURE', 'COMPLET');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('CONSULTATION_PROGRAMMEE', 'CONSULTATION_ANNULEE', 'PERMISSION_DEMANDEE', 'PERMISSION_ACCORDEE', 'PERMISSION_REVOQUEE', 'RAPPEL_RDV', 'RESULTAT_EXAMEN');

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "groupeSanguin" TEXT,
    "allergies" TEXT[],
    "maladiesChroniques" TEXT[],
    "contactUrgence" TEXT,
    "passwordHash" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "hederaAccountId" TEXT,
    "publicKey" TEXT,
    "hopitalPrincipal" TEXT NOT NULL,
    "qrCodeHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medecins" (
    "id" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "numeroOrdre" TEXT NOT NULL,
    "hopitalId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "hederaAccountId" TEXT,
    "publicKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medecins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hopitaux" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "directeur" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hopitaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "hopitalId" TEXT NOT NULL,
    "dateConsultation" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "diagnostic" TEXT,
    "prescription" TEXT,
    "examensPrescrits" TEXT[],
    "poids" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "tensionArterielle" TEXT,
    "temperature" DOUBLE PRECISION,
    "pouls" INTEGER,
    "statut" "ConsultationStatut" NOT NULL DEFAULT 'PROGRAMMEE',
    "notes" TEXT,
    "hederaTxId" TEXT,
    "hcsMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions_medecins" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medecinId" TEXT NOT NULL,
    "statut" "PermissionStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateAutorisation" TIMESTAMP(3),
    "dateExpiration" TIMESTAMP(3),
    "typeAcces" "TypeAcces" NOT NULL DEFAULT 'LECTURE',
    "hederaTokenId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_medecins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "hederaTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_patientId_key" ON "patients"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_telephone_key" ON "patients"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_hederaAccountId_key" ON "patients"("hederaAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_qrCodeHash_key" ON "patients"("qrCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "medecins_medecinId_key" ON "medecins"("medecinId");

-- CreateIndex
CREATE UNIQUE INDEX "medecins_email_key" ON "medecins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "medecins_numeroOrdre_key" ON "medecins"("numeroOrdre");

-- CreateIndex
CREATE UNIQUE INDEX "medecins_hederaAccountId_key" ON "medecins"("hederaAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "hopitaux_code_key" ON "hopitaux"("code");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_consultationId_key" ON "consultations"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_hederaTxId_key" ON "consultations"("hederaTxId");

-- CreateIndex
CREATE UNIQUE INDEX "consultations_hcsMessageId_key" ON "consultations"("hcsMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_medecins_hederaTokenId_key" ON "permissions_medecins"("hederaTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_medecins_patientId_medecinId_key" ON "permissions_medecins"("patientId", "medecinId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionId_key" ON "sessions"("sessionId");

-- AddForeignKey
ALTER TABLE "medecins" ADD CONSTRAINT "medecins_hopitalId_fkey" FOREIGN KEY ("hopitalId") REFERENCES "hopitaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "medecins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_hopitalId_fkey" FOREIGN KEY ("hopitalId") REFERENCES "hopitaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions_medecins" ADD CONSTRAINT "permissions_medecins_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions_medecins" ADD CONSTRAINT "permissions_medecins_medecinId_fkey" FOREIGN KEY ("medecinId") REFERENCES "medecins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
