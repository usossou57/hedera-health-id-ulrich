import { Settings } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PatientData } from '@/types/patient'

interface PatientSettingsProps {
  patientData: PatientData | null
}

export default function PatientSettings({ patientData }: PatientSettingsProps) {
  if (!patientData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
        <Settings className="h-5 w-5 text-hedera-500" />
        <span>Account Settings</span>
      </h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900">{patientData.telephone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{patientData.email || 'Not provided'}</p>
            </div>
          </div>
          <Button variant="outline" className="mt-4">
            Edit my information
          </Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Appointment reminders</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-hedera-500 focus:ring-hedera-500 border-gray-300 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New authorizations</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-hedera-500 focus:ring-hedera-500 border-gray-300 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Exam results</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-hedera-500 focus:ring-hedera-500 border-gray-300 rounded" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-4">Security</h3>
          <div className="space-y-3">
            <Button variant="outline">
              Change password
            </Button>
            <Button variant="outline">
              Download my data
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              Delete my account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
