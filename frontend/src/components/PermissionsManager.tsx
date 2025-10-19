import { useState } from 'react'
import { Shield, Plus, Search, CheckCircle, AlertCircle, Clock, X, Eye } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface MedecinAutorise {
  id: string
  nom: string
  prenom: string
  specialite: string
  hopital: string
  dateAutorisation: string
  statut: 'actif' | 'suspendu' | 'en_attente'
  permissions: string[]
  derniereActivite?: string
}

interface HistoriqueAcces {
  id: string
  medecinId: string
  medecinNom: string
  action: 'consultation' | 'modification' | 'acces_dossier'
  date: string
  details: string
}

interface PermissionsManagerProps {
  patientId: string
  className?: string
}

const hopitauxOptions = [
  { value: 'chu-mel', label: 'CHU-MEL - Cotonou' },
  { value: 'cnhu', label: 'CNHU - Cotonou' },
  { value: 'pasteur', label: 'Clinique Louis Pasteur' },
  { value: 'akpakpa', label: 'Centre de Santé Akpakpa' },
]

const specialitesOptions = [
  { value: 'medecine-generale', label: 'Médecine Générale' },
  { value: 'cardiologie', label: 'Cardiologie' },
  { value: 'pediatrie', label: 'Pédiatrie' },
  { value: 'gynecologie', label: 'Gynécologie' },
  { value: 'urgences', label: 'Urgences' },
  { value: 'chirurgie', label: 'Chirurgie' },
]

export default function PermissionsManager({ className }: PermissionsManagerProps) {
  const [medecinsAutorises, setMedecinsAutorises] = useState<MedecinAutorise[]>([
    {
      id: '1',
      nom: 'ADJAHOUI',
      prenom: 'Dr. Jean',
      specialite: 'Médecine Générale',
      hopital: 'CHU-MEL',
      dateAutorisation: '2024-01-15',
      statut: 'actif',
      permissions: ['consultation', 'prescription', 'modification_dossier'],
      derniereActivite: '2025-01-02'
    },
    {
      id: '2',
      nom: 'KOSSOU',
      prenom: 'Dr. Marie',
      specialite: 'Cardiologie',
      hopital: 'CHU-MEL',
      dateAutorisation: '2024-06-10',
      statut: 'actif',
      permissions: ['consultation', 'prescription'],
      derniereActivite: '2024-12-15'
    },
    {
      id: '3',
      nom: 'SOGLO',
      prenom: 'Dr. Paul',
      specialite: 'Urgences',
      hopital: 'CNHU',
      dateAutorisation: '2024-12-20',
      statut: 'en_attente',
      permissions: ['consultation'],
    }
  ])

  const [historiqueAcces] = useState<HistoriqueAcces[]>([
    {
      id: '1',
      medecinId: '1',
      medecinNom: 'Dr. Jean ADJAHOUI',
      action: 'consultation',
      date: '2025-01-02',
      details: 'Consultation de routine - Contrôle général'
    },
    {
      id: '2',
      medecinId: '2',
      medecinNom: 'Dr. Marie KOSSOU',
      action: 'acces_dossier',
      date: '2024-12-15',
      details: 'Consultation du dossier cardiologique'
    },
    {
      id: '3',
      medecinId: '3',
      medecinNom: 'Dr. Paul SOGLO',
      action: 'consultation',
      date: '2024-12-20',
      details: 'Consultation aux urgences - Infection respiratoire'
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'medecins' | 'historique'>('medecins')

  const [newMedecin, setNewMedecin] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    hopital: '',
    permissions: [] as string[]
  })

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'text-green-600 bg-green-50'
      case 'suspendu': return 'text-red-600 bg-red-50'
      case 'en_attente': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'actif': return <CheckCircle className="h-4 w-4" />
      case 'suspendu': return <AlertCircle className="h-4 w-4" />
      case 'en_attente': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'consultation': return <Eye className="h-4 w-4 text-blue-500" />
      case 'modification': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'acces_dossier': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Eye className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredMedecins = medecinsAutorises.filter(medecin => {
    const matchesSearch = searchTerm === '' || 
      medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatut = filterStatut === '' || medecin.statut === filterStatut
    
    return matchesSearch && matchesStatut
  })

  const handleAutoriserMedecin = () => {
    // Simulation d'ajout d'un nouveau médecin
    const nouveauMedecin: MedecinAutorise = {
      id: Date.now().toString(),
      ...newMedecin,
      dateAutorisation: new Date().toISOString().split('T')[0],
      statut: 'en_attente'
    }
    
    setMedecinsAutorises([...medecinsAutorises, nouveauMedecin])
    setNewMedecin({
      nom: '',
      prenom: '',
      email: '',
      specialite: '',
      hopital: '',
      permissions: []
    })
    setShowAddForm(false)
  }

  const handleRevoquerAcces = (medecinId: string) => {
    setMedecinsAutorises(medecinsAutorises.map(medecin => 
      medecin.id === medecinId 
        ? { ...medecin, statut: 'suspendu' as const }
        : medecin
    ))
  }

  const handleApprouverAcces = (medecinId: string) => {
    setMedecinsAutorises(medecinsAutorises.map(medecin => 
      medecin.id === medecinId 
        ? { ...medecin, statut: 'actif' as const }
        : medecin
    ))
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-hedera-500" />
          <span>Gestion des permissions</span>
        </h2>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Autoriser un médecin
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'medecins', label: 'Médecins autorisés' },
              { id: 'historique', label: 'Historique d\'accès' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-hedera-500 text-hedera-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'medecins' && (
        <>
          {/* Filtres */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Rechercher un médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <Select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'actif', label: 'Actif' },
                { value: 'en_attente', label: 'En attente' },
                { value: 'suspendu', label: 'Suspendu' }
              ]}
              placeholder="Filtrer par statut"
            />
            <div className="text-sm text-gray-500 flex items-center">
              {filteredMedecins.length} médecin(s) trouvé(s)
            </div>
          </div>

          {/* Liste des médecins */}
          <div className="space-y-4">
            {filteredMedecins.map((medecin) => (
              <div key={medecin.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{medecin.prenom} {medecin.nom}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(medecin.statut)}`}>
                        {getStatutIcon(medecin.statut)}
                        <span className="ml-1 capitalize">{medecin.statut.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{medecin.specialite} - {medecin.hopital}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Autorisé depuis le {new Date(medecin.dateAutorisation).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {medecin.permissions.map((permission) => (
                        <span key={permission} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                    {medecin.derniereActivite && (
                      <p className="text-xs text-gray-400 mt-1">
                        Dernière activité: {new Date(medecin.derniereActivite).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {medecin.statut === 'en_attente' && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleApprouverAcces(medecin.id)}
                      >
                        Approuver
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    {medecin.statut === 'actif' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRevoquerAcces(medecin.id)}
                      >
                        Révoquer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'historique' && (
        <div className="space-y-4">
          {historiqueAcces.map((acces) => (
            <div key={acces.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {getActionIcon(acces.action)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{acces.medecinNom}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(acces.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{acces.action.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-500 mt-1">{acces.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout de médecin */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Autoriser un nouveau médecin</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Nom"
                value={newMedecin.nom}
                onChange={(e) => setNewMedecin({...newMedecin, nom: e.target.value})}
                placeholder="ADJAHOUI"
                required
              />
              <Input
                label="Prénom"
                value={newMedecin.prenom}
                onChange={(e) => setNewMedecin({...newMedecin, prenom: e.target.value})}
                placeholder="Dr. Jean"
                required
              />
              <Input
                label="Email professionnel"
                type="email"
                value={newMedecin.email}
                onChange={(e) => setNewMedecin({...newMedecin, email: e.target.value})}
                placeholder="dr.adjahoui@chu-mel.bj"
                required
              />
              <Select
                label="Spécialité"
                value={newMedecin.specialite}
                onChange={(e) => setNewMedecin({...newMedecin, specialite: e.target.value})}
                options={specialitesOptions}
                placeholder="Médecine Générale"
                required
              />
              <Select
                label="Hôpital"
                value={newMedecin.hopital}
                onChange={(e) => setNewMedecin({...newMedecin, hopital: e.target.value})}
                options={hopitauxOptions}
                placeholder="CHU-MEL - Cotonou"
                required
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddForm(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleAutoriserMedecin}
                disabled={!newMedecin.nom || !newMedecin.prenom || !newMedecin.email}
              >
                Autoriser
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
