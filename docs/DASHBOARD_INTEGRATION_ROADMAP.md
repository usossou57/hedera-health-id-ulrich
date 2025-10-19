# 🎯 Dashboard Integration Roadmap

## Integration Architecture Overview

This roadmap details how the **3 dashboards** (Patient, Doctor, Hospital) connect to **Hedera smart contracts** via the **backend API**, creating a decentralized and interoperable healthcare ecosystem.

### Global Architecture

```
Frontend Dashboards
├── PatientDashboard.tsx      # Patient interface
├── MedecinDashboard.tsx      # Doctor interface
└── HospitalDashboard.tsx     # Hospital interface
        ↓
Backend API Layer
├── /api/hedera/patients      # Patient routes
├── /api/hedera/medical-records # Medical record routes
└── /api/hedera/access-control  # Permission routes
        ↓
Hedera Services Layer
├── PatientIdentityService    # Identity service
├── MedicalRecordsService     # Medical records service
└── AccessControlService      # Permission service
        ↓
Hedera Blockchain
├── PatientIdentityContract   # Identity contract
├── MedicalRecordsContract    # Medical records contract
└── AccessControlContract     # Permission contract
```

---

## 🏥 1. Dashboard Patient - Intégration Blockchain

### **Composants Frontend Connectés**

#### **A. PatientRegistration.tsx**
**Fonctionnalité :** Inscription d'un nouveau patient sur la blockchain

**Flux d'intégration :**
```typescript
// 1. Collecte des données patient
const patientData = {
  firstName: "Adjoa",
  lastName: "KOSSOU",
  dateOfBirth: "1990-05-12",
  gender: "F",
  email: "adjoa.kossou@example.com",
  phoneNumber: "+229 97 XX XX XX"
};

// 2. Appel API backend
const response = await fetch('/api/hedera/create-patient', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    personalData: patientData,
    patientAddress: userWalletAddress, // Généré côté frontend
    metadataHash: await uploadToIPFS(patientData) // Optionnel
  })
});

// 3. Traitement de la réponse
const result = await response.json();
if (result.success) {
  // Stockage local de l'ID patient et du QR Code
  localStorage.setItem('patientId', result.data.patientId);
  localStorage.setItem('qrCode', generateQRCode(result.data));

  // Redirection vers le dashboard
  navigate('/patient/dashboard');
}
```

**Backend API Handler :**
```typescript
// backend/src/routes/blockchain/patients.ts
router.post('/create-patient', async (req, res) => {
  const validatedData = CreatePatientSchema.parse(req.body);

  // Appel au service Hedera
  const result = await patientIdentityService.registerPatient({
    personalData: validatedData.personalData,
    patientAddress: validatedData.patientAddress,
    metadataHash: validatedData.metadataHash
  });

  if (result.success) {
    res.status(201).json({
      success: true,
      data: {
        patientId: result.patientId,
        transactionId: result.transactionId,
        encryptedData: result.encryptedData
      }
    });
  }
});
```

**Service Hedera :**
```typescript
// backend/src/services/hedera/patient-identity.service.ts
async registerPatient(patientData) {
  const encryptedData = this.encryptPatientData(patientData.personalData);

  const functionParameters = new ContractFunctionParameters()
    .addString(encryptedData)
    .addAddress(patientData.patientAddress)
    .addString(patientData.metadataHash || '');

  const result = await hederaService.executeContractFunction(
    this.contractId,
    'registerPatient',
    functionParameters,
    150000
  );

  return result;
}
```

#### **B. PatientPermissions.tsx**
**Fonctionnalité :** Gestion des autorisations d'accès aux médecins

**Flux d'intégration :**
```typescript
// 1. Autoriser un médecin
const authorizeDoctor = async (doctorAddress: string, permissions: string[]) => {
  const response = await fetch('/api/hedera/authorize-doctor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: currentPatient.id,
      doctorAddress: doctorAddress,
      expirationDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 jours
      allowedActions: permissions // ["READ_RECORDS", "ADD_CONSULTATION"]
    })
  });

  const result = await response.json();
  if (result.success) {
    // Mise à jour de la liste des médecins autorisés
    setAuthorizedDoctors(prev => [...prev, {
      address: doctorAddress,
      permissionId: result.data.permissionId,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
    }]);
  }
};

// 2. Révoquer un médecin
const revokeDoctor = async (permissionId: number) => {
  const response = await fetch(`/api/hedera/revoke-permission/${permissionId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    setAuthorizedDoctors(prev =>
      prev.filter(doc => doc.permissionId !== permissionId)
    );
  }
};
```

#### **C. PatientConsultations.tsx**
**Fonctionnalité :** Visualisation de l'historique médical depuis la blockchain

**Flux d'intégration :**
```typescript
// 1. Chargement de l'historique médical
const loadMedicalHistory = async (patientId: string) => {
  const response = await fetch(`/api/hedera/medical-history/${patientId}`);
  const result = await response.json();

  if (result.success) {
    // result.data.records contient les IDs des enregistrements
    const detailedRecords = await Promise.all(
      result.data.records.map(async (recordId) => {
        const recordResponse = await fetch(`/api/hedera/medical-record/${recordId}`);
        const recordData = await recordResponse.json();

        return {
          id: recordId,
          date: new Date(recordData.data.timestamp * 1000),
          type: recordData.data.recordType,
          doctor: recordData.data.doctorAddress,
          diagnosis: recordData.data.decryptedData?.diagnosis,
          treatment: recordData.data.decryptedData?.treatment,
          isEmergency: recordData.data.isEmergency
        };
      })
    );

    setConsultations(detailedRecords);
  }
};

// 2. Filtrage par type de consultation
const filterByType = (type: 'CONSULTATION' | 'PRESCRIPTION' | 'TEST_RESULT') => {
  const filtered = consultations.filter(c => c.type === type);
  setFilteredConsultations(filtered);
};
```

---

## 👨‍⚕️ 2. Dashboard Médecin - Intégration Blockchain

### **Composants Frontend Connectés**

#### **A. MedecinLogin.tsx**
**Fonctionnalité :** Authentification et enregistrement des médecins

**Flux d'intégration :**
```typescript
// 1. Enregistrement d'un nouveau médecin
const registerDoctor = async (doctorData) => {
  const response = await fetch('/api/hedera/access-control/register-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAddress: doctorWalletAddress,
      role: 1, // DOCTOR
      publicKey: doctorPublicKey,
      professionalId: doctorData.professionalId,
      hospitalId: doctorData.hospitalId
    })
  });

  const result = await response.json();
  if (result.success) {
    // Stockage des informations médecin
    localStorage.setItem('doctorData', JSON.stringify({
      address: doctorWalletAddress,
      professionalId: doctorData.professionalId,
      hospital: doctorData.hospital,
      speciality: doctorData.speciality
    }));

    navigate('/medecin/dashboard');
  }
};
```

#### **B. QRScanner.tsx (intégré dans MedecinDashboard)**
**Fonctionnalité :** Scanner les QR codes patients pour accéder aux dossiers

**Flux d'intégration :**
```typescript
// 1. Scan du QR Code patient
const handleQRScan = async (qrData: string) => {
  try {
    const patientData = JSON.parse(qrData);

    // 2. Vérification des permissions d'accès
    const permissionCheck = await fetch('/api/hedera/access-control/check-permission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: doctorAddress,
        patientId: patientData.patientId,
        action: "READ_MEDICAL_RECORDS"
      })
    });

    const hasPermission = await permissionCheck.json();

    if (hasPermission.allowed) {
      // 3. Redirection vers le dossier patient
      navigate(`/medecin/patient/${patientData.patientId}`);
    } else {
      // 4. Demande d'autorisation au patient
      setShowPermissionRequest(true);
      setPendingPatientId(patientData.patientId);
    }
  } catch (error) {
    setError('QR Code invalide');
  }
};
```

#### **C. NewConsultation.tsx**
**Fonctionnalité :** Création de nouvelles consultations sur la blockchain

**Flux d'intégration :**
```typescript
// 1. Sauvegarde d'une consultation
const saveConsultation = async (consultationData) => {
  const response = await fetch('/api/hedera/add-consultation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: consultationData.patientId,
      doctorAddress: doctorWalletAddress,
      recordType: 0, // CONSULTATION
      medicalData: {
        diagnosis: consultationData.diagnosis,
        treatment: consultationData.treatment,
        prescription: consultationData.prescription,
        vitalSigns: consultationData.vitalSigns,
        notes: consultationData.notes
      },
      attachments: consultationData.attachments,
      isEmergency: consultationData.isEmergency
    })
  });

  const result = await response.json();
  if (result.success) {
    // Log de l'accès pour audit
    await fetch('/api/hedera/access-control/log-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessor: doctorWalletAddress,
        patientId: consultationData.patientId,
        action: "CREATE_CONSULTATION",
        success: true,
        details: `Consultation créée - Record ID: ${result.data.recordId}`
      })
    });

    // Notification de succès
    setNotification({
      type: 'success',
      message: `Consultation enregistrée sur la blockchain (TX: ${result.data.transactionId})`
    });

    // Redirection vers le dashboard
    navigate('/medecin/dashboard');
  }
};
```

#### **D. PatientRecord.tsx (Vue Médecin)**
**Fonctionnalité :** Consultation du dossier médical complet d'un patient

**Flux d'intégration :**
```typescript
// 1. Chargement du dossier patient
const loadPatientRecord = async (patientId: string) => {
  // Vérification des permissions
  const permissionResponse = await fetch('/api/hedera/access-control/check-permission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAddress: doctorAddress,
      patientId: patientId,
      action: "READ_MEDICAL_RECORDS"
    })
  });

  const hasPermission = await permissionResponse.json();

  if (!hasPermission.allowed) {
    setError('Accès non autorisé à ce dossier patient');
    return;
  }

  // Chargement des informations patient
  const patientResponse = await fetch(`/api/hedera/patient/${patientId}`);
  const patientData = await patientResponse.json();

  // Chargement de l'historique médical
  const historyResponse = await fetch(`/api/hedera/medical-history/${patientId}`);
  const historyData = await historyResponse.json();

  setPatientInfo(patientData.data);
  setMedicalHistory(historyData.data.records);

  // Log de l'accès
  await fetch('/api/hedera/access-control/log-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessor: doctorAddress,
      patientId: patientId,
      action: "READ_PATIENT_RECORD",
      success: true,
      details: `Consultation du dossier patient ${patientId}`
    })
  });
};
```

---

## 🏥 3. Dashboard Hôpital - Intégration Blockchain

### **Composants Frontend Connectés**

#### **A. HospitalDashboard.tsx**
**Fonctionnalité :** Vue d'ensemble des métriques blockchain et gestion administrative

**Flux d'intégration :**
```typescript
// 1. Chargement des statistiques blockchain
const loadBlockchainStats = async () => {
  const response = await fetch('/api/hedera/contracts/stats');
  const stats = await response.json();

  if (stats.success) {
    setDashboardStats({
      totalPatients: stats.data.patientContract.totalPatients,
      totalRecords: stats.data.medicalRecordsContract.totalRecords,
      activePermissions: stats.data.accessControlContract.activePermissions,
      emergencyRecords: stats.data.medicalRecordsContract.emergencyRecords,
      dailyTransactions: stats.data.dailyTransactions,
      monthlyGrowth: stats.data.monthlyGrowth
    });
  }
};

// 2. Monitoring des transactions en temps réel
const subscribeToBlockchainEvents = () => {
  const eventSource = new EventSource('/api/hedera/events/stream');

  eventSource.onmessage = (event) => {
    const eventData = JSON.parse(event.data);

    switch (eventData.type) {
      case 'PATIENT_REGISTERED':
        setRecentActivity(prev => [...prev, {
          type: 'Nouveau patient',
          description: `Patient ${eventData.patientId} enregistré`,
          timestamp: new Date(eventData.timestamp),
          icon: 'user-plus'
        }]);
        break;

      case 'CONSULTATION_CREATED':
        setRecentActivity(prev => [...prev, {
          type: 'Nouvelle consultation',
          description: `Consultation pour patient ${eventData.patientId}`,
          timestamp: new Date(eventData.timestamp),
          icon: 'stethoscope'
        }]);
        break;

      case 'PERMISSION_GRANTED':
        setRecentActivity(prev => [...prev, {
          type: 'Permission accordée',
          description: `Accès autorisé pour patient ${eventData.patientId}`,
          timestamp: new Date(eventData.timestamp),
          icon: 'shield-check'
        }]);
        break;
    }
  };

  return () => eventSource.close();
};

// 3. Gestion des utilisateurs de l'hôpital
const manageHospitalUsers = async () => {
  // Récupération des médecins de l'hôpital
  const doctorsResponse = await fetch(`/api/hedera/access-control/hospital/${hospitalId}/doctors`);
  const doctors = await doctorsResponse.json();

  // Récupération des patients affiliés
  const patientsResponse = await fetch(`/api/hedera/hospital/${hospitalId}/patients`);
  const patients = await patientsResponse.json();

  setHospitalDoctors(doctors.data);
  setHospitalPatients(patients.data);
};
```

#### **B. Analytics et Reporting**
**Fonctionnalité :** Génération de rapports basés sur les données blockchain

**Flux d'intégration :**
```typescript
// 1. Génération de rapports mensuels
const generateMonthlyReport = async (month: number, year: number) => {
  const response = await fetch('/api/hedera/reports/monthly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hospitalId: hospitalId,
      month: month,
      year: year,
      includeMetrics: [
        'patient_registrations',
        'consultations_count',
        'emergency_cases',
        'permission_changes',
        'data_access_logs'
      ]
    })
  });

  const report = await response.json();

  if (report.success) {
    setMonthlyReport({
      totalPatients: report.data.metrics.patient_registrations,
      totalConsultations: report.data.metrics.consultations_count,
      emergencyCases: report.data.metrics.emergency_cases,
      averageConsultationTime: report.data.metrics.avg_consultation_time,
      dataAccessCount: report.data.metrics.data_access_logs,
      complianceScore: report.data.compliance.score,
      costSavings: report.data.economics.cost_savings
    });
  }
};

// 2. Audit des accès aux données
const auditDataAccess = async (patientId?: string, dateRange?: {start: Date, end: Date}) => {
  const response = await fetch('/api/hedera/audit/access-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hospitalId: hospitalId,
      patientId: patientId,
      startDate: dateRange?.start,
      endDate: dateRange?.end
    })
  });

  const auditData = await response.json();

  if (auditData.success) {
    setAuditLogs(auditData.data.logs.map(log => ({
      id: log.logId,
      accessor: log.accessor,
      patientId: log.patientId,
      action: log.action,
      timestamp: new Date(log.timestamp * 1000),
      success: log.success,
      details: log.details,
      ipAddress: log.metadata?.ipAddress,
      userAgent: log.metadata?.userAgent
    })));
  }
};
```

---

## 🔄 4. Flux de Données Inter-Tableaux de Bord

### **A. Scénario Complet : Nouvelle Consultation**

**Étape 1 : Patient autorise le médecin**
```
PatientPermissions.tsx → /api/hedera/authorize-doctor → AccessControlContract.grantPermission()
```

**Étape 2 : Médecin scanne le QR Code**
```
QRScanner.tsx → /api/hedera/access-control/check-permission → AccessControlContract.checkPermission()
```

**Étape 3 : Médecin consulte le dossier**
```
PatientRecord.tsx → /api/hedera/medical-history/{patientId} → MedicalRecordsContract.getPatientHistory()
```

**Étape 4 : Médecin ajoute une consultation**
```
NewConsultation.tsx → /api/hedera/add-consultation → MedicalRecordsContract.createMedicalRecord()
```

**Étape 5 : Patient voit la nouvelle consultation**
```
PatientConsultations.tsx → /api/hedera/medical-history/{patientId} → MedicalRecordsContract.getPatientHistory()
```

**Étape 6 : Hôpital voit les statistiques mises à jour**
```
HospitalDashboard.tsx → /api/hedera/contracts/stats → Tous les contrats.getStats()
```

### **B. Scénario d'Urgence : Accès d'Urgence**

**Étape 1 : Médecin déclare une urgence**
```typescript
const emergencyAccess = async (patientId: string, reason: string) => {
  const response = await fetch('/api/hedera/emergency-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: patientId,
      doctorAddress: doctorAddress,
      emergencyReason: reason,
      hospitalId: hospitalId
    })
  });

  // Accès temporaire accordé automatiquement
  // Log d'urgence créé pour audit
  // Notification envoyée au patient
};
```

**Étape 2 : Création d'un dossier d'urgence**
```typescript
const createEmergencyRecord = async (emergencyData) => {
  const response = await fetch('/api/hedera/add-consultation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...emergencyData,
      isEmergency: true,
      recordType: 5 // EMERGENCY
    })
  });

  // Enregistrement marqué comme urgence
  // Notification automatique aux contacts d'urgence
  // Priorité élevée dans le système
};
```

---

## 📊 5. Métriques et KPIs par Dashboard

### **Dashboard Patient**
- Nombre de consultations
- Médecins autorisés actifs
- Dernière activité sur le dossier
- Score de complétude du profil
- Notifications de sécurité

### **Dashboard Médecin**
- Patients vus aujourd'hui
- Consultations créées
- Temps moyen par consultation
- Taux d'utilisation du QR Scanner
- Permissions accordées

### **Dashboard Hôpital**
- Total patients enregistrés
- Consultations mensuelles
- Médecins actifs
- Cas d'urgence traités
- Économies réalisées
- Score de conformité RGPD

---

## 🔐 6. Sécurité et Conformité

### **Chiffrement End-to-End**
- Données patient chiffrées AES-256
- Clés de chiffrement gérées par le patient
- Métadonnées stockées sur IPFS
- Hashes d'intégrité vérifiables

### **Audit et Traçabilité**
- Tous les accès loggés sur blockchain
- Horodatage immuable
- Géolocalisation des accès
- Révocation instantanée des permissions

### **Conformité RGPD**
- Droit à l'oubli (désactivation du compte)
- Portabilité des données
- Consentement explicite
- Notification des violations

Cette architecture garantit une intégration transparente entre les interfaces utilisateur et la blockchain Hedera, tout en maintenant la sécurité et la conformité réglementaire.
```