-- CreateTable
CREATE TABLE "hospital_admins" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "hopitalId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistiques" (
    "id" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "patientsActifs" INTEGER NOT NULL DEFAULT 0,
    "consultationsTotal" INTEGER NOT NULL DEFAULT 0,
    "medecinsActifs" INTEGER NOT NULL DEFAULT 0,
    "economiesFCFA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempsEconomise" INTEGER NOT NULL DEFAULT 0,
    "adoptionSysteme" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "medecinsConnectes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "patientsInscrits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "satisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activites_recentes" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "count" INTEGER,
    "userId" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'actif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activites_recentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_admins_adminId_key" ON "hospital_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_admins_email_key" ON "hospital_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "statistiques_periode_date_key" ON "statistiques"("periode", "date");

-- AddForeignKey
ALTER TABLE "hospital_admins" ADD CONSTRAINT "hospital_admins_hopitalId_fkey" FOREIGN KEY ("hopitalId") REFERENCES "hopitaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
