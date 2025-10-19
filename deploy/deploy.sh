#!/bin/bash

echo "🚀 Déploiement Hedera Health ID"

# Build frontend
cd frontend
npm run build

# Deploy to Vercel (exemple)
# vercel --prod

echo "✅ Déploiement terminé"
