import { useState, useEffect } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Filter, Download, UserCheck, Stethoscope } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useApi, isApiError } from '@/services/api'

interface Medecin {
  id: string
  medecinId?: string
  nom: string
  prenom: string
  email: string
  specialite: string
  telephone: string
  service?: string
  hopital?: {
    nom: string
    code: string
  }
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export default function MedecinManagement() {
  const [medecins, setMedecins] = useState<Medecin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMedecins, setFilteredMedecins] = useState<Medecin[]>([])
  const [error, setError] = useState('')

  const api = useApi()

  useEffect(() => {
    loadMedecins()
  }, [])

  useEffect(() => {
    // Filtrer les médecins selon le terme de recherche
    if (!Array.isArray(medecins)) {
      setFilteredMedecins([])
      return
    }

    const filtered = medecins.filter(medecin =>
      medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMedecins(filtered)
  }, [medecins, searchTerm])

  const loadMedecins = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Récupérer les vraies données depuis l'API
      const response = await api.getMedecins()

      if (isApiError(response)) {
        throw new Error(response.error || 'Erreur lors du chargement des médecins')
      }

      if (response.success && response.data && Array.isArray(response.data)) {
        setMedecins(response.data)
      } else {
        // Fallback vers des données fictives si l'API ne retourne rien
        const mockMedecins: Medecin[] = [
          {
            id: '1',
            nom: 'ADJAHOUI',
            prenom: 'Dr. Jean',
            email: 'j.adjahoui@chu-mel.bj',
            specialite: 'Médecine Générale',
            telephone: '+229 21 XX XX XX',
            hopital: { nom: 'CHU-MEL', code: 'chu-mel' },
            isActive: true,
            createdAt: '2024-01-15T08:00:00Z',
            lastLogin: '2025-01-10T14:30:00Z'
          },
          {
            id: '2',
            nom: 'KOSSOU',
            prenom: 'Dr. Marie',
            email: 'm.kossou@chu-mel.bj',
            specialite: 'Cardiologie',
            telephone: '+229 21 XX XX XX',
            hopital: { nom: 'CHU-MEL', code: 'chu-mel' },
            isActive: true,
            createdAt: '2024-06-10T10:00:00Z',
            lastLogin: '2025-01-09T16:45:00Z'
          },
          {
            id: '3',
            nom: 'SOGLO',
            prenom: 'Dr. Paul',
            email: 'p.soglo@cnhu.bj',
            specialite: 'Urgences',
            telephone: '+229 21 XX XX XX',
            hopital: { nom: 'CNHU', code: 'cnhu' },
            isActive: true,
            createdAt: '2024-03-20T12:00:00Z',
            lastLogin: '2025-01-08T09:20:00Z'
          },
          {
            id: '4',
            nom: 'TOMEY',
            prenom: 'Dr. Sylvie',
            email: 's.tomey@pasteur.bj',
            specialite: 'Pédiatrie',
            telephone: '+229 21 XX XX XX',
            hopital: { nom: 'Clinique Pasteur', code: 'pasteur' },
            isActive: false,
            createdAt: '2024-08-15T14:00:00Z'
          }
        ]
        setMedecins(mockMedecins)
        console.log('Utilisation des données fictives - API vide')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error)
      setError('Impossible de charger la liste des médecins')
      setMedecins([]) // Vider la liste en cas d'erreur
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  const getLastLoginText = (lastLogin?: string) => {
    if (!lastLogin) return 'Jamais connecté'
    
    const date = new Date(lastLogin)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'En ligne'
    if (diffInHours < 24) return `Il y a ${Math.floor(diffInHours)}h`
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`
    return date.toLocaleDateString('fr-FR')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hedera-500"></div>
          <span className="ml-2 text-gray-600">Chargement des médecins...</span>
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
            onClick={loadMedecins}
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
            <Stethoscope className="h-6 w-6 text-medical-500" />
            <h3 className="text-xl font-semibold text-gray-800">Gestion des Médecins</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="bg-medical-100 text-medical-800 px-2 py-1 rounded-full">
              {Array.isArray(medecins) ? medecins.length : 0} médecins
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {Array.isArray(medecins) ? medecins.filter(m => m.isActive).length : 0} actifs
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {Array.isArray(medecins) ? medecins.filter(m => m.lastLogin && new Date(m.lastLogin).getTime() > Date.now() - 24*60*60*1000).length : 0} connectés 24h
            </span>
          </div>
        </div>

        {/* Barre de recherche et actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, email ou spécialité..."
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
              Nouveau médecin
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des médecins */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médecin
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialité
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hôpital
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedecins.map((medecin) => (
                <tr key={medecin.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-medical-100 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-medical-600" />
                        </div>
                      </div>
                      <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {medecin.prenom} {medecin.nom}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate sm:hidden">
                          {medecin.specialite}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{medecin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{medecin.specialite}</span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medecin.telephone}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {medecin.hopital?.nom || 'N/A'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(medecin.isActive)}`}>
                      {medecin.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getLastLoginText(medecin.lastLogin)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

        {filteredMedecins.length === 0 && (
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun médecin trouvé pour cette recherche' : 'Aucun médecin enregistré'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
