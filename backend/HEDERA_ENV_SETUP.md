# Configuration Environnement Hedera

## Variables d'environnement requises

### 1. Compte Hedera Testnet

Pour utiliser les smart contracts, vous devez créer un compte Hedera Testnet :

1. Allez sur [Hedera Portal](https://portal.hedera.com/)
2. Créez un compte testnet
3. Récupérez votre `Account ID` et `Private Key`

### 2. Variables à configurer dans `.env`

```bash
# Compte principal Hedera
OPERATOR_ID=0.0.XXXXXX          # Votre Account ID Hedera
OPERATOR_KEY=302e020100300506032b657004220420XXXXXXXX  # Votre Private Key

# Adresses des contrats (seront remplies après déploiement)
PATIENT_IDENTITY_CONTRACT_ID=0.0.XXXXXX
ACCESS_CONTROL_CONTRACT_ID=0.0.XXXXXX
MEDICAL_RECORDS_CONTRACT_ID=0.0.XXXXXX

# Services Hedera optionnels
HCS_TOPIC_ID=0.0.XXXXXX         # Pour Hedera Consensus Service
MEDICAL_PERMISSION_TOKEN_ID=0.0.XXXXXX  # Pour Hedera Token Service
```

### 3. Déploiement des contrats

Une fois les variables configurées, déployez les contrats :

```bash
# Compiler les contrats
npm run contracts:compile

# Déployer tous les contrats
node src/scripts/blockchain/deploy-complete-system.js

# Ou déployer individuellement
node src/scripts/blockchain/deploy-patient-contract.js
node src/scripts/blockchain/deploy-access-control.js
```

### 4. Tests

Testez les contrats déployés :

```bash
# Tests offline (simulation)
node src/scripts/blockchain/test-offline.js

# Tests avec contrats déployés
node src/scripts/blockchain/test-access-control-offline.js
node src/scripts/blockchain/test-medical-records-offline.js
```

## Sécurité

⚠️ **Important** : 
- Ne jamais committer les clés privées dans le code
- Utilisez des comptes testnet uniquement pour le développement
- Pour la production, utilisez des variables d'environnement sécurisées
