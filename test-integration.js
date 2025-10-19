#!/usr/bin/env node

/**
 * Test d'intégration complète Hedera Health ID
 * 
 * Ce script teste toutes les fonctionnalités principales :
 * - Connexion frontend-backend
 * - Routes Hedera
 * - Création et récupération de patients
 * - Dashboards
 */

const https = require('https');

const BACKEND_URL = 'https://hedera-health-id-backend.vercel.app';
const FRONTEND_URL = 'https://hedera-health-id.vercel.app';

console.log('🧪 DÉMARRAGE DES TESTS D\'INTÉGRATION HEDERA HEALTH ID');
console.log('=' .repeat(60));

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.method === 'POST' && options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testBackendHealth() {
    console.log('\n🔍 Test 1: Santé du backend');
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/v1/test`);
        if (response.status === 200 && response.data.message) {
            console.log('✅ Backend opérationnel');
            console.log(`   📊 Stats: ${JSON.stringify(response.data.database_stats)}`);
            return true;
        }
    } catch (error) {
        console.log('❌ Backend inaccessible:', error.message);
    }
    return false;
}

async function testHederaRoutes() {
    console.log('\n🔍 Test 2: Routes Hedera');
    try {
        // Test health
        const healthResponse = await makeRequest(`${BACKEND_URL}/api/hedera/health`);
        if (healthResponse.status === 200 && healthResponse.data.success) {
            console.log('✅ Route /api/hedera/health fonctionnelle');
        } else {
            console.log('❌ Route /api/hedera/health défaillante');
            return false;
        }

        // Test contracts
        const contractsResponse = await makeRequest(`${BACKEND_URL}/api/hedera/contracts`);
        if (contractsResponse.status === 200 && contractsResponse.data.contracts) {
            console.log('✅ Route /api/hedera/contracts fonctionnelle');
            console.log(`   📋 Contrats: ${JSON.stringify(contractsResponse.data.contracts)}`);
        } else {
            console.log('❌ Route /api/hedera/contracts défaillante');
            return false;
        }

        return true;
    } catch (error) {
        console.log('❌ Erreur routes Hedera:', error.message);
        return false;
    }
}

async function testPatientCreation() {
    console.log('\n🔍 Test 3: Création de patient');
    try {
        const patientData = {
            personalData: {
                firstName: 'Test',
                lastName: 'Integration',
                dateOfBirth: '1985-05-15',
                gender: 'F'
            },
            patientAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
        };

        const response = await makeRequest(`${BACKEND_URL}/api/hedera/create-patient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });

        if (response.status === 200 && response.data.success) {
            console.log('✅ Création de patient réussie');
            console.log(`   👤 Patient ID: ${response.data.patientId}`);
            console.log(`   🔗 Transaction: ${response.data.transactionId}`);
            return response.data.patientId;
        } else {
            console.log('❌ Échec création patient');
            return null;
        }
    } catch (error) {
        console.log('❌ Erreur création patient:', error.message);
        return null;
    }
}

async function testPatientRetrieval(patientId) {
    console.log('\n🔍 Test 4: Récupération de patient');
    try {
        const response = await makeRequest(`${BACKEND_URL}/api/hedera/patient/${patientId}`);
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Récupération de patient réussie');
            console.log(`   👤 Patient ID: ${response.data.patient.patientId}`);
            console.log(`   🔐 Données chiffrées: ${response.data.patient.encryptedPersonalData.substring(0, 20)}...`);
            return true;
        } else {
            console.log('❌ Échec récupération patient');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur récupération patient:', error.message);
        return false;
    }
}

async function testFrontendPages() {
    console.log('\n🔍 Test 5: Pages frontend');
    const pages = [
        '/',
        '/inscription-patient',
        '/dashboard-patient',
        '/dashboard-medecin',
        '/dashboard-hopital'
    ];

    let successCount = 0;
    for (const page of pages) {
        try {
            const response = await makeRequest(`${FRONTEND_URL}${page}`);
            if (response.status === 200) {
                console.log(`✅ Page ${page} accessible`);
                successCount++;
            } else {
                console.log(`❌ Page ${page} inaccessible (${response.status})`);
            }
        } catch (error) {
            console.log(`❌ Page ${page} erreur:`, error.message);
        }
    }

    return successCount === pages.length;
}

async function runAllTests() {
    console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    console.log(`🔧 Backend: ${BACKEND_URL}`);
    
    const results = {
        backendHealth: await testBackendHealth(),
        hederaRoutes: await testHederaRoutes(),
        patientCreation: null,
        patientRetrieval: false,
        frontendPages: await testFrontendPages()
    };

    // Test création et récupération de patient
    results.patientCreation = await testPatientCreation();
    if (results.patientCreation) {
        results.patientRetrieval = await testPatientRetrieval(results.patientCreation);
    }

    // Résumé final
    console.log('\n' + '🎯'.repeat(20));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('🎯'.repeat(20));
    
    const tests = [
        ['Backend Health', results.backendHealth],
        ['Routes Hedera', results.hederaRoutes],
        ['Création Patient', !!results.patientCreation],
        ['Récupération Patient', results.patientRetrieval],
        ['Pages Frontend', results.frontendPages]
    ];

    let passedTests = 0;
    tests.forEach(([name, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${name}`);
        if (passed) passedTests++;
    });

    const percentage = Math.round((passedTests / tests.length) * 100);
    console.log(`\n🏆 SCORE: ${passedTests}/${tests.length} (${percentage}%)`);
    
    if (percentage >= 80) {
        console.log('🎉 INTÉGRATION RÉUSSIE ! Le système est prêt pour le hackathon.');
    } else if (percentage >= 60) {
        console.log('⚠️ INTÉGRATION PARTIELLE. Quelques ajustements nécessaires.');
    } else {
        console.log('❌ INTÉGRATION DÉFAILLANTE. Corrections majeures requises.');
    }

    return percentage;
}

// Exécution des tests
runAllTests().then(score => {
    process.exit(score >= 80 ? 0 : 1);
}).catch(error => {
    console.error('💥 ERREUR CRITIQUE:', error);
    process.exit(1);
});
