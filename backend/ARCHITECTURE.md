# ARCHITECTURE BACKEND HEDERA HEALTH ID

## Stack Technique

### Backend Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI

### Blockchain Integration
- **Hedera SDK**: @hashgraph/sdk
- **Smart Contracts**: Solidity
- **Services**: HCS (Consensus), HTS (Token)
- **Network**: Hedera Testnet

### Infrastructure
- **Environment**: Docker + Docker Compose
- **Cache**: Redis (sessions, QR codes)
- **File Storage**: Local + AWS S3 (production)
- **Monitoring**: Winston (logs)
- **Testing**: Jest + Supertest

## Architecture Modulaire

```
backend/
├── src/
│   ├── controllers/          # Logique métier API
│   │   ├── auth.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── medecin.controller.ts
│   │   ├── consultation.controller.ts
│   │   └── hospital.controller.ts
│   ├── services/             # Services métier
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── hedera.service.ts
│   │   ├── qr.service.ts
│   │   └── notification.service.ts
│   ├── models/               # Modèles Prisma
│   │   └── schema.prisma
│   ├── middleware/           # Middlewares Express
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/               # Routes API
│   │   ├── auth.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── medecin.routes.ts
│   │   └── consultation.routes.ts
│   ├── utils/                # Utilitaires
│   │   ├── crypto.util.ts
│   │   ├── validation.util.ts
│   │   └── response.util.ts
│   ├── config/               # Configuration
│   │   ├── database.config.ts
│   │   ├── hedera.config.ts
│   │   └── app.config.ts
│   └── types/                # Types TypeScript
│       ├── patient.types.ts
│       ├── medecin.types.ts
│       └── api.types.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

## Flux de Données

### 1. Authentification
```
Client → JWT Token → Middleware → Controller → Service → Database
```

### 2. Création Patient
```
Frontend → API → Patient Service → Hedera Service → Smart Contract
                                 ↓
                              Database ← QR Service
```

### 3. Consultation Médicale
```
Médecin → Scanner QR → Validation → Consultation Service → Database
                                                         ↓
                                                   Hedera HCS
```

## Sécurité

### Authentification & Autorisation
- **JWT Tokens** avec expiration
- **Refresh Tokens** pour sessions longues
- **Role-based Access Control** (Patient/Médecin/Admin)
- **Rate Limiting** par IP et utilisateur

### Données Sensibles
- **Chiffrement AES-256** pour données médicales
- **Hash bcrypt** pour mots de passe
- **Validation stricte** avec Zod
- **Sanitization** des inputs

### Blockchain
- **Clés privées** stockées en variables d'environnement
- **Transactions signées** côté serveur
- **Validation** des données avant blockchain
- **Audit trail** complet

## Performance

### Cache Strategy
- **Redis** pour sessions utilisateurs
- **Cache QR Codes** (24h TTL)
- **Cache requêtes** fréquentes
- **Pagination** pour listes longues

### Database Optimization
- **Index** sur colonnes fréquemment requêtées
- **Relations optimisées** avec Prisma
- **Connection pooling**
- **Requêtes préparées**

## Monitoring & Logs

### Logging
- **Winston** avec niveaux (error, warn, info, debug)
- **Logs structurés** en JSON
- **Rotation** automatique des fichiers
- **Logs blockchain** séparés

### Métriques
- **Temps de réponse** API
- **Erreurs** par endpoint
- **Utilisation** base de données
- **Transactions** Hedera

## Déploiement

### Environnements
- **Development**: Local avec Docker
- **Staging**: Hedera Testnet
- **Production**: Hedera Mainnet

### CI/CD Pipeline
1. **Tests** automatisés
2. **Build** Docker image
3. **Deploy** staging
4. **Tests** E2E
5. **Deploy** production
