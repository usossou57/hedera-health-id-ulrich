#!/bin/bash

# Script de déploiement pour Hedera Health ID
# Ce script prépare le projet pour la soumission finale

echo "🚀 Déploiement de Hedera Health ID - Version de production"
echo "========================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# 1. Nettoyer les fichiers temporaires
echo "🧹 Nettoyage des fichiers temporaires..."
rm -f test_*.js
rm -rf frontend/dist
rm -rf backend/dist
rm -rf node_modules/.cache
echo "✅ Nettoyage terminé"

# 2. Installer les dépendances
echo "📦 Installation des dépendances..."
echo "   - Frontend..."
cd frontend && npm install --production=false
echo "   - Backend..."
cd ../backend && npm install --production=false
cd ..
echo "✅ Dépendances installées"

# 3. Build du frontend
echo "🏗️  Build du frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi
cd ..
echo "✅ Build frontend terminé"

# 4. Build du backend (si nécessaire)
echo "🏗️  Préparation du backend..."
cd backend
# Vérifier la configuration TypeScript
if [ -f "tsconfig.json" ]; then
    echo "   - Compilation TypeScript..."
    npx tsc --noEmit
    if [ $? -ne 0 ]; then
        echo "❌ Erreur de compilation TypeScript"
        exit 1
    fi
fi
cd ..
echo "✅ Backend préparé"

# 5. Vérifier les variables d'environnement
echo "🔧 Vérification de la configuration..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Attention: Fichier .env manquant dans backend/"
    echo "   Création d'un fichier .env par défaut..."
    cat > backend/.env << EOF
# Configuration de base pour la production
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/hedera_health_id"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your-hedera-private-key
EOF
    echo "   ⚠️  IMPORTANT: Configurez les vraies valeurs dans backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    echo "   Création du fichier .env frontend..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="Hedera Health ID"
VITE_HEDERA_NETWORK=testnet
EOF
fi
echo "✅ Configuration vérifiée"

# 6. Tests de base
echo "🧪 Tests de base..."
echo "   - Vérification de la structure du projet..."
required_files=(
    "README.md"
    "package.json"
    "frontend/package.json"
    "backend/package.json"
    "frontend/dist/index.html"
    "docs/PRESENTATION_JURY.md"
    "docs/COMPREHENSIVE_PROJECT_README.md"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Fichier manquant: $file"
        exit 1
    fi
done
echo "✅ Structure du projet validée"

# 7. Informations de déploiement
echo ""
echo "🎉 Déploiement terminé avec succès!"
echo "=================================="
echo ""
echo "📋 Informations de déploiement:"
echo "   - Frontend build: frontend/dist/"
echo "   - Backend source: backend/src/"
echo "   - Documentation: docs/"
echo ""
echo "🚀 Pour démarrer l'application:"
echo "   1. Backend: cd backend && npm start"
echo "   2. Frontend: cd frontend && npm run preview (pour tester le build)"
echo "   3. Ou servir frontend/dist/ avec un serveur web"
echo ""
echo "📊 Statistiques du build:"
if [ -d "frontend/dist" ]; then
    echo "   - Taille du build frontend: $(du -sh frontend/dist | cut -f1)"
fi
echo "   - Nombre de fichiers de documentation: $(find docs -name '*.md' | wc -l)"
echo ""
echo "✅ Le projet est prêt pour la soumission!"
