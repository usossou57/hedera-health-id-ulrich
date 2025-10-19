# 🔗 Guide Complet des Contrats Intelligents - Hedera Health ID

## Vue d'ensemble de l'Architecture Blockchain

Le système Hedera Health ID utilise **3 contrats intelligents interconnectés** déployés sur Hedera Testnet pour gérer de manière décentralisée et sécurisée les identités médicales, les contrôles d'accès et les dossiers médicaux.

### Architecture des Contrats

```
Hedera Blockchain
├── PatientIdentityContract.sol     # Gestion des identités patients
├── AccessControlContract.sol       # Contrôle d'accès et permissions
└── MedicalRecordsContract.sol      # Dossiers médicaux immuables
```

---

## 📋 1. PatientIdentityContract.sol

### **Objectif Principal**
Gérer les identités uniques des patients avec chiffrement des données personnelles et contrôle d'accès décentralisé.

### **Fonctionnalités Clés**

#### **Structure Patient**
```solidity
struct Patient {
    uint256 patientId;              // ID unique auto-incrémenté
    string encryptedPersonalData;   // Données chiffrées AES-256
    address patientAddress;         // Adresse Ethereum du patient
    bool isActive;                  // Statut actif/inactif
    uint256 creationDate;          // Timestamp de création
    string metadataHash;           // Hash IPFS pour métadonnées
}
```

#### **Fonctions Principales**

**1. Enregistrement Patient**
```solidity
function registerPatient(
    string memory _encryptedData,
    string memory _metadataHash
) public returns (uint256)
```

**Utilisation dans le Dashboard Patient :**
```typescript
// Frontend: PatientRegistration.tsx
const registerOnBlockchain = async (patientData) => {
  const response = await fetch('/api/hedera/create-patient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalData: patientData,
      patientAddress: userWalletAddress,
      metadataHash: ipfsHash
    })
  });

  const result = await response.json();
  // result.data.transactionId contient l'ID de transaction Hedera
  // result.data.encryptedData contient les données chiffrées
};
```

**2. Gestion des Permissions**
```solidity
function grantAccess(uint256 _patientId, address _authorizedAddress) public
function revokeAccess(uint256 _patientId, address _addressToRevoke) public
```

**Utilisation dans le Dashboard Patient :**
```typescript
// Frontend: PatientPermissions.tsx
const authorizeDoctor = async (doctorAddress: string) => {
  const response = await fetch('/api/hedera/authorize-doctor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: currentPatient.id,
      doctorAddress: doctorAddress
    })
  });
};
```

**3. Récupération des Données**
```solidity
function getPatientInfo(uint256 _patientId) public view returns (Patient memory)
```

### **Événements Émis**
- `PatientRegistered(patientId, patientAddress, timestamp)`
- `AccessGranted(patientId, grantedTo, grantedBy)`
- `AccessRevoked(patientId, revokedFrom, revokedBy)`

---

## 🛡️ 2. AccessControlContract.sol

### **Objectif Principal**
Gérer les rôles, permissions et logs d'accès pour tous les utilisateurs du système (patients, médecins, administrateurs).

### **Fonctionnalités Clés**

#### **Énumération des Rôles**
```solidity
enum Role { PATIENT, DOCTOR, ADMIN, NURSE, PHARMACIST }
```

#### **Structure Utilisateur**
```solidity
struct User {
    address userAddress;        // Adresse blockchain
    Role role;                 // Rôle dans le système
    bool isActive;            // Statut actif
    string publicKey;         // Clé publique pour chiffrement
    string professionalId;    // ID professionnel (médecins)
    uint256 registrationDate; // Date d'enregistrement
}
```

#### **Structure Permission**
```solidity
struct Permission {
    uint256 permissionId;      // ID unique de permission
    address grantor;           // Qui donne l'autorisation
    address grantee;          // Qui reçoit l'autorisation
    uint256 patientId;        // Patient concerné
    uint256 expirationDate;   // Date d'expiration
    bool isActive;           // Statut actif
    string[] allowedActions; // Actions autorisées
    uint256 creationDate;    // Date de création
}
```

#### **Fonctions Principales**

**1. Enregistrement Utilisateur**
```solidity
function registerUser(
    address _userAddress,
    Role _role,
    string memory _publicKey,
    string memory _professionalId
) public
```

**Utilisation dans le Dashboard Médecin :**
```typescript
// Frontend: MedecinLogin.tsx
const registerDoctor = async (doctorData) => {
  const response = await fetch('/api/hedera/access-control/register-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAddress: doctorWalletAddress,
      role: 1, // DOCTOR
      publicKey: doctorPublicKey,
      professionalId: doctorData.professionalId
    })
  });
};
```

**2. Gestion des Permissions**
```solidity
function grantPermission(
    address _grantee,
    uint256 _patientId,
    uint256 _expirationDate,
    string[] memory _allowedActions
) public returns (uint256)
```

**3. Vérification des Permissions**
```solidity
function checkPermission(
    address _user,
    uint256 _patientId,
    string memory _action
) public view returns (bool)
```

**Utilisation dans le Dashboard Médecin :**
```typescript
// Frontend: PatientRecord.tsx
const checkAccess = async (patientId: string) => {
  const response = await fetch('/api/hedera/access-control/check-permission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userAddress: doctorAddress,
      patientId: patientId,
      action: "READ_MEDICAL_RECORDS"
    })
  });

  const result = await response.json();
  return result.hasPermission;
};
```

**4. Logging des Accès**
```solidity
function logAccess(
    address _accessor,
    uint256 _patientId,
    string memory _action,
    bool _success,
    string memory _details
) public returns (uint256)
```

---

## 📋 3. MedicalRecordsContract.sol

### **Objectif Principal**
Gérer les dossiers médicaux immuables avec support pour consultations, prescriptions, amendements et signatures numériques.

### **Fonctionnalités Clés**

#### **Énumération des Types d'Enregistrements**
```solidity
enum RecordType {
    CONSULTATION, PRESCRIPTION, TEST_RESULT, SURGERY,
    VACCINATION, EMERGENCY, FOLLOW_UP, DISCHARGE_SUMMARY
}
```

#### **Structure Dossier Médical**
```solidity
struct MedicalRecord {
    uint256 recordId;              // ID unique
    uint256 patientId;            // ID du patient
    address doctorAddress;        // Adresse du médecin
    RecordType recordType;        // Type d'enregistrement
    RecordStatus status;          // Statut (DRAFT, FINALIZED, etc.)
    string encryptedDataHash;     // Hash IPFS des données chiffrées
    string originalDataHash;      // Hash original pour intégrité
    uint256 timestamp;           // Date de création
    uint256 lastModified;        // Dernière modification
    string[] attachmentHashes;   // Pièces jointes IPFS
    string metadata;             // Métadonnées
    bool isEmergency;           // Cas d'urgence
    address[] authorizedViewers; // Autorisations spécifiques
}
```

#### **Fonctions Principales**

**1. Création d'Enregistrement Médical**
```solidity
function createMedicalRecord(
    uint256 _patientId,
    RecordType _recordType,
    string memory _encryptedDataHash,
    string memory _originalDataHash,
    string[] memory _attachmentHashes,
    string memory _metadata,
    bool _isEmergency
) public returns (uint256)
```

**Utilisation dans le Dashboard Médecin :**
```typescript
// Frontend: NewConsultation.tsx
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
        notes: consultationData.notes
      },
      attachments: consultationData.attachments,
      isEmergency: consultationData.isEmergency
    })
  });

  const result = await response.json();
  // result.data.recordId contient l'ID du dossier créé
  // result.data.transactionId contient l'ID de transaction Hedera
};
```

**2. Amendement d'Enregistrement**
```solidity
function amendMedicalRecord(
    uint256 _recordId,
    string memory _newEncryptedDataHash,
    string memory _reason
) public returns (uint256)
```

**3. Récupération de l'Historique**
```solidity
function getPatientHistory(uint256 _patientId) public view returns (uint256[] memory)
```

**Utilisation dans le Dashboard Patient :**
```typescript
// Frontend: PatientConsultations.tsx
const loadMedicalHistory = async (patientId: string) => {
  const response = await fetch(`/api/hedera/medical-history/${patientId}`);
  const result = await response.json();

  // result.data.records contient la liste des IDs d'enregistrements
  // Chaque enregistrement peut être récupéré individuellement
  const detailedRecords = await Promise.all(
    result.data.records.map(recordId =>
      fetch(`/api/hedera/medical-record/${recordId}`).then(r => r.json())
    )
  );

  return detailedRecords;
};
```

**4. Signature Numérique**
```solidity
function signRecord(
    uint256 _recordId,
    bytes memory _signature,
    string memory _signerRole
) public
```

### **Événements Émis**
- `MedicalRecordCreated(recordId, patientId, doctorAddress, recordType)`
- `MedicalRecordAmended(recordId, amendmentId, amendedBy, reason)`
- `MedicalRecordSigned(recordId, signer, signerRole)`
- `EmergencyRecordCreated(recordId, patientId, doctorAddress)`

---

## 🔄 Flux d'Intégration avec les Tableaux de Bord

### **1. Scénario Patient - Inscription**
```
PatientRegistration.tsx → API /api/hedera/create-patient → PatientIdentityService → PatientIdentityContract.registerPatient()
```

### **2. Scénario Médecin - Consultation**
```
NewConsultation.tsx → API /api/hedera/add-consultation → MedicalRecordsService → MedicalRecordsContract.createMedicalRecord()
```

### **3. Scénario Patient - Autorisation Médecin**
```
PatientPermissions.tsx → API /api/hedera/authorize-doctor → PatientIdentityService → PatientIdentityContract.grantAccess()
```

### **4. Scénario Médecin - Accès Dossier**
```
PatientRecord.tsx → API /api/hedera/check-permission → AccessControlService → AccessControlContract.checkPermission()
```

---

## 📊 Métriques et Monitoring

### **Événements Trackés**
- Nombre de patients enregistrés
- Nombre de consultations créées
- Nombre de permissions accordées/révoquées
- Logs d'accès aux dossiers
- Amendements et signatures

### **Intégration Dashboard Hôpital**
```typescript
// Frontend: HospitalDashboard.tsx
const loadBlockchainStats = async () => {
  const response = await fetch('/api/hedera/contracts');
  const stats = await response.json();

  return {
    totalPatients: stats.patientContract.totalPatients,
    totalRecords: stats.medicalRecordsContract.totalRecords,
    activePermissions: stats.accessControlContract.activePermissions,
    emergencyRecords: stats.medicalRecordsContract.emergencyRecords
  };
};
```

---

## 🔐 Sécurité et Chiffrement

### **Chiffrement des Données**
- **AES-256** pour les données personnelles
- **IPFS** pour le stockage décentralisé des métadonnées
- **Hashes SHA-256** pour l'intégrité des données

### **Contrôle d'Accès**
- **Permissions granulaires** par action
- **Expiration automatique** des permissions
- **Logs immuables** de tous les accès
- **Révocation instantanée** des accès

Cette architecture garantit la **sécurité**, **l'interopérabilité** et la **traçabilité** complète du système de santé décentralisé.
```