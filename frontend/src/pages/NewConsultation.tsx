import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Stethoscope, FileText, Plus,
  Save, Send, AlertTriangle, CheckCircle, Weight, Ruler, Activity,
  Thermometer, Heart, Pill, Search, X
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { getMedecinData } from '@/utils/storage'
import { useApi } from '@/services/api'


interface PatientData {
  id: string
  patientId: string
  nom: string
  prenom: string
  dateNaissance: string
  age: number
  groupeSanguin?: string
  allergies: string[]
  maladiesChroniques: string[]
  hopitalPrincipal: string
}

interface MedecinData {
  id: string
  medecinId: string
  nom: string
  prenom: string
  specialite: string
  service: string
  hopital: {
    nom: string
    code: string
  }
}

interface ConsultationFormData {
  type: string
  motif: string
  diagnostic: string
  prescription: string
  examensPrescrits: string[]
  donneesVitales: {
    poids: string
    taille: string
    tensionArterielle: string
    temperature: string
    pouls: string
  }
  notes: string
  statut: 'programmee' | 'en_cours' | 'terminee'
}

interface Medicament {
  nom: string
  dosage: string
  frequence: string
  duree: string
}

const typesConsultation = [
  { value: 'consultation_generale', label: 'General consultation' },
  { value: 'urgence', label: 'Emergency' },
  { value: 'suivi', label: 'Medical follow-up' },
  { value: 'suivi_cardiologique', label: 'Cardiology follow-up' },
  { value: 'suivi_diabetique', label: 'Diabetes follow-up' },
  { value: 'pediatrie', label: 'Pediatrics' },
  { value: 'gynecologie', label: 'Gynecology' },
  { value: 'dermatologie', label: 'Dermatology' },
  { value: 'ophtalmologie', label: 'Ophthalmology' },
  { value: 'oto_rhino_laryngologie', label: 'ENT' }
]

const examensCommuns = [
  'Blood test',
  'ECG',
  'Chest X-ray',
  'Abdominal ultrasound',
  'CT scan',
  'MRI',
  'Echocardiography',
  'Blood sugar test',
  'Urine analysis',
  'Biopsy'
]

const medicamentsCommuns = [
  { nom: 'Paracetamol', dosages: ['500mg', '1000mg'] },
  { nom: 'Ibuprofen', dosages: ['200mg', '400mg', '600mg'] },
  { nom: 'Amoxicillin', dosages: ['250mg', '500mg', '1000mg'] },
  { nom: 'Amlodipine', dosages: ['5mg', '10mg'] },
  { nom: 'Metformin', dosages: ['500mg', '850mg', '1000mg'] },
  { nom: 'Aspirin', dosages: ['75mg', '100mg', '300mg'] },
  { nom: 'Omeprazole', dosages: ['20mg', '40mg'] },
  { nom: 'Atorvastatin', dosages: ['10mg', '20mg', '40mg'] }
]

export default function NewConsultation() {
  const location = useLocation()
  const navigate = useNavigate()
  const api = useApi()
  
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [medecinData, setMedecinData] = useState<MedecinData | null>(null)
  const [formData, setFormData] = useState<ConsultationFormData>({
    type: '',
    motif: '',
    diagnostic: '',
    prescription: '',
    examensPrescrits: [],
    donneesVitales: {
      poids: '',
      taille: '',
      tensionArterielle: '',
      temperature: '',
      pouls: ''
    },
    notes: '',
    statut: 'en_cours'
  })
  const [medicaments, setMedicaments] = useState<Medicament[]>([])
  const [nouvelExamen, setNouvelExamen] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMedicamentForm, setShowMedicamentForm] = useState(false)
  const [currentMedicament, setCurrentMedicament] = useState<Medicament>({
    nom: '',
    dosage: '',
    frequence: '',
    duree: ''
  })

  useEffect(() => {
    // Récupérer les données du patient et du médecin
    const patientFromState = location.state?.patientData

    // Récupération sécurisée des données médecin
    let medecinFromState = location.state?.medecinData
    if (!medecinFromState) {
      medecinFromState = getMedecinData()
    }

    if (patientFromState) {
      setPatientData(patientFromState)
    } else {
      // Créer un patient fictif pour les tests
      setPatientData({
        id: 'patient-test-001',
        patientId: 'PAT-001',
        nom: 'PATIENT',
        prenom: 'Test',
        dateNaissance: '1990-01-01',
        age: 34,
        allergies: [],
        maladiesChroniques: [],
        hopitalPrincipal: 'CHU-MEL'
      })
    }

    if (medecinFromState && medecinFromState.id) {
      setMedecinData(medecinFromState)
    } else {
      navigate('/medecin/login')
    }
  }, [location.state, navigate])

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('donneesVitales.')) {
      const vitalField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        donneesVitales: {
          ...prev.donneesVitales,
          [vitalField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const ajouterExamen = () => {
    if (nouvelExamen.trim() && !formData.examensPrescrits.includes(nouvelExamen.trim())) {
      setFormData(prev => ({
        ...prev,
        examensPrescrits: [...prev.examensPrescrits, nouvelExamen.trim()]
      }))
      setNouvelExamen('')
    }
  }

  const retirerExamen = (examen: string) => {
    setFormData(prev => ({
      ...prev,
      examensPrescrits: prev.examensPrescrits.filter(e => e !== examen)
    }))
  }

  const ajouterMedicament = () => {
    if (currentMedicament.nom && currentMedicament.dosage && currentMedicament.frequence) {
      setMedicaments(prev => [...prev, { ...currentMedicament }])
      setCurrentMedicament({ nom: '', dosage: '', frequence: '', duree: '' })
      setShowMedicamentForm(false)
      
      // Mettre à jour la prescription
      const prescriptionText = [...medicaments, currentMedicament]
        .map(med => `${med.nom} ${med.dosage} - ${med.frequence}${med.duree ? ` pendant ${med.duree}` : ''}`)
        .join('\n')
      setFormData(prev => ({ ...prev, prescription: prescriptionText }))
    }
  }

  const retirerMedicament = (index: number) => {
    const nouveauxMedicaments = medicaments.filter((_, i) => i !== index)
    setMedicaments(nouveauxMedicaments)
    
    // Mettre à jour la prescription
    const prescriptionText = nouveauxMedicaments
      .map(med => `${med.nom} ${med.dosage} - ${med.frequence}${med.duree ? ` pendant ${med.duree}` : ''}`)
      .join('\n')
    setFormData(prev => ({ ...prev, prescription: prescriptionText }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) newErrors.type = 'Consultation type required'
    if (!formData.motif.trim()) newErrors.motif = 'Consultation reason required'
    if (!formData.diagnostic.trim()) newErrors.diagnostic = 'Diagnosis required'

    // Vital data validation (optional but correct format if provided)
    if (formData.donneesVitales.poids && isNaN(Number(formData.donneesVitales.poids))) {
      newErrors['donneesVitales.poids'] = 'Invalid weight'
    }
    if (formData.donneesVitales.taille && isNaN(Number(formData.donneesVitales.taille))) {
      newErrors['donneesVitales.taille'] = 'Invalid height'
    }
    if (formData.donneesVitales.temperature && isNaN(Number(formData.donneesVitales.temperature))) {
      newErrors['donneesVitales.temperature'] = 'Invalid temperature'
    }
    if (formData.donneesVitales.pouls && isNaN(Number(formData.donneesVitales.pouls))) {
      newErrors['donneesVitales.pouls'] = 'Invalid pulse'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (statut: 'en_cours' | 'terminee') => {
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Préparer les données de consultation pour l'API
      const consultationData = {
        patientId: patientData?.id,
        medecinId: medecinData?.id,
        hopitalId: medecinData?.hopital.code,
        type: formData.type,
        motif: formData.motif,
        diagnostic: formData.diagnostic,
        prescription: formData.prescription,
        examensPrescrits: formData.examensPrescrits,
        poids: formData.donneesVitales.poids,
        taille: formData.donneesVitales.taille,
        tensionArterielle: formData.donneesVitales.tensionArterielle,
        temperature: formData.donneesVitales.temperature,
        pouls: formData.donneesVitales.pouls,
        notes: formData.notes,
        statut: statut === 'terminee' ? 'TERMINEE' : 'EN_COURS'
      }

      console.log('🔄 Envoi consultation vers API:', consultationData)

      // Appel API réel
      const response = await api.createConsultation(consultationData)

      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la création de la consultation')
      }

      console.log('✅ Consultation créée avec succès:', response.data)

      // Redirection vers le dashboard médecin
      navigate('/medecin/dashboard', {
        state: {
          message: `Consultation ${statut === 'terminee' ? 'terminée' : 'sauvegardée'} avec succès`,
          consultationId: response.data?.consultationId
        }
      })
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      setErrors({ submit: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!patientData || !medecinData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Link to="/medecin/dashboard" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-8 w-8 text-medical-500" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  Nouvelle Consultation
                </h1>
                <p className="text-sm text-gray-600">
                  Patient: {patientData.prenom} {patientData.nom} ({patientData.patientId})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium text-gray-800">
                Dr. {medecinData.prenom} {medecinData.nom}
              </p>
              <p className="text-xs text-gray-600">
                {medecinData.specialite} • {medecinData.hopital.nom}
              </p>
            </div>
          </div>
        </header>

        {/* Alertes patient importantes */}
        {(patientData.allergies.length > 0 || patientData.maladiesChroniques.length > 0) && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-yellow-800">Informations Médicales Importantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientData.allergies.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-700 text-sm mb-1">Allergies:</p>
                    <div className="flex flex-wrap gap-1">
                      {patientData.allergies.map((allergie, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {allergie}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {patientData.maladiesChroniques.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-700 text-sm mb-1">Maladies chroniques:</p>
                    <div className="flex flex-wrap gap-1">
                      {patientData.maladiesChroniques.map((maladie, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {maladie}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de consultation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Informations consultation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-medical-500" />
                <span>Informations de Consultation</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de consultation *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 ${
                      errors.type ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner le type</option>
                    {typesConsultation.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date et heure
                  </label>
                  <Input
                    type="datetime-local"
                    value={new Date().toISOString().slice(0, 16)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de consultation *
                </label>
                <textarea
                  value={formData.motif}
                  onChange={(e) => handleInputChange('motif', e.target.value)}
                  placeholder="Décrivez le motif de la consultation..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 ${
                    errors.motif ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic *
                </label>
                <textarea
                  value={formData.diagnostic}
                  onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                  placeholder="Diagnostic médical..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 ${
                    errors.diagnostic ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.diagnostic && <p className="text-red-500 text-sm mt-1">{errors.diagnostic}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Notes complémentaires
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes additionnelles, observations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 text-gray-900 placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Données vitales */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-medical-500" />
                <span>Données Vitales</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Weight className="h-4 w-4 inline mr-1" />
                    Poids (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.donneesVitales.poids}
                    onChange={(e) => handleInputChange('donneesVitales.poids', e.target.value)}
                    placeholder="65.5"
                    error={errors['donneesVitales.poids']}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="h-4 w-4 inline mr-1" />
                    Taille (cm)
                  </label>
                  <Input
                    type="number"
                    value={formData.donneesVitales.taille}
                    onChange={(e) => handleInputChange('donneesVitales.taille', e.target.value)}
                    placeholder="170"
                    error={errors['donneesVitales.taille']}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="h-4 w-4 inline mr-1" />
                    Tension
                  </label>
                  <Input
                    value={formData.donneesVitales.tensionArterielle}
                    onChange={(e) => handleInputChange('donneesVitales.tensionArterielle', e.target.value)}
                    placeholder="120/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Thermometer className="h-4 w-4 inline mr-1" />
                    Température (°C)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.donneesVitales.temperature}
                    onChange={(e) => handleInputChange('donneesVitales.temperature', e.target.value)}
                    placeholder="36.8"
                    error={errors['donneesVitales.temperature']}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Pouls (bpm)
                  </label>
                  <Input
                    type="number"
                    value={formData.donneesVitales.pouls}
                    onChange={(e) => handleInputChange('donneesVitales.pouls', e.target.value)}
                    placeholder="72"
                    error={errors['donneesVitales.pouls']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale - Prescriptions et examens */}
          <div className="space-y-6">
            {/* Prescription */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-medical-500" />
                  <span>Prescription</span>
                </h3>
                <Button
                  onClick={() => setShowMedicamentForm(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </Button>
              </div>

              {/* Liste des médicaments */}
              {medicaments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {medicaments.map((medicament, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded-lg flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-blue-800">{medicament.nom} {medicament.dosage}</p>
                        <p className="text-sm text-blue-600">{medicament.frequence}</p>
                        {medicament.duree && (
                          <p className="text-xs text-blue-500">Durée: {medicament.duree}</p>
                        )}
                      </div>
                      <button
                        onClick={() => retirerMedicament(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulaire d'ajout de médicament */}
              {showMedicamentForm && (
                <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Médicament
                      </label>
                      <select
                        value={currentMedicament.nom}
                        onChange={(e) => setCurrentMedicament(prev => ({ ...prev, nom: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 text-gray-900"
                      >
                        <option value="">Sélectionner ou taper</option>
                        {medicamentsCommuns.map((med) => (
                          <option key={med.nom} value={med.nom}>{med.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <select
                          value={currentMedicament.dosage}
                          onChange={(e) => setCurrentMedicament(prev => ({ ...prev, dosage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                        >
                          <option value="">Dosage</option>
                          {currentMedicament.nom &&
                           medicamentsCommuns.find(m => m.nom === currentMedicament.nom)?.dosages.map((dosage) => (
                            <option key={dosage} value={dosage}>{dosage}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fréquence
                        </label>
                        <select
                          value={currentMedicament.frequence}
                          onChange={(e) => setCurrentMedicament(prev => ({ ...prev, frequence: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                        >
                          <option value="">Fréquence</option>
                          <option value="1x/jour">1x/jour</option>
                          <option value="2x/jour">2x/jour</option>
                          <option value="3x/jour">3x/jour</option>
                          <option value="4x/jour">4x/jour</option>
                          <option value="1x/semaine">1x/semaine</option>
                          <option value="Si besoin">Si besoin</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée (optionnel)
                      </label>
                      <select
                        value={currentMedicament.duree}
                        onChange={(e) => setCurrentMedicament(prev => ({ ...prev, duree: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                      >
                        <option value="">Durée</option>
                        <option value="3 jours">3 jours</option>
                        <option value="7 jours">7 jours</option>
                        <option value="14 jours">14 jours</option>
                        <option value="1 mois">1 mois</option>
                        <option value="3 mois">3 mois</option>
                        <option value="6 mois">6 mois</option>
                        <option value="Traitement continu">Traitement continu</option>
                      </select>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={ajouterMedicament}
                        variant="primary"
                        size="sm"
                        disabled={!currentMedicament.nom || !currentMedicament.dosage || !currentMedicament.frequence}
                      >
                        Ajouter
                      </Button>
                      <Button
                        onClick={() => {
                          setShowMedicamentForm(false)
                          setCurrentMedicament({ nom: '', dosage: '', frequence: '', duree: '' })
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Zone de texte libre pour prescription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription (texte libre)
                </label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) => handleInputChange('prescription', e.target.value)}
                  placeholder="Prescription détaillée..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500"
                />
              </div>
            </div>

            {/* Examens prescrits */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Search className="h-5 w-5 text-medical-500" />
                <span>Examens Prescrits</span>
              </h3>

              {/* Examens sélectionnés */}
              {formData.examensPrescrits.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.examensPrescrits.map((examen, index) => (
                    <div key={index} className="bg-green-50 p-2 rounded-lg flex items-center justify-between">
                      <span className="text-green-800 text-sm">{examen}</span>
                      <button
                        onClick={() => retirerExamen(examen)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Examens communs */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Examens courants:</p>
                <div className="grid grid-cols-1 gap-1">
                  {examensCommuns.map((examen) => (
                    <button
                      key={examen}
                      onClick={() => {
                        if (!formData.examensPrescrits.includes(examen)) {
                          setFormData(prev => ({
                            ...prev,
                            examensPrescrits: [...prev.examensPrescrits, examen]
                          }))
                        }
                      }}
                      disabled={formData.examensPrescrits.includes(examen)}
                      className={`text-left px-2 py-1 rounded text-sm transition-colors ${
                        formData.examensPrescrits.includes(examen)
                          ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          : 'hover:bg-blue-50 text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      + {examen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ajouter examen personnalisé */}
              <div className="flex space-x-2">
                <Input
                  value={nouvelExamen}
                  onChange={(e) => setNouvelExamen(e.target.value)}
                  placeholder="Autre examen..."
                  onKeyDown={(e) => e.key === 'Enter' && ajouterExamen()}
                />
                <Button
                  onClick={ajouterExamen}
                  variant="outline"
                  size="sm"
                  disabled={!nouvelExamen.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Messages d'erreur */}
            {errors.submit && (
              <div className="w-full sm:w-auto bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.submit}</span>
                </p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex space-x-4 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/medecin/dashboard')}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Annuler
              </Button>

              <Button
                onClick={() => handleSubmit('en_cours')}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Sauvegarder</span>
              </Button>

              <Button
                onClick={() => handleSubmit('terminee')}
                variant="primary"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Terminer consultation</span>
              </Button>
            </div>
          </div>

          {/* Informations blockchain */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Send className="h-4 w-4 text-hedera-500" />
              <span>
                Cette consultation sera automatiquement sauvegardée sur la blockchain Hedera
                pour garantir l'intégrité et la traçabilité des données médicales.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
