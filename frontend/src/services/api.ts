// Configuration API pour communiquer avec le backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Log de l'URL utilisée pour debug
console.log('🔗 API Base URL:', API_BASE_URL)

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface HealthCheckResponse {
  status: string
  message: string
  timestamp: string
  database: string
  version: string
}

interface DatabaseStats {
  hopitaux: number
  medecins: number
  patients: number
  consultations: number
  permissions: number
}

interface TestApiResponse {
  message: string
  database_stats: DatabaseStats
  timestamp: string
}

interface Hospital {
  id: string
  code: string
  nom: string
  ville: string
  telephone: string
  email: string
  isActive: boolean
}

interface Patient {
  id: string
  patientId: string
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email?: string
  ville?: string
  hopitalPrincipal?: string
  groupeSanguin?: string
  allergies?: string[]
  maladiesChroniques?: string[]
  contactUrgence?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`)

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
        ...options,
      })

      console.log(`📡 Response status: ${response.status} for ${url}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ HTTP Error ${response.status}:`, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log(`✅ Success for ${url}:`, responseData)

      // Si l'API backend retourne déjà une structure { success, data }, on l'utilise directement
      if (responseData.success !== undefined) {
        return responseData
      }

      // Sinon, on encapsule dans notre structure
      return {
        success: true,
        data: responseData
      }
    } catch (error) {
      console.error(`❌ API Error for ${url}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.request<HealthCheckResponse>('/health')
  }

  // Test API avec statistiques
  async testApi(): Promise<ApiResponse<TestApiResponse>> {
    return this.request<TestApiResponse>('/api/v1/test')
  }

  // Récupérer la liste des hôpitaux
  async getHospitals(): Promise<ApiResponse<{ data: Hospital[], count: number }>> {
    return this.request<{ data: Hospital[], count: number }>('/api/v1/hopitaux')
  }

  // Récupérer la liste des patients
  async getPatients(): Promise<ApiResponse<{ data: Patient[], count: number }>> {
    return this.request<{ data: Patient[], count: number }>('/api/v1/patients')
  }

  // Créer un nouveau patient (à implémenter côté backend)
  async createPatient(patientData: {
    nom: string
    prenom: string
    dateNaissance: string
    telephone: string
    email: string
    hopitalPrincipal: string
  }): Promise<ApiResponse<Patient>> {
    return this.request<Patient>('/api/v1/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    })
  }

  // Authentification patient
  async authenticatePatient(credentials: {
    patientId: string
    password: string
  }): Promise<ApiResponse<{ token: string, patient: any }>> {
    return this.request<{ token: string, patient: any }>('/api/v1/auth/patient', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  // Authentification hôpital
  async authenticateHospital(credentials: {
    adminId: string
    password: string
  }): Promise<ApiResponse<{ token: string, admin: any }>> {
    return this.request<{ token: string, admin: any }>('/api/v1/auth/hospital', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  // Authentification médecin (à implémenter côté backend)
  async loginMedecin(credentials: {
    email: string
    password: string
    hopitalCode: string
  }): Promise<ApiResponse<{ token: string, medecin: any }>> {
    return this.request<{ token: string, medecin: any }>('/api/v1/auth/medecin', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  // Récupérer la liste des médecins
  async getMedecins(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/v1/medecins')
  }

  // Récupérer la liste des consultations
  async getConsultations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/v1/consultations')
  }

  // Récupérer les données d'un patient spécifique
  async getPatientById(patientId: string): Promise<ApiResponse<Patient>> {
    return this.request<Patient>(`/api/v1/patients/${patientId}`)
  }

  // Récupérer les consultations d'un patient
  async getPatientConsultations(patientId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/patients/${patientId}/consultations`)
  }

  // Créer une nouvelle consultation
  async createConsultation(consultationData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData)
    })
  }

  // Récupérer les statistiques de l'hôpital
  async getHospitalStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/statistiques/dashboard')
  }

  // Récupérer les activités récentes
  async getRecentActivities(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/v1/statistiques/activites')
  }

  // Vérifier la connectivité
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await this.healthCheck()
      return response.success && response.data?.status === 'OK'
    } catch {
      return false
    }
  }
}

// Instance singleton
export const apiService = new ApiService()

// Hook React pour utiliser l'API
export function useApi() {
  return {
    healthCheck: () => apiService.healthCheck(),
    testApi: () => apiService.testApi(),
    getHospitals: () => apiService.getHospitals(),
    getPatients: () => apiService.getPatients(),
    getMedecins: () => apiService.getMedecins(),
    getConsultations: () => apiService.getConsultations(),
    getPatientById: (patientId: string) => apiService.getPatientById(patientId),
    getPatientConsultations: (patientId: string) => apiService.getPatientConsultations(patientId),
    createConsultation: (data: any) => apiService.createConsultation(data),
    getHospitalStats: () => apiService.getHospitalStats(),
    getRecentActivities: () => apiService.getRecentActivities(),
    createPatient: (data: Parameters<typeof apiService.createPatient>[0]) =>
      apiService.createPatient(data),
    authenticatePatient: (credentials: Parameters<typeof apiService.authenticatePatient>[0]) =>
      apiService.authenticatePatient(credentials),
    authenticateHospital: (credentials: Parameters<typeof apiService.authenticateHospital>[0]) =>
      apiService.authenticateHospital(credentials),
    loginMedecin: (credentials: Parameters<typeof apiService.loginMedecin>[0]) =>
      apiService.loginMedecin(credentials),
    checkConnectivity: () => apiService.checkConnectivity(),
  }
}

// Utilitaires
export function isApiError(response: ApiResponse<any>): response is ApiResponse<never> & { success: false } {
  return !response.success
}

export function getApiErrorMessage(response: ApiResponse<any>): string {
  if (isApiError(response)) {
    return response.error || 'Une erreur est survenue'
  }
  return ''
}

export default apiService
