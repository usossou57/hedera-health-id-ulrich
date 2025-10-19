import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Trash2, Upload, Plus, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'
import { useFileStorage, UploadedFile, UploadProgress } from '@/services/fileStorageService'
import { useSession } from '@/components/ProtectedRoute'

export default function PatientDocuments() {
  const { sessionData } = useSession('patient')
  const fileStorage = useFileStorage()
  
  const [documents, setDocuments] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDocuments, setFilteredDocuments] = useState<UploadedFile[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (sessionData?.patientId) {
      loadDocuments()
    }
  }, [sessionData])

  useEffect(() => {
    // Filtrer les documents selon le terme de recherche
    const filtered = documents.filter(doc =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDocuments(filtered)
  }, [documents, searchTerm])

  const loadDocuments = async () => {
    if (!sessionData?.patientId) return

    setIsLoading(true)
    try {
      const patientDocs = await fileStorage.getPatientFiles(sessionData.patientId)
      setDocuments(patientDocs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!sessionData?.patientId || selectedFiles.length === 0) return

    setIsUploading(true)
    try {
      const uploadedFiles = await fileStorage.uploadFiles(
        selectedFiles,
        sessionData.patientId,
        (progress) => setUploadProgress(progress)
      )
      
      // Add new files to the list
      setDocuments(prev => [...prev, ...uploadedFiles])
      setSelectedFiles([])
      setShowUpload(false)
      setUploadProgress([])
    } catch (error) {
      console.error('Error during upload:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const success = await fileStorage.deleteFile(fileId)
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== fileId))
      }
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hedera-500"></div>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <FileText className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">My Documents</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {documents.length} documents
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
            </span>
          </div>
        </div>

        {/* Search bar and actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search in my documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter document</span>
          </Button>
        </div>
      </div>

      {/* Zone d'upload */}
      {showUpload && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Add Documents</h4>
          
          <FileUpload
            label="Select Files"
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            multiple={true}
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
            onFileRemove={handleFileRemove}
          />

          {/* Indicateur de progression */}
          {isUploading && uploadProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Upload en cours...</p>
              {uploadProgress.map((progress) => (
                <div key={progress.fileId} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{progress.fileName}</span>
                    <span>{Math.round(progress.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.status === 'error' ? 'bg-red-500' : 
                        progress.status === 'completed' ? 'bg-green-500' : 'bg-hedera-500'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.error && (
                    <p className="text-xs text-red-600">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUpload(false)
                setSelectedFiles([])
                setUploadProgress([])
              }}
            >
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Upload...' : `Uploader ${selectedFiles.length} fichier(s)`}
            </Button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredDocuments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(document.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{document.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(document.size)}</span>
                        <span>{new Date(document.uploadedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(document.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'No documents found for this search'
                : 'You haven\'t added any documents yet'
              }
            </p>
            {!searchTerm && (
              <Button 
                variant="primary" 
                onClick={() => setShowUpload(true)}
                className="flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter mon premier document</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
