import { Shield, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { MedecinAutorise } from '@/types/patient'

interface PatientPermissionsProps {
  medecinsAutorises: MedecinAutorise[]
}

export default function PatientPermissions({ medecinsAutorises }: PatientPermissionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-hedera-500" />
          <span>Permission Management</span>
        </h2>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Authorize a doctor
        </Button>
      </div>

      <div className="space-y-4">
        {medecinsAutorises.map((medecin) => (
          <div key={medecin.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-800">{medecin.prenom} {medecin.nom}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    medecin.statut === 'actif' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {medecin.statut === 'actif' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                    {medecin.statut === 'actif' ? 'Active' : 'Revoked'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{medecin.specialite} - {medecin.hopital}</p>
                <p className="text-sm text-gray-500">Authorized since {new Date(medecin.dateAutorisation).toLocaleDateString('en-US')}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
