import { useState } from 'react'
import { FileText, Plus, Eye, Download, CheckCircle, Clock, AlertCircle, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Consultation } from '@/types/patient'

interface PatientConsultationsProps {
  consultations: Consultation[]
}

export default function PatientConsultations({ consultations }: PatientConsultationsProps) {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'terminee': return 'text-green-600 bg-green-50'
      case 'programmee': return 'text-blue-600 bg-blue-50'
      case 'annulee': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'terminee': return <CheckCircle className="h-4 w-4" />
      case 'programmee': return <Clock className="h-4 w-4" />
      case 'annulee': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const statusLabels: Record<string, string> = {
    terminee: 'Completed',
    programmee: 'Scheduled',
    annulee: 'Cancelled'
  }

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
  }

  const handleCloseModal = () => {
    setSelectedConsultation(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-hedera-500" />
          <span>Consultation History</span>
        </h2>
        <Button variant="primary" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => (
          <div key={consultation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-800">{consultation.medecin}</h3>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.statut)}`}>
                    {getStatusIcon(consultation.statut)}
                    <span className="capitalize">{statusLabels[consultation.statut] || consultation.statut}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{consultation.type} - {consultation.hopital}</p>
                <p className="text-sm text-gray-500">{new Date(consultation.date).toLocaleDateString('en-US')}</p>
                {consultation.resume && (
                  <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">{consultation.resume}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewConsultation(consultation)}
                  title="View consultation details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" title="Download consultation report">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Consultation Details Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Consultation Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Doctor</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedConsultation.medecin}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-lg text-gray-900">{new Date(selectedConsultation.date).toLocaleDateString('en-US')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Hospital</label>
                  <p className="text-lg text-gray-900">{selectedConsultation.hopital}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-lg text-gray-900">{selectedConsultation.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedConsultation.statut)}`}>
                    {getStatusIcon(selectedConsultation.statut)}
                    <span className="capitalize">{statusLabels[selectedConsultation.statut] || selectedConsultation.statut}</span>
                  </span>
                </div>
              </div>

              {selectedConsultation.resume && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Summary</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{selectedConsultation.resume}</p>
                  </div>
                </div>
              )}

              {selectedConsultation.diagnostic && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800">{selectedConsultation.diagnostic}</p>
                  </div>
                </div>
              )}

              {selectedConsultation.traitement && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Treatment</label>
                  <div className="mt-2 p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-800">{selectedConsultation.traitement}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
