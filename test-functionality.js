#!/usr/bin/env node

/**
 * Script de test automatisé pour Hedera Health ID
 * Teste toutes les fonctionnalités principales de l'application
 */

const axios = require('axios')
const fs = require('fs')
const path = require('path')

// Configuration
const FRONTEND_URL = 'http://localhost:3002'
const BACKEND_URL = 'http://localhost:3003'
const DEPLOYED_FRONTEND = 'https://hedera-health-id.vercel.app'
const DEPLOYED_BACKEND = 'https://hedera-health-id-backend.vercel.app'

class HealthIDTester {
  constructor() {
    this.results = []
    this.errors = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    console.log(logMessage)
    
    this.results.push({
      timestamp,
      type,
      message
    })
  }

  async testBackendHealth(url, label) {
    try {
      this.log(`Testing ${label} backend health...`)
      
      // Test health endpoint
      const healthResponse = await axios.get(`${url}/health`, { timeout: 10000 })
      if (healthResponse.status === 200) {
        this.log(`✅ ${label} health check passed`, 'success')
        this.log(`Database status: ${healthResponse.data.database}`, 'info')
      } else {
        this.log(`❌ ${label} health check failed: ${healthResponse.status}`, 'error')
      }

      // Test API endpoints
      const testResponse = await axios.get(`${url}/api/v1/test`, { timeout: 10000 })
      if (testResponse.status === 200) {
        this.log(`✅ ${label} API test passed`, 'success')
        const stats = testResponse.data.database_stats
        this.log(`Database stats: ${stats.patients} patients, ${stats.medecins} doctors`, 'info')
      } else {
        this.log(`❌ ${label} API test failed: ${testResponse.status}`, 'error')
      }

      // Test hospitals endpoint
      const hospitalsResponse = await axios.get(`${url}/api/v1/hopitaux`, { timeout: 10000 })
      if (hospitalsResponse.status === 200) {
        this.log(`✅ ${label} hospitals endpoint working`, 'success')
        this.log(`Found ${hospitalsResponse.data.data.length} hospitals`, 'info')
      } else {
        this.log(`❌ ${label} hospitals endpoint failed: ${hospitalsResponse.status}`, 'error')
      }

    } catch (error) {
      this.log(`❌ ${label} backend test failed: ${error.message}`, 'error')
      this.errors.push({ test: `${label} Backend`, error: error.message })
    }
  }

  async testFrontendAccess(url, label) {
    try {
      this.log(`Testing ${label} frontend access...`)
      
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'HealthID-Tester/1.0'
        }
      })
      
      if (response.status === 200) {
        this.log(`✅ ${label} frontend accessible`, 'success')
        
        // Check if it's a React app
        if (response.data.includes('react') || response.data.includes('vite') || response.data.includes('root')) {
          this.log(`✅ ${label} appears to be a React application`, 'success')
        }
        
        // Check for key elements
        if (response.data.includes('HEDERA HEALTH ID')) {
          this.log(`✅ ${label} contains expected branding`, 'success')
        }
        
      } else {
        this.log(`❌ ${label} frontend returned status: ${response.status}`, 'error')
      }
      
    } catch (error) {
      this.log(`❌ ${label} frontend test failed: ${error.message}`, 'error')
      this.errors.push({ test: `${label} Frontend`, error: error.message })
    }
  }

  async testCORSConfiguration() {
    try {
      this.log('Testing CORS configuration...')
      
      // Test CORS with deployed frontend origin
      const corsResponse = await axios.options(`${DEPLOYED_BACKEND}/api/v1/test`, {
        headers: {
          'Origin': DEPLOYED_FRONTEND,
          'Access-Control-Request-Method': 'GET'
        },
        timeout: 10000
      })
      
      if (corsResponse.status === 200 || corsResponse.status === 204) {
        this.log('✅ CORS configuration working', 'success')
      } else {
        this.log(`❌ CORS test failed: ${corsResponse.status}`, 'error')
      }
      
    } catch (error) {
      this.log(`❌ CORS test failed: ${error.message}`, 'error')
      this.errors.push({ test: 'CORS', error: error.message })
    }
  }

  async testFileStructure() {
    this.log('Testing file structure...')
    
    const requiredFiles = [
      'frontend/src/pages/PatientDashboard.tsx',
      'frontend/src/pages/PatientLogin.tsx',
      'frontend/src/pages/HospitalDashboard.tsx',
      'frontend/src/components/patient/PatientDocuments.tsx',
      'frontend/src/components/hospital/ConsultationManagement.tsx',
      'frontend/src/services/fileStorageService.ts',
      'frontend/src/components/StorageTest.tsx',
      'backend/src/index.ts',
      'backend/src/config/app.config.ts'
    ]
    
    let missingFiles = 0
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.log(`✅ Found ${file}`, 'success')
      } else {
        this.log(`❌ Missing ${file}`, 'error')
        missingFiles++
      }
    }
    
    if (missingFiles === 0) {
      this.log('✅ All required files present', 'success')
    } else {
      this.log(`❌ ${missingFiles} files missing`, 'error')
    }
  }

  async testPatientRegistrationFlow() {
    try {
      this.log('Testing patient registration flow...')
      
      // Test patient creation endpoint
      const patientData = {
        nom: 'TEST',
        prenom: 'Patient',
        dateNaissance: '1990-01-01',
        telephone: '+229 12 34 56 78',
        email: 'test@example.com',
        hopitalPrincipal: 'CHU-MEL'
      }
      
      const response = await axios.post(`${DEPLOYED_BACKEND}/api/v1/patients`, patientData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 200 || response.status === 201) {
        this.log('✅ Patient registration endpoint working', 'success')
        if (response.data.data && response.data.data.id) {
          this.log(`✅ Patient ID generated: ${response.data.data.id}`, 'success')
        }
      } else {
        this.log(`❌ Patient registration failed: ${response.status}`, 'error')
      }
      
    } catch (error) {
      this.log(`❌ Patient registration test failed: ${error.message}`, 'error')
      this.errors.push({ test: 'Patient Registration', error: error.message })
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Hedera Health ID functionality tests...')
    this.log('=' * 60)
    
    // Test file structure
    await this.testFileStructure()
    
    // Test local development servers
    await this.testFrontendAccess(FRONTEND_URL, 'Local')
    await this.testBackendHealth(BACKEND_URL, 'Local')
    
    // Test deployed applications
    await this.testFrontendAccess(DEPLOYED_FRONTEND, 'Deployed')
    await this.testBackendHealth(DEPLOYED_BACKEND, 'Deployed')
    
    // Test CORS
    await this.testCORSConfiguration()
    
    // Test patient registration
    await this.testPatientRegistrationFlow()
    
    // Generate summary
    this.generateSummary()
  }

  generateSummary() {
    this.log('=' * 60)
    this.log('📊 TEST SUMMARY')
    this.log('=' * 60)
    
    const successCount = this.results.filter(r => r.type === 'success').length
    const errorCount = this.results.filter(r => r.type === 'error').length
    const totalTests = successCount + errorCount
    
    this.log(`Total tests: ${totalTests}`)
    this.log(`Passed: ${successCount}`)
    this.log(`Failed: ${errorCount}`)
    this.log(`Success rate: ${((successCount / totalTests) * 100).toFixed(1)}%`)
    
    if (this.errors.length > 0) {
      this.log('\n❌ ERRORS FOUND:')
      this.errors.forEach(error => {
        this.log(`  - ${error.test}: ${error.error}`)
      })
    } else {
      this.log('\n✅ ALL TESTS PASSED!')
    }
    
    // Save results to file
    const reportPath = 'test-results.json'
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: successCount,
        failed: errorCount,
        successRate: ((successCount / totalTests) * 100).toFixed(1)
      },
      results: this.results,
      errors: this.errors
    }, null, 2))
    
    this.log(`\n📄 Detailed results saved to: ${reportPath}`)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new HealthIDTester()
  tester.runAllTests().catch(error => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = HealthIDTester
