import { Link } from 'react-router-dom'
import { Heart, Smartphone, Globe, Languages, Building2, User, Stethoscope, Hash } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hedera-50 to-medical-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with language selector */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-hedera-500" />
            <h1 className="text-2xl font-bold text-black">
              HEDERA HEALTH ID
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Languages className="h-5 w-5 text-gray-600" />
            <select className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-hedera-500">
              <option value="en">🌍 EN</option>
              <option value="fr">🌍 FR</option>
            </select>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Heart className="mx-auto h-16 w-16 text-hedera-500 mb-4" />
            <h2 className="text-4xl font-bold text-black mb-4">
              YOUR HEALTH
            </h2>
            <h3 className="text-3xl font-bold text-black mb-6">
              ALWAYS WITH YOU
            </h3>
          </div>
        </div>

        {/* Main cards Patient/Doctor/Hospital */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-hedera-500">
              <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-3 text-black">
                <User className="h-8 w-8 text-hedera-500" />
                <span>PATIENT</span>
              </h2>
              <ul className="text-black space-y-2 mb-6">
                <li>• My record</li>
                <li>• My data</li>
                <li>• USSD *789#</li>
              </ul>
              <div className="space-y-3">
                <Link to="/patient/login" className="block">
                  <Button variant="primary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/patient/register" className="block">
                  <Button variant="outline" className="w-full">
                    Create my record
                  </Button>
                </Link>
              </div>
            </div>

            <Link to="/medecin/login" className="block">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-medical-500">
                <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-3 text-black">
                  <Stethoscope className="h-8 w-8 text-medical-500" />
                  <span>DOCTOR</span>
                </h2>
                <ul className="text-black space-y-2">
                  <li>• QR Scanner</li>
                  <li>• Consultations</li>
                  <li>• Dashboard</li>
                </ul>
              </div>
            </Link>

            <Link to="/hospital/login" className="block">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500">
                <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-3 text-black">
                  <Building2 className="h-8 w-8 text-purple-500" />
                  <span>HOSPITAL</span>
                </h2>
                <ul className="text-black space-y-2">
                  <li>• Analytics</li>
                  <li>• Statistics</li>
                  <li>• Administration</li>
                </ul>
              </div>
            </Link>
          </div>
        </div>

        {/* Accessibility Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h3 className="text-2xl font-semibold mb-6 text-black flex items-center justify-center space-x-2">
              <Smartphone className="h-6 w-6 text-hedera-500" />
              <span>Accessible everywhere:</span>
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <Smartphone className="h-12 w-12 text-hedera-500 mb-2" />
                <span className="text-sm font-medium text-black">• Smartphone</span>
              </div>
              <div className="flex flex-col items-center">
                <Globe className="h-12 w-12 text-medical-500 mb-2" />
                <span className="text-sm font-medium text-black">• Web</span>
              </div>
              <Link to="/ussd" className="flex flex-col items-center hover:scale-105 transition-transform">
                <div className="h-12 w-12 bg-gray-200 hover:bg-hedera-100 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Hash className="h-6 w-6 text-gray-600 hover:text-hedera-600" />
                </div>
                <span className="text-sm font-medium text-black">• USSD</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="text-center">
          <div className="space-x-4">
            <Button variant="primary" size="lg">
              LEARN MORE
            </Button>
            <Link to="/ussd">
              <Button variant="secondary" size="lg">
                TEST USSD
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
