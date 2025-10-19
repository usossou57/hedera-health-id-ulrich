import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Heart, AlertTriangle, Activity, FileText,
  Phone, Mail, MapPin, Stethoscope, Thermometer, Weight,
  Ruler, Eye, Edit, Plus, Download, CheckCircle, XCircle
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface PatientRecordData {
  id: string
  patientId: string
  nom: string
  prenom: string
  dateNaissance: string
  age: number
  telephone: string
  email?: string
  adresse?: string
  ville?: string
  groupeSanguin?: string
  allergies: string[]
  maladiesChroniques: string[]
  contactUrgence?: string
  hopitalPrincipal: string
}

interface ConsultationRecord {
  id: string
  consultationId: string
  date: string
  medecin: {
    nom: string
    prenom: string
    specialite: string
  }
  hopital: string
  type: string
  motif: string
  diagnostic?: string
  prescription?: string
  examensPrescrits: string[]
  donneesVitales: {
    poids?: number
    taille?: number
    tensionArterielle?: string
    temperature?: number
    pouls?: number
  }
  statut: 'programmee' | 'en_cours' | 'terminee' | 'annulee'
  notes?: string
}

interface AlerteMedicale {
  id: string
  type: 'allergie' | 'maladie_chronique' | 'urgence' | 'medicament'
  titre: string
  description: string
  severite: 'faible' | 'moyenne' | 'elevee' | 'critique'
  dateCreation: string
  isActive: boolean
}

export default function PatientRecord() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [patientData, setPatientData] = useState<PatientRecordData | null>(null)
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([])
  const [alertesMedicales, setAlertesMedicales] = useState<AlerteMedicale[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'alertes' | 'documents'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Retrieve patient data from navigation or ID
    const patientId = location.state?.patientId || location.state?.patientData?.patientId
    
    if (patientId) {
      loadPatientRecord(patientId)
    } else {
      navigate('/medecin/dashboard')
    }
  }, [location.state, navigate])

  const loadPatientRecord = async (_patientId: string) => {
    setIsLoading(true)
    try {
      // Simulate data - in production, call the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPatientData({
        id: '1',
        patientId: 'BJ2025001',
        nom: 'KOSSOU',
        prenom: 'Adjoa',
        dateNaissance: '1990-05-12',
        age: 34,
        telephone: '+229 97 XX XX XX',
        email: 'adjoa.kossou@email.com',
        adresse: 'Akpakpa District, Street 123',
        ville: 'Cotonou',
        groupeSanguin: 'A+',
        allergies: ['Penicillin', 'Peanuts'],
        maladiesChroniques: ['Hypertension'],
        contactUrgence: '+229 96 XX XX XX',
        hopitalPrincipal: 'CHU-MEL'
      })

      setConsultations([
        {
          id: '1',
          consultationId: 'CONS-2025-001',
          date: '2025-01-15T10:30:00',
          medecin: {
            nom: 'ADJAHOUI',
            prenom: 'Jean',
            specialite: 'Médecine Générale'
          },
          hopital: 'CHU-MEL',
          type: 'Consultation générale',
          motif: 'Contrôle de routine',
          diagnostic: 'État général satisfaisant',
          prescription: 'Paracétamol 500mg - 3x/jour si douleur',
          examensPrescrits: ['Prise de sang', 'ECG'],
          donneesVitales: {
            poids: 65,
            taille: 165,
            tensionArterielle: '120/80',
            temperature: 36.8,
            pouls: 72
          },
          statut: 'terminee',
          notes: 'Patient en bonne santé générale'
        },
        {
          id: '2',
          consultationId: 'CONS-2025-002',
          date: '2025-01-20T14:00:00',
          medecin: {
            nom: 'KOSSOU',
            prenom: 'Marie',
            specialite: 'Cardiologie'
          },
          hopital: 'CHU-MEL',
          type: 'Suivi cardiologique',
          motif: 'Suivi hypertension',
          statut: 'programmee',
          donneesVitales: {},
          examensPrescrits: []
        }
      ])

      setAlertesMedicales([
        {
          id: '1',
          type: 'allergie',
          titre: 'Penicillin Allergy',
          description: 'Severe allergic reaction to penicillin and derivatives',
          severite: 'elevee',
          dateCreation: '2024-03-15',
          isActive: true
        },
        {
          id: '2',
          type: 'maladie_chronique',
          titre: 'Arterial Hypertension',
          description: 'Hypertension diagnosed in 2023, under treatment',
          severite: 'moyenne',
          dateCreation: '2023-08-20',
          isActive: true
        }
      ])
    } catch (error) {
  console.error('Error loading patient record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeveriteColor = (severite: string) => {
    switch (severite) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-200'
      case 'elevee': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'faible': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'terminee': return 'bg-green-100 text-green-800'
      case 'en_cours': return 'bg-blue-100 text-blue-800'
      case 'programmee': return 'bg-yellow-100 text-yellow-800'
      case 'annulee': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient record...</p>
        </div>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-hedera-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Patient record not found</p>
          <Button onClick={() => navigate('/medecin/dashboard')} className="mt-4">
            Back to dashboard
          </Button>
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
              <User className="h-8 w-8 text-medical-500" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                  {patientData.prenom} {patientData.nom}
                </h1>
                <p className="text-sm text-gray-600">
                  ID: {patientData.patientId} • {calculateAge(patientData.dateNaissance)} ans
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/medecin/consultation/new', { 
                state: { patientData } 
              })}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Consultation</span>
            </Button>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
            </Button>
          </div>
        </header>

        {/* Alertes médicales importantes */}
        {alertesMedicales.filter(a => a.isActive && (a.severite === 'critique' || a.severite === 'elevee')).length > 0 && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-red-800">Alertes Médicales Importantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alertesMedicales
                  .filter(a => a.isActive && (a.severite === 'critique' || a.severite === 'elevee'))
                  .map((alerte) => (
                    <div key={alerte.id} className={`p-3 rounded-lg border ${getSeveriteColor(alerte.severite)}`}>
                      <p className="font-medium text-sm">{alerte.titre}</p>
                      <p className="text-xs mt-1">{alerte.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: "Overview", icon: User },
                { id: 'consultations', label: 'Consultations', icon: Stethoscope },
                { id: 'alertes', label: 'Medical Alerts', icon: AlertTriangle },
                { id: 'documents', label: 'Documents', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-medical-500 text-medical-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations personnelles */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                  {isEditing && (
                    <Button variant="primary" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={patientData.prenom} placeholder="First Name" />
                          <Input value={patientData.nom} placeholder="Last Name" />
                        </div>
                      ) : (
                        <p className="text-lg font-semibold">{patientData.prenom} {patientData.nom}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      {isEditing ? (
                        <Input type="date" value={patientData.dateNaissance} />
                      ) : (
                        <p className="text-lg">{formatDate(patientData.dateNaissance)} ({calculateAge(patientData.dateNaissance)} years)</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      {isEditing ? (
                        <Input value={patientData.telephone} icon={<Phone className="h-4 w-4" />} />
                      ) : (
                        <p className="text-lg flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{patientData.telephone}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      {isEditing ? (
                        <Input value={patientData.email || ''} icon={<Mail className="h-4 w-4" />} />
                      ) : (
                        <p className="text-lg flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{patientData.email || 'Non renseigné'}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      {isEditing ? (
                        <Input value={patientData.adresse || ''} icon={<MapPin className="h-4 w-4" />} />
                      ) : (
                        <p className="text-lg flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{patientData.adresse || 'Not provided'}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">City</label>
                      {isEditing ? (
                        <Input value={patientData.ville || ''} />
                      ) : (
                        <p className="text-lg">{patientData.ville || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                      {isEditing ? (
                        <Input value={patientData.contactUrgence || ''} icon={<Phone className="h-4 w-4" />} />
                      ) : (
                        <p className="text-lg flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{patientData.contactUrgence || 'Not provided'}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Main Hospital</label>
                      <p className="text-lg">{patientData.hopitalPrincipal}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations médicales */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>

                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-700">Blood Group</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{patientData.groupeSanguin || 'Not determined'}</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium text-yellow-700">Allergies</span>
                      </div>
                      {patientData.allergies.length > 0 ? (
                        <div className="space-y-1">
                          {patientData.allergies.map((allergie, index) => (
                            <span key={index} className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm mr-2">
                              {allergie}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-yellow-600">No known allergies</p>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-blue-700">Chronic Diseases</span>
                      </div>
                      {patientData.maladiesChroniques.length > 0 ? (
                        <div className="space-y-1">
                          {patientData.maladiesChroniques.map((maladie, index) => (
                            <span key={index} className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                              {maladie}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-600">No chronic diseases</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistiques rapides */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Summary</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total consultations</span>
                      <span className="font-bold text-2xl text-medical-600">{consultations.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last consultation</span>
                      <span className="font-medium text-sm">
                        {consultations.length > 0
                          ? new Date(consultations[0].date).toLocaleDateString('fr-FR')
                          : 'None'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active alerts</span>
                      <span className="font-bold text-2xl text-red-600">
                        {alertesMedicales.filter(a => a.isActive).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Historique des Consultations</h3>
                <Button
                  onClick={() => navigate('/medecin/consultation/new', { state: { patientData } })}
                  variant="primary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle consultation</span>
                </Button>
              </div>

              {consultations.length > 0 ? (
                <div className="space-y-6">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-medical-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{consultation.type}</h4>
                            <p className="text-sm text-gray-600">
                              Dr. {consultation.medecin.prenom} {consultation.medecin.nom} • {consultation.medecin.specialite}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(consultation.date)} • {consultation.hopital}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(consultation.statut)}`}>
                          {consultation.statut === 'terminee' ? 'Terminée' :
                           consultation.statut === 'en_cours' ? 'En cours' :
                           consultation.statut === 'programmee' ? 'Programmée' : 'Annulée'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Motif</label>
                            <p className="text-gray-800">{consultation.motif}</p>
                          </div>

                          {consultation.diagnostic && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Diagnostic</label>
                              <p className="text-gray-800">{consultation.diagnostic}</p>
                            </div>
                          )}

                          {consultation.prescription && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Prescription</label>
                              <p className="text-gray-800">{consultation.prescription}</p>
                            </div>
                          )}

                          {consultation.examensPrescrits.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Examens prescrits</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {consultation.examensPrescrits.map((examen, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {examen}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Données vitales</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              {consultation.donneesVitales.poids && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="flex items-center space-x-1">
                                    <Weight className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs text-gray-500">Poids</span>
                                  </div>
                                  <p className="font-medium">{consultation.donneesVitales.poids} kg</p>
                                </div>
                              )}

                              {consultation.donneesVitales.taille && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="flex items-center space-x-1">
                                    <Ruler className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs text-gray-500">Taille</span>
                                  </div>
                                  <p className="font-medium">{consultation.donneesVitales.taille} cm</p>
                                </div>
                              )}

                              {consultation.donneesVitales.tensionArterielle && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="flex items-center space-x-1">
                                    <Activity className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs text-gray-500">Tension</span>
                                  </div>
                                  <p className="font-medium">{consultation.donneesVitales.tensionArterielle}</p>
                                </div>
                              )}

                              {consultation.donneesVitales.temperature && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="flex items-center space-x-1">
                                    <Thermometer className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs text-gray-500">Température</span>
                                  </div>
                                  <p className="font-medium">{consultation.donneesVitales.temperature}°C</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {consultation.notes && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Notes</label>
                              <p className="text-gray-800 text-sm bg-gray-50 p-3 rounded">{consultation.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune consultation enregistrée</p>
                  <Button
                    onClick={() => navigate('/medecin/consultation/new', { state: { patientData } })}
                    variant="primary"
                    className="mt-4"
                  >
                    Créer la première consultation
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alertes' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Alertes Médicales</h3>
                <Button variant="primary" size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle alerte</span>
                </Button>
              </div>

              {alertesMedicales.length > 0 ? (
                <div className="space-y-4">
                  {alertesMedicales.map((alerte) => (
                    <div key={alerte.id} className={`p-4 rounded-lg border ${getSeveriteColor(alerte.severite)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 mt-0.5" />
                          <div>
                            <h4 className="font-semibold">{alerte.titre}</h4>
                            <p className="text-sm mt-1">{alerte.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs">
                              <span>Type: {alerte.type}</span>
                              <span>Créée le: {new Date(alerte.dateCreation).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alerte.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune alerte médicale</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Documents Médicaux</h3>
                <Button variant="primary" size="sm" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Ajouter document</span>
                </Button>
              </div>

              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun document disponible</p>
                <p className="text-sm text-gray-400 mt-2">
                  Les documents médicaux (analyses, radiographies, etc.) apparaîtront ici
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
