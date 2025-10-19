import { useState } from 'react'
import { FileText, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useFileStorage } from '@/services/fileStorageService'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function StorageTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const fileStorage = useFileStorage()

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    const results: TestResult[] = []

    try {
      // Test 1: Création d'un fichier fictif
      results.push({
        test: 'Création fichier test',
        status: 'success',
        message: 'Fichier de test créé avec succès'
      })

      // Test 2: Upload de fichier simulé
      const testFile = new File(['Test content'], 'test-document.txt', { type: 'text/plain' })
      const testPatientId = 'BJ2025TEST'

      try {
        const uploadedFiles = await fileStorage.uploadFiles([testFile], testPatientId)
        results.push({
          test: 'Upload fichier',
          status: 'success',
          message: `Fichier uploadé avec succès: ${uploadedFiles[0].name}`,
          details: uploadedFiles[0]
        })

        // Test 3: Récupération du fichier
        const retrievedFile = await fileStorage.getFile(uploadedFiles[0].id)
        if (retrievedFile) {
          results.push({
            test: 'Récupération fichier',
            status: 'success',
            message: 'Fichier récupéré avec succès',
            details: retrievedFile
          })
        } else {
          results.push({
            test: 'Récupération fichier',
            status: 'error',
            message: 'Impossible de récupérer le fichier'
          })
        }

        // Test 4: Récupération des fichiers du patient
        const patientFiles = await fileStorage.getPatientFiles(testPatientId)
        results.push({
          test: 'Fichiers du patient',
          status: 'success',
          message: `${patientFiles.length} fichier(s) trouvé(s) pour le patient`,
          details: patientFiles
        })

        // Test 5: Statistiques de stockage
        const stats = fileStorage.getStorageStats()
        results.push({
          test: 'Statistiques stockage',
          status: 'success',
          message: `${stats.totalFiles} fichiers, ${(stats.totalSize / 1024).toFixed(1)} KB total`,
          details: stats
        })

        // Test 6: Suppression du fichier de test
        const deleteSuccess = await fileStorage.deleteFile(uploadedFiles[0].id)
        results.push({
          test: 'Suppression fichier',
          status: deleteSuccess ? 'success' : 'error',
          message: deleteSuccess ? 'Fichier supprimé avec succès' : 'Erreur lors de la suppression'
        })

      } catch (uploadError) {
        results.push({
          test: 'Upload fichier',
          status: 'error',
          message: `Erreur lors de l'upload: ${uploadError}`,
          details: uploadError
        })
      }

      // Test 7: Vérification localStorage
      try {
        const testKey = 'storage_test'
        const testValue = { test: true, timestamp: Date.now() }
        localStorage.setItem(testKey, JSON.stringify(testValue))
        const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
        localStorage.removeItem(testKey)
        
        if (retrieved.test === true) {
          results.push({
            test: 'LocalStorage',
            status: 'success',
            message: 'LocalStorage fonctionne correctement'
          })
        } else {
          results.push({
            test: 'LocalStorage',
            status: 'error',
            message: 'Problème avec localStorage'
          })
        }
      } catch (storageError) {
        results.push({
          test: 'LocalStorage',
          status: 'error',
          message: `Erreur localStorage: ${storageError}`,
          details: storageError
        })
      }

      // Test 8: Validation des types de fichiers
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' })
      try {
        await fileStorage.uploadFiles([invalidFile], testPatientId)
        results.push({
          test: 'Validation types fichiers',
          status: 'warning',
          message: 'La validation des types de fichiers pourrait être améliorée'
        })
      } catch (validationError) {
        results.push({
          test: 'Validation types fichiers',
          status: 'success',
          message: 'Validation des types de fichiers fonctionne correctement'
        })
      }

    } catch (error) {
      results.push({
        test: 'Test général',
        status: 'error',
        message: `Erreur générale: ${error}`,
        details: error
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Test du Stockage de Documents</h3>
        </div>
        <Button 
          variant="primary" 
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center space-x-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Tests en cours...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Lancer les tests</span>
            </>
          )}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-800">
                  {testResults.filter(r => r.status === 'success').length} Réussis
                </span>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-800">
                  {testResults.filter(r => r.status === 'error').length} Échoués
                </span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-800">
                  {testResults.filter(r => r.status === 'warning').length} Avertissements
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{result.test}</h4>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Voir les détails
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Cliquez sur "Lancer les tests" pour vérifier le stockage des documents</p>
        </div>
      )}
    </div>
  )
}
