#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les erreurs TypeScript communes
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/services/hedera/access-control.service.ts',
    'src/services/hedera/medical-records.service.ts',
    'src/services/hedera/patient-identity.service.ts',
    'src/routes/blockchain/index.ts'
];

console.log('🔧 Correction automatique des erreurs TypeScript...\n');

filesToFix.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Fichier non trouvé: ${filePath}`);
        return;
    }
    
    console.log(`📝 Correction de: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changes = 0;
    
    // Corriger error.message -> error instanceof Error ? error.message : 'Erreur inconnue'
    const errorMessageRegex = /error\.message/g;
    const newErrorHandling = "error instanceof Error ? error.message : 'Erreur inconnue'";
    
    const matches = content.match(errorMessageRegex);
    if (matches) {
        content = content.replace(errorMessageRegex, newErrorHandling);
        changes += matches.length;
        console.log(`   ✅ ${matches.length} erreur(s) de gestion d'erreur corrigée(s)`);
    }
    
    // Corriger les routes qui n'ont pas de return
    if (filePath.includes('routes/blockchain/')) {
        // Ajouter des returns manquants dans les routes
        const routePatterns = [
            /router\.(get|post|put|delete)\([^}]+\}\);/g
        ];
        
        // Cette correction est plus complexe, on la fera manuellement si nécessaire
    }
    
    if (changes > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`   💾 ${changes} correction(s) appliquée(s)\n`);
    } else {
        console.log(`   ✅ Aucune correction nécessaire\n`);
    }
});

console.log('🎉 Correction automatique terminée!');
