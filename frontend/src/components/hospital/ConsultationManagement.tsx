import { useState, useEffect } from 'react'
import { Search, Plus, Eye, Edit, Filter, Download, FileText, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useApi, isApiError } from '@/services/api'

interface Consultation {
  id: string
  consultationId?: string
  patientId?: string
  patientNom?: string
  patientPrenom?: string
  medecinNom?: string
  medecinPrenom?: string
  date?: string
  heure?: string
  dateConsultation?: string
  type: string
  statut: 'programmee' | 'en-cours' | 'terminee' | 'annulee' | 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
  hopital?: string
  motif?: string
  diagnostic?: string
  patient?: {
    patientId: string
    nom: string
    prenom: string
  }
  medecin?: {
    nom: string
    prenom: string
    specialite: string
  }
  hopitalData?: {
    nom: string
    code: string
  }
  createdAt?: string
}

export default function ConsultationManagement() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [error, setError] = useState('')

  const api = useApi()

  useEffect(() => {
    loadConsultations()
  }, [])

  useEffect(() => {
    // Filtrer les consultations selon le terme de recherche et le statut
    if (!Array.isArray(consultations)) {
      setFilteredConsultations([])
      return
    }

    let filtered = consultations.filter(consultation =>
      consultation.patientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patientPrenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.medecinNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.medecinPrenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(consultation => consultation.statut === selectedStatus)
    }

    setFilteredConsultations(filtered)
  }, [consultations, searchTerm, selectedStatus])

  const loadConsultations = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Récupérer les vraies données depuis l'API
      const response = await api.getConsultations()

      if (isApiError(response)) {
        throw new Error(response.error || 'Erreur lors du chargement des consultations')
      }

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Transformer les données de l'API pour correspondre à l'interface
        const transformedConsultations: Consultation[] = response.data.map((item: any) => ({
          id: item.id,
          consultationId: item.consultationId,
          patientId: item.patient?.patientId,
          patientNom: item.patient?.nom,
          patientPrenom: item.patient?.prenom,
          medecinNom: item.medecin?.nom,
          medecinPrenom: item.medecin?.prenom,
          date: item.dateConsultation ? new Date(item.dateConsultation).toISOString().split('T')[0] : '',
          heure: item.dateConsultation ? new Date(item.dateConsultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
          dateConsultation: item.dateConsultation,
          type: item.type,
          statut: item.statut?.toLowerCase() || 'programmee',
          hopital: item.hopital?.nom,
          motif: item.motif,
          diagnostic: item.diagnostic,
          patient: item.patient,
          medecin: item.medecin,
          hopitalData: item.hopital,
          createdAt: item.createdAt
        }))
        setConsultations(transformedConsultations)
      } else {
        // Fallback vers des données fictives si l'API ne retourne rien
        const mockConsultations: Consultation[] = [
          {
            id: '1',
            patientId: 'BJ2025001',
            patientNom: 'KOSSOU',
            patientPrenom: 'Adjoa',
            medecinNom: 'ADJAHOUI',
            medecinPrenom: 'Dr. Jean',
            date: '2025-01-10',
            heure: '14:30',
            type: 'Consultation générale',
            statut: 'terminee',
            hopital: 'CHU-MEL',
            motif: 'Contrôle de routine',
            diagnostic: 'État général satisfaisant'
          },
          {
            id: '2',
            patientId: 'BJ2025002',
            patientNom: 'DOSSOU',
            patientPrenom: 'Marie',
            medecinNom: 'KOSSOU',
            medecinPrenom: 'Dr. Marie',
            date: '2025-01-11',
            heure: '10:00',
            type: 'Cardiologie',
            statut: 'programmee',
            hopital: 'CHU-MEL',
            motif: 'Suivi cardiologique'
          },
          {
            id: '3',
            patientId: 'BJ2025003',
            patientNom: 'HOUNKPATIN',
            patientPrenom: 'Jean',
            medecinNom: 'SOGLO',
            medecinPrenom: 'Dr. Paul',
            date: '2025-01-11',
            heure: '15:45',
            type: 'Urgences',
            statut: 'en-cours',
            hopital: 'CNHU',
            motif: 'Douleurs abdominales'
          },
          {
            id: '4',
            patientId: 'BJ2025001',
            patientNom: 'KOSSOU',
            patientPrenom: 'Adjoa',
            medecinNom: 'TOMEY',
            medecinPrenom: 'Dr. Sylvie',
            date: '2025-01-12',
            heure: '09:15',
            type: 'Pédiatrie',
            statut: 'annulee',
            hopital: 'Clinique Pasteur',
            motif: 'Consultation annulée par le patient'
          }
        ]
        setConsultations(mockConsultations)
        console.log('Utilisation des données fictives - API vide')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error)
      setError('Impossible de charger la liste des consultations')
      setConsultations([]) // Vider la liste en cas d'erreur
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'programmee': return 'text-blue-600 bg-blue-50'
      case 'en-cours': return 'text-yellow-600 bg-yellow-50'
      case 'terminee': return 'text-green-600 bg-green-50'
      case 'annulee': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'programmee': return <Calendar className="h-4 w-4" />
      case 'en-cours': return <Clock className="h-4 w-4" />
      case 'terminee': return <CheckCircle className="h-4 w-4" />
      case 'annulee': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'programmee': return 'Programmée'
      case 'en-cours': return 'En cours'
      case 'terminee': return 'Terminée'
      case 'annulee': return 'Annulée'
      default: return statut
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hedera-500"></div>
          <span className="ml-2 text-gray-600">Chargement des consultations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Affichage d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadConsultations}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <FileText className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">Gestion des Consultations</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {Array.isArray(consultations) ? consultations.length : 0} consultations
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {Array.isArray(consultations) ? consultations.filter(c => c.statut === 'TERMINEE').length : 0} terminées
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              {Array.isArray(consultations) ? consultations.filter(c => c.statut === 'PROGRAMMEE').length : 0} programmées
            </span>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par patient, médecin, ID ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hedera-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="programmee">Programmées</option>
              <option value="en-cours">En cours</option>
              <option value="terminee">Terminées</option>
              <option value="annulee">Annulées</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hôpital
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {consultation.patientPrenom} {consultation.patientNom}
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate">{consultation.patientId}</div>
                      <div className="text-xs text-gray-500 sm:hidden truncate">
                        {consultation.medecinPrenom} {consultation.medecinNom}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {consultation.medecinPrenom} {consultation.medecinNom}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {consultation.date ? new Date(consultation.date).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">{consultation.heure || 'N/A'}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultation.type}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consultation.statut)}`}>
                      {getStatusIcon(consultation.statut)}
                      <span className="ml-1 hidden sm:inline">{getStatusLabel(consultation.statut)}</span>
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {consultation.hopital}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredConsultations.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Aucune consultation trouvée pour ces critères' 
                : 'Aucune consultation enregistrée'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
