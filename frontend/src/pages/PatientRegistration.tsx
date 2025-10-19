import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Phone, Mail, Building2, FileText, User, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import FileUpload from '@/components/ui/FileUpload'
import ProgressBar from '@/components/ui/ProgressBar'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { useFileStorage, UploadProgress } from '@/services/fileStorageService'

interface PatientFormData {
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email: string
  motDePasse: string
  confirmerMotDePasse: string
  hopitalPrincipal: string
  accepteConditions: boolean
  consentementDonnees: boolean
}

interface PatientFormErrors {
  nom?: string
  prenom?: string
  dateNaissance?: string
  telephone?: string
  email?: string
  motDePasse?: string
  confirmerMotDePasse?: string
  hopitalPrincipal?: string
  accepteConditions?: string
  consentementDonnees?: string
}

const hopitauxOptions = [
  { value: 'chu-mel', label: 'CHU-MEL - Cotonou' },
  { value: 'cnhu', label: 'CNHU - Cotonou' },
  { value: 'pasteur', label: 'Louis Pasteur Clinic' },
  { value: 'akpakpa', label: 'Akpakpa Health Center' },
]

export default function PatientRegistration() {
  const [formData, setFormData] = useState<PatientFormData>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    telephone: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    hopitalPrincipal: '',
    accepteConditions: false,
    consentementDonnees: false,
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<PatientFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false)
  const [generatedPatientId, setGeneratedPatientId] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)

  const fileStorage = useFileStorage()

  const steps = ['Information', 'Hospital', 'Documents', 'Validation']

  // Calculate completion percentage automatically
  useEffect(() => {
    const requiredFields = ['nom', 'prenom', 'dateNaissance', 'telephone', 'motDePasse', 'confirmerMotDePasse', 'hopitalPrincipal']
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof PatientFormData]
      return typeof value === 'string' ? value.trim() !== '' : Boolean(value)
    })

    const percentage = (filledFields.length / requiredFields.length) * 100
    setCompletionPercentage(percentage)

    // Automatic step update
    if (percentage >= 80 && formData.accepteConditions && formData.consentementDonnees) {
      setCurrentStep(4) // Validation
    } else if (percentage >= 60 && formData.hopitalPrincipal) {
      setCurrentStep(3) // Documents
    } else if (percentage >= 40 && (formData.nom || formData.prenom)) {
      setCurrentStep(2) // Hospital
    } else {
      setCurrentStep(1) // Information
    }
  }, [formData])

  const handleInputChange = (field: keyof PatientFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
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

  const validateForm = (): boolean => {
    const newErrors: PatientFormErrors = {}

    if (!formData.nom.trim()) newErrors.nom = 'Last name is required'
    if (!formData.prenom.trim()) newErrors.prenom = 'First name is required'
    if (!formData.dateNaissance) newErrors.dateNaissance = 'Date of birth is required'
    if (!formData.telephone.trim()) newErrors.telephone = 'Phone number is required'
    if (!formData.motDePasse.trim()) newErrors.motDePasse = 'Password is required'
    if (!formData.confirmerMotDePasse.trim()) newErrors.confirmerMotDePasse = 'Please confirm password'
    if (!formData.hopitalPrincipal) newErrors.hopitalPrincipal = 'Please select a hospital'
    if (!formData.accepteConditions) newErrors.accepteConditions = 'You must accept the terms'
    if (!formData.consentementDonnees) newErrors.consentementDonnees = 'Consent is required'

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Phone validation
    if (formData.telephone && !/^\+229\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format: +229 XX XX XX XX'
    }

    // Password validation
    if (formData.motDePasse && formData.motDePasse.length < 8) {
      newErrors.motDePasse = 'Password must contain at least 8 characters'
    }
    if (formData.motDePasse && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.motDePasse)) {
      newErrors.motDePasse = 'Password must contain at least one uppercase, one lowercase and one digit'
    }
    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      newErrors.confirmerMotDePasse = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Patient ID generation
      const patientId = `BJ${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

      // Upload files if present
      if (selectedFiles.length > 0) {
        setIsUploadingFiles(true)
        try {
          const uploadedFiles = await fileStorage.uploadFiles(
            selectedFiles,
            patientId,
            (progress) => setUploadProgress(progress)
          )
          console.log('Files uploaded:', uploadedFiles)
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError)
          // Continue even if upload fails
        } finally {
          setIsUploadingFiles(false)
        }
      }

      // Simulate API call to create patient
      await new Promise(resolve => setTimeout(resolve, 1000))

      setGeneratedPatientId(patientId)
      setIsRegistrationComplete(true)

    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hedera-50 to-medical-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-hedera-500" />
              <h1 className="text-2xl font-bold text-gray-800">
                HEDERA HEALTH ID
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-hedera-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </header>

        {/* Registration form or QR Code */}
        <div className="max-w-2xl mx-auto">
          {!isRegistrationComplete ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <FileText className="h-8 w-8 text-hedera-500" />
                <h2 className="text-3xl font-bold text-gray-800">
                  CREATE MY RECORD
                </h2>
              </div>

              {/* Progress bar */}
              <ProgressBar
                currentStep={currentStep}
                totalSteps={4}
                steps={steps}
                className="mb-6"
              />

              <div className="text-sm text-gray-600 mb-4">
                Progress: {Math.round(completionPercentage)}% completed
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal information */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Last Name"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  placeholder="KOSSOU"
                  error={errors.nom}
                  required
                />
                <Input
                  label="First Name"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  placeholder="Adjoa"
                  error={errors.prenom}
                  required
                />
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
                error={errors.dateNaissance}
                required
              />

              <Input
                label="Phone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="+229 97 XX XX XX"
                icon={<Phone className="h-4 w-4" />}
                error={errors.telephone}
                required
              />

              <Input
                label="Email (optional)"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder=""
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={formData.motDePasse}
                  onChange={(e) => handleInputChange('motDePasse', e.target.value)}
                  placeholder="Minimum 8 characters"
                  error={errors.motDePasse}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmerMotDePasse}
                  onChange={(e) => handleInputChange('confirmerMotDePasse', e.target.value)}
                  placeholder="Retype your password"
                  error={errors.confirmerMotDePasse}
                  required
                />
              </div>

              <Select
                label="Main Hospital"
                value={formData.hopitalPrincipal}
                onChange={(e) => handleInputChange('hopitalPrincipal', e.target.value)}
                options={hopitauxOptions}
                placeholder="CHU-MEL - Cotonou"
                error={errors.hopitalPrincipal}
                required
              />

              {/* File upload */}
              <FileUpload
                label="Import old records (optional)"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={true}
                onFileSelect={handleFileSelect}
                selectedFiles={selectedFiles}
                onFileRemove={handleFileRemove}
              />

              {/* Upload progress indicator */}
              {isUploadingFiles && uploadProgress.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Upload in progress...</p>
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

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="conditions"
                    checked={formData.accepteConditions}
                    onChange={(e) => handleInputChange('accepteConditions', e.target.checked)}
                    className="mt-1 h-4 w-4 text-hedera-500 focus:ring-hedera-500 border-gray-300 rounded"
                  />
                  <label htmlFor="conditions" className="text-sm text-gray-700">
                    I accept the terms of use
                  </label>
                </div>
                {errors.accepteConditions && (
                  <p className="text-sm text-red-600 ml-7">{errors.accepteConditions}</p>
                )}

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentement"
                    checked={formData.consentementDonnees}
                    onChange={(e) => handleInputChange('consentementDonnees', e.target.checked)}
                    className="mt-1 h-4 w-4 text-hedera-500 focus:ring-hedera-500 border-gray-300 rounded"
                  />
                  <label htmlFor="consentement" className="text-sm text-gray-700">
                    I consent to the processing of my medical data
                  </label>
                </div>
                {errors.consentementDonnees && (
                  <p className="text-sm text-red-600 ml-7">{errors.consentementDonnees}</p>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'CREATING...' : 'CREATE MY RECORD'}
                </Button>
              </div>
            </form>
          </div>
          ) : (
            /* QR Code section after registration */
            <div className="space-y-6">
              {/* Success message */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <h2 className="text-3xl font-bold text-gray-800">
                    REGISTRATION SUCCESSFUL!
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Your digital health record has been successfully created.
                </p>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-semibold">
                    Patient ID: {generatedPatientId}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Keep this identifier safe
                  </p>
                </div>
              </div>

              {/* QR Code component */}
              <QRCodeGenerator
                patientData={{
                  patientId: generatedPatientId,
                  nom: formData.nom,
                  prenom: formData.prenom,
                  dateNaissance: formData.dateNaissance,
                  telephone: formData.telephone,
                  ville: 'Cotonou',
                  hopitalPrincipal: formData.hopitalPrincipal
                }}
              />

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/patient/dashboard" className="flex-1">
                    <Button variant="primary" className="w-full">
                      Access my Dashboard
                    </Button>
                  </Link>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
