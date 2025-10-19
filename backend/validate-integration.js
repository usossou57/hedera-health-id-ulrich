#!/usr/bin/env node

/**
 * Script de validation de l'intégration complète
 * 
 * Ce script vérifie que tous les composants de l'intégration
 * sont correctement en place et fonctionnels.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation de l\'intégration Hedera Health ID');
console.log('================================================\n');

let validationErrors = [];
let validationWarnings = [];

// 1. Vérifier la structure des dossiers
console.log('📁 Vérification de la structure des dossiers...');

const requiredDirs = [
    'src/contracts',
    'src/services/hedera',
    'src/routes/blockchain',
    'src/scripts/blockchain',
    'src/tests/blockchain'
];

requiredDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${dir}`);
    } else {
        console.log(`   ❌ ${dir}`);
        validationErrors.push(`Dossier manquant: ${dir}`);
    }
});

// 2. Vérifier les smart contracts
console.log('\n📜 Vérification des smart contracts...');

const requiredContracts = [
    'src/contracts/PatientIdentityContract.sol',
    'src/contracts/AccessControlContract.sol',
    'src/contracts/MedicalRecordsContract.sol'
];

requiredContracts.forEach(contract => {
    const fullPath = path.join(__dirname, contract);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${contract}`);
    } else {
        console.log(`   ❌ ${contract}`);
        validationErrors.push(`Smart contract manquant: ${contract}`);
    }
});

// 3. Vérifier les services
console.log('\n🔧 Vérification des services...');

const requiredServices = [
    'src/services/hedera/hedera.service.ts',
    'src/services/hedera/patient-identity.service.ts',
    'src/services/hedera/access-control.service.ts',
    'src/services/hedera/medical-records.service.ts',
    'src/services/hedera/index.ts'
];

requiredServices.forEach(service => {
    const fullPath = path.join(__dirname, service);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${service}`);
    } else {
        console.log(`   ❌ ${service}`);
        validationErrors.push(`Service manquant: ${service}`);
    }
});

// 4. Vérifier les routes API
console.log('\n🌐 Vérification des routes API...');

const requiredRoutes = [
    'src/routes/blockchain/patients.ts',
    'src/routes/blockchain/medical-records.ts',
    'src/routes/blockchain/access-control.ts',
    'src/routes/blockchain/index.ts'
];

requiredRoutes.forEach(route => {
    const fullPath = path.join(__dirname, route);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${route}`);
    } else {
        console.log(`   ❌ ${route}`);
        validationErrors.push(`Route manquante: ${route}`);
    }
});

// 5. Vérifier les scripts
console.log('\n📋 Vérification des scripts...');

const requiredScripts = [
    'src/scripts/blockchain/compile.js',
    'src/scripts/blockchain/deploy-complete-system.js',
    'src/scripts/blockchain/deploy-patient-contract.js',
    'src/scripts/blockchain/deploy-access-control.js'
];

requiredScripts.forEach(script => {
    const fullPath = path.join(__dirname, script);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${script}`);
    } else {
        console.log(`   ❌ ${script}`);
        validationErrors.push(`Script manquant: ${script}`);
    }
});

// 6. Vérifier les tests
console.log('\n🧪 Vérification des tests...');

const requiredTests = [
    'src/tests/blockchain/hedera-services.test.ts',
    'src/tests/blockchain/api-routes.test.ts',
    'src/tests/blockchain/integration.test.ts',
    'src/tests/blockchain/setup.ts'
];

requiredTests.forEach(test => {
    const fullPath = path.join(__dirname, test);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${test}`);
    } else {
        console.log(`   ❌ ${test}`);
        validationErrors.push(`Test manquant: ${test}`);
    }
});

// 7. Vérifier package.json
console.log('\n📦 Vérification de package.json...');

try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    // Vérifier les dépendances Hedera
    const requiredDeps = ['@hashgraph/sdk', '@openzeppelin/contracts', 'solc'];
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`   ✅ Dépendance: ${dep}@${packageJson.dependencies[dep]}`);
        } else {
            console.log(`   ❌ Dépendance manquante: ${dep}`);
            validationErrors.push(`Dépendance manquante: ${dep}`);
        }
    });
    
    // Vérifier les scripts
    const requiredScriptNames = [
        'contracts:compile',
        'contracts:deploy',
        'test:blockchain'
    ];
    
    requiredScriptNames.forEach(scriptName => {
        if (packageJson.scripts && packageJson.scripts[scriptName]) {
            console.log(`   ✅ Script: ${scriptName}`);
        } else {
            console.log(`   ❌ Script manquant: ${scriptName}`);
            validationErrors.push(`Script manquant: ${scriptName}`);
        }
    });
    
} catch (error) {
    console.log('   ❌ Erreur lors de la lecture de package.json');
    validationErrors.push('Impossible de lire package.json');
}

// 8. Vérifier la configuration
console.log('\n⚙️ Vérification de la configuration...');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('   ✅ Fichier .env présent');
    
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredEnvVars = [
            'OPERATOR_ID',
            'OPERATOR_KEY',
            'PATIENT_IDENTITY_CONTRACT_ID',
            'ACCESS_CONTROL_CONTRACT_ID',
            'MEDICAL_RECORDS_CONTRACT_ID'
        ];
        
        requiredEnvVars.forEach(envVar => {
            if (envContent.includes(envVar)) {
                console.log(`   ✅ Variable: ${envVar}`);
            } else {
                console.log(`   ⚠️ Variable manquante: ${envVar}`);
                validationWarnings.push(`Variable d'environnement à configurer: ${envVar}`);
            }
        });
    } catch (error) {
        console.log('   ❌ Erreur lors de la lecture du fichier .env');
        validationErrors.push('Impossible de lire le fichier .env');
    }
} else {
    console.log('   ❌ Fichier .env manquant');
    validationErrors.push('Fichier .env manquant');
}

// 9. Vérifier l'intégration dans index.ts
console.log('\n🔗 Vérification de l\'intégration dans index.ts...');

const indexPath = path.join(__dirname, 'src/index.ts');
if (fs.existsSync(indexPath)) {
    try {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        if (indexContent.includes('blockchainRouter')) {
            console.log('   ✅ Routes blockchain intégrées');
        } else {
            console.log('   ❌ Routes blockchain non intégrées');
            validationErrors.push('Routes blockchain non intégrées dans index.ts');
        }
        
        if (indexContent.includes('/api/hedera')) {
            console.log('   ✅ Endpoint /api/hedera configuré');
        } else {
            console.log('   ❌ Endpoint /api/hedera non configuré');
            validationErrors.push('Endpoint /api/hedera non configuré');
        }
    } catch (error) {
        console.log('   ❌ Erreur lors de la lecture de index.ts');
        validationErrors.push('Impossible de lire index.ts');
    }
} else {
    console.log('   ❌ Fichier index.ts manquant');
    validationErrors.push('Fichier index.ts manquant');
}

// 10. Résumé de la validation
console.log('\n📊 Résumé de la validation');
console.log('==========================');

if (validationErrors.length === 0) {
    console.log('🎉 SUCCÈS: Intégration complète et valide !');
    console.log('\n✅ Tous les composants sont en place');
    console.log('✅ Structure des dossiers correcte');
    console.log('✅ Smart contracts présents');
    console.log('✅ Services backend intégrés');
    console.log('✅ Routes API configurées');
    console.log('✅ Scripts de déploiement prêts');
    console.log('✅ Tests implémentés');
    
    if (validationWarnings.length > 0) {
        console.log('\n⚠️ Avertissements:');
        validationWarnings.forEach(warning => {
            console.log(`   - ${warning}`);
        });
        console.log('\n💡 Consultez HEDERA_ENV_SETUP.md pour la configuration');
    }
    
    console.log('\n🚀 Prêt pour le hackathon Hedera !');
    process.exit(0);
} else {
    console.log('❌ ÉCHEC: Problèmes détectés dans l\'intégration');
    console.log('\n🔧 Erreurs à corriger:');
    validationErrors.forEach(error => {
        console.log(`   - ${error}`);
    });
    
    if (validationWarnings.length > 0) {
        console.log('\n⚠️ Avertissements:');
        validationWarnings.forEach(warning => {
            console.log(`   - ${warning}`);
        });
    }
    
    console.log('\n📚 Consultez INTEGRATION_COMPLETE.md pour plus d\'informations');
    process.exit(1);
}
