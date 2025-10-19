# 🚀 Guide de Déploiement - Hedera Health ID

## 📋 Vue d'ensemble

Ce guide détaille le processus de déploiement complet de Hedera Health ID, de l'environnement de développement à la production.

## 🏗️ Architecture de Déploiement

### Stack de Production

**Frontend :**
- React 18 + TypeScript + Vite
- Déploiement : Vercel (recommandé)
- CDN : Automatique avec Vercel

**Backend :**
- Node.js + Express + TypeScript
- Déploiement : Vercel Serverless Functions
- Base de données : PostgreSQL (Neon)

**Base de données :**
- PostgreSQL sur Neon Cloud
- Connexions poolées
- Backups automatiques

## 🔧 Prérequis

### Outils requis
- Node.js 18+
- npm ou yarn
- Git
- Compte Vercel
- Compte Neon (PostgreSQL)

### Comptes nécessaires
- [Vercel](https://vercel.com) - Déploiement
- [Neon](https://neon.tech) - Base de données PostgreSQL
- [GitHub](https://github.com) - Repository

## 📦 Préparation du Déploiement

### 1. Configuration de la base de données

```bash
# Créer une base de données sur Neon
# Récupérer l'URL de connexion
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

### 2. Variables d'environnement

**Backend (.env) :**
```env
# Base de données
DATABASE_URL="postgresql://..."

# Serveur
PORT=3001
NODE_ENV=production

# Sécurité
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN="https://your-frontend-domain.vercel.app"
```

**Frontend (.env) :**
```env
# API Backend
VITE_API_BASE_URL="https://your-backend-domain.vercel.app"

# Environnement
NODE_ENV=production
```

### 3. Build de production

```bash
# Frontend
cd frontend
npm run build
# Génère le dossier dist/

# Backend
cd ../backend
npm run build
# Génère le dossier dist/
```

## 🌐 Déploiement sur Vercel

### 1. Configuration du Frontend

**vercel.json (frontend) :**
```json
{
  "name": "hedera-health-frontend",
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api_base_url"
  }
}
```

### 2. Configuration du Backend

**vercel.json (backend) :**
```json
{
  "name": "hedera-health-backend",
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NODE_ENV": "production"
  }
}
```

### 3. Déploiement automatique

```bash
# Installation de Vercel CLI
npm i -g vercel

# Déploiement du frontend
cd frontend
vercel --prod

# Déploiement du backend
cd ../backend
vercel --prod
```

### 4. Configuration des variables d'environnement

```bash
# Via Vercel CLI
vercel env add DATABASE_URL production
vercel env add CORS_ORIGIN production

# Via Dashboard Vercel
# Settings > Environment Variables
```

## 🗄️ Configuration de la Base de Données

### 1. Migration Prisma

```bash
# Génération du client Prisma
npx prisma generate

# Application des migrations
npx prisma db push

# Vérification
npx prisma studio
```

### 2. Données initiales

```bash
# Création des administrateurs hôpital
# (Script local uniquement - ne pas déployer)
node scripts/create-hospital-admin.js

# Mise à jour des mots de passe patients
node scripts/update-patient-passwords.js
```

### 3. Optimisation des performances

```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_patients_patientId ON patients(patientId);
CREATE INDEX idx_medecins_email ON medecins(email);
CREATE INDEX idx_hospital_admins_adminId ON hospital_admins(adminId);
CREATE INDEX idx_consultations_patientId ON consultations(patientId);
```

## 🔒 Sécurité en Production

### 1. Variables d'environnement

```bash
# Ne jamais committer les fichiers .env
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "scripts/" >> .gitignore
```

### 2. CORS Configuration

```typescript
// Backend - Configuration CORS stricte
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: 'Trop de tentatives de connexion'
});

app.use('/api/v1/auth', authLimiter);
```

## 📊 Monitoring et Logs

### 1. Health Check

```typescript
// Endpoint de santé
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'Connected',
      version: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});
```

### 2. Logs structurés

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Monitoring Vercel

```bash
# Analytics Vercel
vercel analytics

# Logs en temps réel
vercel logs --follow
```

## 🧪 Tests de Déploiement

### 1. Tests automatisés

```bash
# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tests de performance
npm run test:performance
```

### 2. Validation post-déploiement

```bash
# Health check
curl https://your-backend.vercel.app/health

# Test d'authentification
curl -X POST https://your-backend.vercel.app/api/v1/auth/patient \
  -H "Content-Type: application/json" \
  -d '{"patientId":"BJ20257830","password":"test123"}'
```

### 3. Tests de charge

```javascript
// Artillery.js configuration
module.exports = {
  config: {
    target: 'https://your-backend.vercel.app',
    phases: [
      { duration: 60, arrivalRate: 10 }
    ]
  },
  scenarios: [
    {
      name: 'Authentication test',
      requests: [
        {
          post: {
            url: '/api/v1/auth/patient',
            json: {
              patientId: 'BJ20257830',
              password: 'test123'
            }
          }
        }
      ]
    }
  ]
};
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

**.github/workflows/deploy.yml :**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. Hooks de déploiement

```bash
# Pre-deploy hooks
npm run lint
npm run test
npm run build

# Post-deploy hooks
npm run test:e2e
npm run validate:deployment
```

## 📈 Performance et Optimisation

### 1. Optimisation Frontend

```typescript
// Code splitting
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const MedecinDashboard = lazy(() => import('./pages/MedecinDashboard'));

// Service Worker pour le cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 2. Optimisation Backend

```typescript
// Compression
import compression from 'compression';
app.use(compression());

// Cache headers
app.use((req, res, next) => {
  if (req.url.includes('/api/')) {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});
```

### 3. Optimisation Base de Données

```sql
-- Connection pooling
-- Configuré automatiquement avec Neon

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM patients WHERE patientId = 'BJ2025001';
```

## 🚨 Rollback et Recovery

### 1. Stratégie de rollback

```bash
# Rollback Vercel
vercel rollback

# Rollback base de données
# Utiliser les backups Neon automatiques
```

### 2. Backup et restore

```bash
# Backup manuel
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## 📞 Support et Maintenance

### 1. Monitoring continu

- **Uptime :** Vercel Analytics
- **Performance :** Web Vitals
- **Erreurs :** Sentry (optionnel)
- **Logs :** Vercel Dashboard

### 2. Maintenance régulière

```bash
# Mise à jour des dépendances
npm audit
npm update

# Nettoyage des logs
# Automatique avec Vercel

# Optimisation base de données
# VACUUM et ANALYZE automatiques avec Neon
```

### 3. Contacts d'urgence

- **Vercel Support :** support@vercel.com
- **Neon Support :** support@neon.tech
- **Repository :** https://github.com/AresGn/hedera-health-id

---

**🚀 Déploiement sécurisé et performant pour Hedera Health ID**
