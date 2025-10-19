import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Smartphone, Users, MapPin, Clock } from 'lucide-react'
import USSDSimulator from '../components/ussd/USSDSimulator'

const USSDPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to home
              </Link>
            </div>
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                USSD Simulator
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Information */}
          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Smartphone className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  USSD Access for Rural Areas
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                The USSD system allows patients in rural areas to access
                their medical information even with a basic phone,
                without Internet connection.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How to use:
                </h3>
                <ol className="list-decimal list-inside text-blue-800 space-y-1">
                  <li>Dial <code className="bg-blue-100 px-1 rounded">*789*YOUR_ID#</code></li>
                  <li>Press the call button</li>
                  <li>Follow the menu instructions</li>
                  <li>Use numbers to navigate</li>
                </ol>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Recent Consultations</h4>
                    <p className="text-sm text-gray-600">
                      View the history of your recent medical visits
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Active Prescriptions</h4>
                    <p className="text-sm text-gray-600">
                      Check your current medications and dosage
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Emergency Mode</h4>
                    <p className="text-sm text-gray-600">
                      Quick access in case of medical emergency
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Data */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Data
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Demo Patient IDs:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">BJ2025001</code>
                    <span className="text-gray-600 ml-2">- Adjoa KOSSOU (Cotonou)</span>
                  </li>
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">BJ2025002</code>
                    <span className="text-gray-600 ml-2">- Koffi MENSAH (Porto-Novo)</span>
                  </li>
                  <li>
                    <code className="bg-gray-200 px-2 py-1 rounded">BJ2025003</code>
                    <span className="text-gray-600 ml-2">- Fatou DIALLO (Parakou)</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Full example: <code>*789*BJ2025001#</code>
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">
                USSD Access Benefits
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Works on all phones
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  No Internet required
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Instant access to medical data
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Simple and intuitive interface
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                  Secure and confidential
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Simulator */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Try the USSD Simulator
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Use the simulator below to test the USSD interface
                as on a real mobile phone.
              </p>
            </div>
            
            <USSDSimulator />
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a demo simulator.
                In reality, this feature would be integrated directly
                into the mobile operator's network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default USSDPage
