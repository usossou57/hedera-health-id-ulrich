# 🏗️ Architecture Système - Hedera Health ID

## 📋 Vue d'ensemble

Hedera Health ID est une plateforme de gestion d'identité médicale décentralisée qui combine les technologies web modernes avec la blockchain Hedera Hashgraph pour créer un écosystème de santé sécurisé et interopérable.

## 🎯 Objectifs Architecturaux

### Principes de conception
- **Sécurité par défaut** : Chiffrement et authentification robustes
- **Scalabilité** : Architecture modulaire et microservices
- **Interopérabilité** : Standards ouverts et APIs RESTful
- **Décentralisation** : Intégration blockchain pour la confiance
- **Performance** : Optimisation des requêtes et mise en cache

## 🏛️ Architecture Globale

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   React + TS    │◄──►│   Node.js + TS  │◄──►│   Hedera HCS    │
│   Tailwind CSS  │    │   Express       │    │   Smart Contracts│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PWA Service   │    │   PostgreSQL    │    │   IPFS Storage  │
│   Worker        │    │   Prisma ORM    │    │   (Future)      │
│   Offline Cache │    │   Neon Cloud    │    │   Distributed   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Couche Frontend

### Technologies utilisées
- **React 18** : Framework UI avec hooks modernes
- **TypeScript** : Typage statique pour la robustesse
- **Vite** : Build tool rapide et moderne
- **Tailwind CSS** : Framework CSS utility-first
- **React Router** : Navigation côté client
- **PWA** : Progressive Web App avec service worker

### Structure des composants

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI de base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Select.tsx
│   ├── patient/         # Composants spécifiques patients
│   ├── medecin/         # Composants spécifiques médecins
│   └── hospital/        # Composants spécifiques hôpitaux
├── pages/               # Pages principales
│   ├── PatientDashboard.tsx
│   ├── MedecinDashboardModern.tsx
│   └── HospitalDashboard.tsx
├── services/            # Services et APIs
│   ├── api.ts           # Client API REST
│   └── qrCodeService.ts # Gestion QR codes
├── utils/               # Utilitaires
└── hooks/               # Hooks personnalisés
```

### Patterns architecturaux
- **Component-Based Architecture** : Composants réutilisables et modulaires
- **Custom Hooks** : Logique métier encapsulée
- **Context API** : Gestion d'état globale
- **Error Boundaries** : Gestion d'erreurs robuste

## ⚙️ Couche Backend

### Technologies utilisées
- **Node.js** : Runtime JavaScript serveur
- **Express.js** : Framework web minimaliste
- **TypeScript** : Typage statique côté serveur
- **Prisma ORM** : Mapping objet-relationnel moderne
- **PostgreSQL** : Base de données relationnelle
- **bcrypt** : Hachage sécurisé des mots de passe

### Architecture API REST

```
/api/v1/
├── auth/                # Authentification
│   ├── POST /patient    # Connexion patient
│   ├── POST /medecin    # Connexion médecin
│   └── POST /hospital   # Connexion hôpital
├── patients/            # Gestion patients
│   ├── GET /            # Liste patients
│   ├── GET /:id         # Détail patient
│   ├── POST /           # Créer patient
│   └── GET /:id/consultations # Consultations
├── medecins/            # Gestion médecins
├── hopitaux/            # Gestion hôpitaux
└── consultations/       # Gestion consultations
```

### Patterns architecturaux
- **RESTful API** : Architecture orientée ressources
- **Middleware Pattern** : Traitement des requêtes en pipeline
- **Repository Pattern** : Abstraction de la couche données
- **Error Handling** : Gestion centralisée des erreurs

## 🗄️ Couche Données

### Modèle de données

```sql
-- Patients : Utilisateurs finaux
patients (
  id: UUID PRIMARY KEY,
  patientId: VARCHAR UNIQUE,  -- Format: BJ2025001
  nom, prenom, email, telephone,
  passwordHash: VARCHAR,      -- bcrypt hash
  hopitalPrincipal: VARCHAR,
  isActive: BOOLEAN,
  createdAt, updatedAt: TIMESTAMP
)

-- Médecins : Professionnels de santé
medecins (
  id: UUID PRIMARY KEY,
  medecinId: VARCHAR UNIQUE,  -- Format: MED-CHU-001
  nom, prenom, email, telephone,
  specialite, service: VARCHAR,
  hopitalId: UUID REFERENCES hopitaux(id),
  isActive: BOOLEAN,
  createdAt, updatedAt: TIMESTAMP
)

-- Hôpitaux : Établissements de santé
hopitaux (
  id: UUID PRIMARY KEY,
  code: VARCHAR UNIQUE,       -- Format: CHU-MEL
  nom, ville, adresse: VARCHAR,
  telephone, email: VARCHAR,
  directeur: VARCHAR,
  isActive: BOOLEAN,
  createdAt, updatedAt: TIMESTAMP
)

-- Administrateurs hôpital
hospital_admins (
  id: UUID PRIMARY KEY,
  adminId: VARCHAR UNIQUE,    -- Format: ADMIN-CHU-001
  nom, prenom, email: VARCHAR,
  passwordHash: VARCHAR,      -- bcrypt hash
  hopitalId: UUID REFERENCES hopitaux(id),
  role: VARCHAR,              -- admin, super_admin
  isActive: BOOLEAN,
  createdAt, updatedAt: TIMESTAMP
)

-- Consultations médicales
consultations (
  id: UUID PRIMARY KEY,
  consultationId: VARCHAR UNIQUE, -- Format: CONS-2025-001
  patientId: UUID REFERENCES patients(id),
  medecinId: UUID REFERENCES medecins(id),
  hopitalId: UUID REFERENCES hopitaux(id),
  dateConsultation: TIMESTAMP,
  type, motif: VARCHAR,
  diagnostic, notes: TEXT,
  statut: VARCHAR,            -- PROGRAMMEE, EN_COURS, TERMINEE
  createdAt, updatedAt: TIMESTAMP
)
```

### Relations et contraintes

```sql
-- Index pour les performances
CREATE INDEX idx_patients_patientId ON patients(patientId);
CREATE INDEX idx_medecins_email ON medecins(email);
CREATE INDEX idx_consultations_patient ON consultations(patientId);
CREATE INDEX idx_consultations_medecin ON consultations(medecinId);

-- Contraintes d'intégrité
ALTER TABLE consultations 
  ADD CONSTRAINT fk_consultation_patient 
  FOREIGN KEY (patientId) REFERENCES patients(id);

ALTER TABLE consultations 
  ADD CONSTRAINT fk_consultation_medecin 
  FOREIGN KEY (medecinId) REFERENCES medecins(id);
```

## 🔐 Couche Sécurité

### Authentification multi-niveaux

```typescript
// Hachage bcrypt avec 12 rounds
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Validation des mots de passe
const isValid = await bcrypt.compare(password, storedHash);

// Génération de tokens JWT (simulés)
const token = `${userType}_jwt_${userId}_${timestamp}`;
```

### Validation des données

```typescript
// Validation côté serveur
const validatePatientId = (id: string): boolean => {
  return /^BJ\d{7}$/.test(id); // Format: BJ2025001
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### Protection CORS

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🌐 Couche Communication

### Protocoles de communication

```typescript
// Client API avec gestion d'erreurs
class ApiService {
  private baseUrl: string;
  
  async request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
```

### Format de réponse standardisé

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// Exemple de réponse
{
  "success": true,
  "data": {
    "token": "patient_jwt_...",
    "patient": { ... }
  },
  "message": "Authentification réussie"
}
```

## 🔗 Intégration Blockchain (Hedera)

### Architecture décentralisée (Phase 2)

```typescript
// Hedera Consensus Service (HCS)
interface HederaService {
  // Création d'un topic pour les dossiers médicaux
  createMedicalRecordTopic(): Promise<TopicId>;
  
  // Soumission d'une transaction médicale
  submitMedicalTransaction(
    topicId: TopicId, 
    encryptedData: string
  ): Promise<TransactionId>;
  
  // Vérification de l'intégrité des données
  verifyDataIntegrity(
    transactionId: TransactionId
  ): Promise<boolean>;
}
```

### Smart Contracts (Future)

```solidity
// Contrat de gestion des identités médicales
contract MedicalIdentity {
    struct Patient {
        string patientId;
        bytes32 dataHash;
        address authorizedDoctor;
        uint256 timestamp;
    }
    
    mapping(address => Patient) public patients;
    
    function registerPatient(
        string memory _patientId,
        bytes32 _dataHash
    ) public {
        patients[msg.sender] = Patient({
            patientId: _patientId,
            dataHash: _dataHash,
            authorizedDoctor: address(0),
            timestamp: block.timestamp
        });
    }
}
```

## 📊 Monitoring et Observabilité

### Métriques système

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: await checkDatabaseConnection(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  
  res.json(health);
});
```

### Logging structuré

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

## 🚀 Déploiement et Scalabilité

### Architecture de déploiement

```yaml
# Docker Compose pour développement
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://backend:3001
      
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - database
      
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=hedera_health
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

### Stratégies de scalabilité

1. **Horizontal Scaling** : Load balancers et instances multiples
2. **Database Sharding** : Partitionnement par région/hôpital
3. **Caching** : Redis pour les sessions et données fréquentes
4. **CDN** : Distribution des assets statiques
5. **Microservices** : Séparation par domaine métier

## 🔮 Évolution Future

### Roadmap technique

**Phase 1 (Actuelle) :**
- ✅ Architecture web classique
- ✅ Base de données centralisée
- ✅ Authentification sécurisée

**Phase 2 (Q1 2025) :**
- 🔄 Intégration Hedera HCS
- 🔄 Stockage décentralisé (IPFS)
- 🔄 Smart contracts basiques

**Phase 3 (Q2-Q3 2025) :**
- 📋 Interopérabilité HL7 FHIR
- 📋 IA pour l'analyse médicale
- 📋 Télémédecine intégrée

**Phase 4 (Q4 2025) :**
- 📋 Écosystème complet
- 📋 Marketplace de services
- 📋 Gouvernance décentralisée

---

**🏗️ Architecture robuste et évolutive pour l'avenir de la santé numérique**
