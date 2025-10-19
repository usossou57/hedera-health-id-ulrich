import { User, Eye, Download, Share2, Heart, AlertCircle, CheckCircle, Activity, Calendar } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PatientData, Consultation, MedecinAutorise } from '@/types/patient'

interface PatientOverviewProps {
  patientData: PatientData | null
  consultations: Consultation[]
  medecinsAutorises: MedecinAutorise[]
}

export default function PatientOverview({ patientData, consultations, medecinsAutorises }: PatientOverviewProps) {
  if (!patientData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading patient data...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Patient Identity Card */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <User className="h-5 w-5 text-hedera-500" />
            <span>My Health Record</span>
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Patient ID</label>
            <p className="text-lg font-mono font-bold text-hedera-600">{patientData.patientId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <p className="text-lg font-semibold text-gray-900">{patientData.prenom} {patientData.nom}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Date of Birth</label>
            <p className="text-lg text-gray-900">{new Date(patientData.dateNaissance).toLocaleDateString('en-US')}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Main Hospital</label>
            <p className="text-lg text-gray-900">{patientData.hopitalPrincipal === 'chu-mel' ? 'CHU-MEL' : patientData.hopitalPrincipal}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Medical Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Blood Type</span>
              </div>
              <p className="text-lg font-bold text-red-600">A+</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">Allergies</span>
              </div>
              <p className="text-sm text-yellow-600">Penicillin</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Status</span>
              </div>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-hedera-500" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Consultations</span>
              <span className="font-bold text-2xl text-hedera-600">{consultations.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authorized Doctors</span>
              <span className="font-bold text-2xl text-medical-600">{medecinsAutorises.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Visit</span>
              <span className="text-sm font-medium">2 Jan 2025</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-hedera-500" />
            <span>Upcoming Appointments</span>
          </h3>
          <div className="space-y-3">
            {consultations
              .filter(c => c.statut === 'programmee')
              .slice(0, 2)
              .map((consultation) => (
                <div key={consultation.id} className="border-l-4 border-blue-500 pl-3">
                  <p className="font-medium text-sm text-gray-900">{consultation.medecin}</p>
                  <p className="text-xs text-gray-600">{consultation.type}</p>
                  <p className="text-xs text-blue-600">{new Date(consultation.date).toLocaleDateString('en-US')}</p>
                </div>
              ))}
            {consultations.filter(c => c.statut === 'programmee').length === 0 && (
              <p className="text-sm text-gray-600">No scheduled appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
