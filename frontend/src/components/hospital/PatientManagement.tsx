import { useState, useEffect } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Filter, Download, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useApi, isApiError } from '@/services/api'

interface Patient {
  id: string
  patientId: string
  nom: string
  prenom: string
  telephone: string
  ville?: string
  hopitalPrincipal?: string
  isActive: boolean
  createdAt: string
}

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  
  const api = useApi()

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    // Filtrer les patients selon le terme de recherche
    const filtered = patients.filter(patient =>
      patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telephone.includes(searchTerm)
    )
    setFilteredPatients(filtered)
  }, [patients, searchTerm])

  const loadPatients = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await api.getPatients()
      
      if (isApiError(response)) {
        throw new Error(response.error || 'Erreur lors du chargement des patients')
      }

      if (response.data?.data) {
        setPatients(response.data.data)
      } else {
        // Données fictives si l'API ne retourne pas de données
        const mockPatients: Patient[] = [
          {
            id: '1',
            patientId: 'BJ2025001',
            nom: 'KOSSOU',
            prenom: 'Adjoa',
            telephone: '+229 97 XX XX XX',
            ville: 'Cotonou',
            hopitalPrincipal: 'CHU-MEL',
            isActive: true,
            createdAt: '2025-01-01T10:00:00Z'
          },
          {
            id: '2',
            patientId: 'BJ2025002',
            nom: 'DOSSOU',
            prenom: 'Marie',
            telephone: '+229 96 XX XX XX',
            ville: 'Porto-Novo',
            hopitalPrincipal: 'CNHU',
            isActive: true,
            createdAt: '2025-01-02T14:30:00Z'
          },
          {
            id: '3',
            patientId: 'BJ2025003',
            nom: 'HOUNKPATIN',
            prenom: 'Jean',
            telephone: '+229 95 XX XX XX',
            ville: 'Parakou',
            hopitalPrincipal: 'CHU-MEL',
            isActive: true,
            createdAt: '2025-01-03T09:15:00Z'
          }
        ]
        setPatients(mockPatients)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hedera-500"></div>
          <span className="ml-2 text-gray-600">Chargement des patients...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadPatients}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Users className="h-6 w-6 text-hedera-500" />
            <h3 className="text-xl font-semibold text-gray-800">Gestion des Patients</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-hedera-100 text-hedera-800 px-2 py-1 rounded-full">
              {patients.length} patients
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {patients.filter(p => p.isActive).length} actifs
            </span>
          </div>
        </div>

        {/* Barre de recherche et actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, prénom, ID ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex space-x-2">
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
              Nouveau patient
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des patients */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hôpital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {patient.prenom} {patient.nom}
                      </div>
                      <div className="text-sm text-gray-500">{patient.ville}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-hedera-600">
                      {patient.patientId}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.telephone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.hopitalPrincipal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.isActive)}`}>
                      {patient.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun patient trouvé pour cette recherche' : 'Aucun patient enregistré'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
