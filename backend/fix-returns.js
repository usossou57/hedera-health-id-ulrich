#!/usr/bin/env node

/**
 * Script pour ajouter les returns manquants dans les routes
 */

const fs = require('fs');
const path = require('path');

const routeFiles = [
    'src/routes/blockchain/access-control.ts',
    'src/routes/blockchain/medical-records.ts'
];

console.log('🔧 Ajout des returns manquants dans les routes...\n');

routeFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Fichier non trouvé: ${filePath}`);
        return;
    }
    
    console.log(`📝 Correction de: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changes = 0;
    
    // Patterns pour ajouter return devant res.json et res.status
    const patterns = [
        {
            regex: /(\s+)(res\.json\()/g,
            replacement: '$1return $2'
        },
        {
            regex: /(\s+)(res\.status\(\d+\)\.json\()/g,
            replacement: '$1return $2'
        }
    ];
    
    patterns.forEach(pattern => {
        const matches = content.match(pattern.regex);
        if (matches) {
            // Éviter les doublons de return
            content = content.replace(/return return /g, 'return ');
            content = content.replace(pattern.regex, pattern.replacement);
            changes += matches.length;
        }
    });
    
    // Nettoyer les doublons de return
    content = content.replace(/return return /g, 'return ');
    
    if (changes > 0) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`   💾 ${changes} return(s) ajouté(s)\n`);
    } else {
        console.log(`   ✅ Aucune correction nécessaire\n`);
    }
});

console.log('🎉 Correction des returns terminée!');
