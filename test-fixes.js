#!/usr/bin/env node

/**
 * Test script to validate all the fixes implemented
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

console.log('🧪 Testing Hedera Health ID Fixes...\n');

// Test 1: Check if backend is running
async function testBackendHealth() {
  console.log('1. Testing Backend Health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      console.log('   ✅ Backend is running and healthy');
      return true;
    }
  } catch (error) {
    console.log('   ❌ Backend health check failed:', error.message);
    return false;
  }
}

// Test 2: Check if frontend builds successfully
function testFrontendBuild() {
  console.log('2. Testing Frontend Build...');
  const buildPath = path.join(__dirname, 'frontend', 'dist');
  if (fs.existsSync(buildPath)) {
    console.log('   ✅ Frontend build exists');
    return true;
  } else {
    console.log('   ❌ Frontend build not found');
    return false;
  }
}

// Test 3: Check translation fixes
function testTranslationFixes() {
  console.log('3. Testing Translation Fixes...');
  const filesToCheck = [
    'frontend/src/components/patient/PatientDocuments.tsx',
    'frontend/src/components/QRScanner.tsx',
    'frontend/src/components/patient/PatientOverview.tsx'
  ];
  
  let allFixed = true;
  
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for French text that should be translated
      const frenchTexts = [
        'Saisir ID manuellement',
        'Mes Documents',
        'Chargement des documents',
        'Carte d\'identité patient',
        'Rechercher'
      ];
      
      const foundFrench = frenchTexts.filter(text => content.includes(text));
      if (foundFrench.length === 0) {
        console.log(`   ✅ ${file} - French text translated`);
      } else {
        console.log(`   ❌ ${file} - Still contains French: ${foundFrench.join(', ')}`);
        allFixed = false;
      }
    }
  });
  
  return allFixed;
}

// Test 4: Check Hospital Dashboard fixes
function testHospitalDashboardFixes() {
  console.log('4. Testing Hospital Dashboard Fixes...');
  const filePath = path.join(__dirname, 'frontend/src/pages/HospitalDashboard.tsx');
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for null safety fixes
    const hasNullSafety = content.includes('stats.patients?.actifs') && 
                         content.includes('stats && stats.patients &&');
    
    if (hasNullSafety) {
      console.log('   ✅ Hospital Dashboard null safety implemented');
      return true;
    } else {
      console.log('   ❌ Hospital Dashboard null safety missing');
      return false;
    }
  } else {
    console.log('   ❌ Hospital Dashboard file not found');
    return false;
  }
}

// Test 5: Check Patient Consultation View Button
function testConsultationViewButton() {
  console.log('5. Testing Patient Consultation View Button...');
  const filePath = path.join(__dirname, 'frontend/src/components/patient/PatientConsultations.tsx');
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for modal implementation
    const hasModal = content.includes('selectedConsultation') && 
                    content.includes('handleViewConsultation') &&
                    content.includes('Consultation Details');
    
    if (hasModal) {
      console.log('   ✅ Consultation view modal implemented');
      return true;
    } else {
      console.log('   ❌ Consultation view modal missing');
      return false;
    }
  } else {
    console.log('   ❌ PatientConsultations file not found');
    return false;
  }
}

// Test 6: Check API endpoints
async function testAPIEndpoints() {
  console.log('6. Testing API Endpoints...');
  const endpoints = [
    '/api/v1/test',
    '/api/v1/patients',
    '/api/v1/hopitaux'
  ];
  
  let allWorking = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      if (response.status === 200) {
        console.log(`   ✅ ${endpoint} - Working`);
      } else {
        console.log(`   ❌ ${endpoint} - Status: ${response.status}`);
        allWorking = false;
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Error: ${error.message}`);
      allWorking = false;
    }
  }
  
  return allWorking;
}

// Run all tests
async function runAllTests() {
  const results = {
    backendHealth: await testBackendHealth(),
    frontendBuild: testFrontendBuild(),
    translations: testTranslationFixes(),
    hospitalDashboard: testHospitalDashboardFixes(),
    consultationButton: testConsultationViewButton(),
    apiEndpoints: await testAPIEndpoints()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All fixes have been successfully implemented!');
    return true;
  } else {
    console.log('⚠️  Some issues still need attention.');
    return false;
  }
}

// Execute tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
