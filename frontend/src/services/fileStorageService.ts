// Service de gestion du stockage de fichiers
// Pour l'instant, simulation du stockage - à remplacer par Supabase Storage en production

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  patientId?: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

class FileStorageService {
  private uploadedFiles: Map<string, UploadedFile> = new Map()

  // Simuler l'upload de fichiers
  async uploadFiles(
    files: File[], 
    patientId?: string,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadSingleFile(file, patientId, onProgress))
    return Promise.all(uploadPromises)
  }

  private async uploadSingleFile(
    file: File, 
    patientId?: string,
    onProgress?: (progress: UploadProgress[]) => void
  ): Promise<UploadedFile> {
    const fileId = this.generateFileId()
    
    // Validation du fichier
    this.validateFile(file)

    // Simulation du processus d'upload avec progression
    return new Promise((resolve, reject) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        
        if (onProgress) {
          onProgress([{
            fileId,
            fileName: file.name,
            progress: Math.min(progress, 100),
            status: progress >= 100 ? 'completed' : 'uploading'
          }])
        }

        if (progress >= 100) {
          clearInterval(interval)
          
          // Créer l'objet fichier uploadé
          const uploadedFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: this.generateFileUrl(fileId, file.name),
            uploadedAt: new Date().toISOString(),
            patientId
          }

          // Stocker en mémoire (simulation)
          this.uploadedFiles.set(fileId, uploadedFile)
          
          // Stocker dans localStorage pour persistance
          this.saveToLocalStorage(uploadedFile)
          
          resolve(uploadedFile)
        }
      }, 200)

      // Simuler une erreur occasionnelle (5% de chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval)
          if (onProgress) {
            onProgress([{
              fileId,
              fileName: file.name,
              progress: 0,
              status: 'error',
              error: 'Erreur de connexion au serveur'
            }])
          }
          reject(new Error('Erreur lors de l\'upload du fichier'))
        }, 1000)
      }
    })
  }

  // Récupérer un fichier par son ID
  async getFile(fileId: string): Promise<UploadedFile | null> {
    // Vérifier en mémoire
    const file = this.uploadedFiles.get(fileId)
    if (file) return file

    // Vérifier dans localStorage
    const storedFile = this.getFromLocalStorage(fileId)
    if (storedFile) {
      this.uploadedFiles.set(fileId, storedFile)
      return storedFile
    }

    return null
  }

  // Récupérer tous les fichiers d'un patient
  async getPatientFiles(patientId: string): Promise<UploadedFile[]> {
    const allFiles = this.getAllStoredFiles()
    return allFiles.filter(file => file.patientId === patientId)
  }

  // Supprimer un fichier
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Supprimer de la mémoire
      this.uploadedFiles.delete(fileId)
      
      // Supprimer du localStorage
      this.removeFromLocalStorage(fileId)
      
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error)
      return false
    }
  }

  // Validation des fichiers
  private validateFile(file: File): void {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ]

    if (file.size > maxSize) {
      throw new Error(`Le fichier ${file.name} est trop volumineux (max 5MB)`)
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non autorisé: ${file.type}`)
    }
  }

  // Générer un ID unique pour le fichier
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Générer une URL fictive pour le fichier
  private generateFileUrl(fileId: string, fileName: string): string {
    // En production, ceci serait l'URL Supabase Storage
    return `https://storage.hedera-health.app/files/${fileId}/${encodeURIComponent(fileName)}`
  }

  // Sauvegarder dans localStorage
  private saveToLocalStorage(file: UploadedFile): void {
    try {
      const key = `uploaded_file_${file.id}`
      localStorage.setItem(key, JSON.stringify(file))
      
      // Maintenir un index des fichiers
      const indexKey = 'uploaded_files_index'
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '[]')
      if (!existingIndex.includes(file.id)) {
        existingIndex.push(file.id)
        localStorage.setItem(indexKey, JSON.stringify(existingIndex))
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en localStorage:', error)
    }
  }

  // Récupérer depuis localStorage
  private getFromLocalStorage(fileId: string): UploadedFile | null {
    try {
      const key = `uploaded_file_${fileId}`
      const fileData = localStorage.getItem(key)
      return fileData ? JSON.parse(fileData) : null
    } catch (error) {
      console.error('Erreur lors de la lecture depuis localStorage:', error)
      return null
    }
  }

  // Supprimer de localStorage
  private removeFromLocalStorage(fileId: string): void {
    try {
      const key = `uploaded_file_${fileId}`
      localStorage.removeItem(key)
      
      // Mettre à jour l'index
      const indexKey = 'uploaded_files_index'
      const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '[]')
      const updatedIndex = existingIndex.filter((id: string) => id !== fileId)
      localStorage.setItem(indexKey, JSON.stringify(updatedIndex))
    } catch (error) {
      console.error('Erreur lors de la suppression depuis localStorage:', error)
    }
  }

  // Récupérer tous les fichiers stockés
  private getAllStoredFiles(): UploadedFile[] {
    try {
      const indexKey = 'uploaded_files_index'
      const fileIds = JSON.parse(localStorage.getItem(indexKey) || '[]')
      
      const files: UploadedFile[] = []
      for (const fileId of fileIds) {
        const file = this.getFromLocalStorage(fileId)
        if (file) {
          files.push(file)
          this.uploadedFiles.set(fileId, file) // Charger en mémoire
        }
      }
      
      return files
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error)
      return []
    }
  }

  // Nettoyer les fichiers anciens (plus de 30 jours)
  async cleanupOldFiles(): Promise<number> {
    const allFiles = this.getAllStoredFiles()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    let deletedCount = 0
    for (const file of allFiles) {
      const uploadDate = new Date(file.uploadedAt)
      if (uploadDate < thirtyDaysAgo) {
        await this.deleteFile(file.id)
        deletedCount++
      }
    }
    
    return deletedCount
  }

  // Obtenir les statistiques de stockage
  getStorageStats(): {
    totalFiles: number
    totalSize: number
    filesByType: Record<string, number>
  } {
    const allFiles = this.getAllStoredFiles()
    
    const stats = {
      totalFiles: allFiles.length,
      totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
      filesByType: {} as Record<string, number>
    }

    // Compter par type de fichier
    for (const file of allFiles) {
      const type = file.type || 'unknown'
      stats.filesByType[type] = (stats.filesByType[type] || 0) + 1
    }

    return stats
  }
}

// Instance singleton
export const fileStorageService = new FileStorageService()

// Hook React pour utiliser le service de stockage
export function useFileStorage() {
  return {
    uploadFiles: (files: File[], patientId?: string, onProgress?: (progress: UploadProgress[]) => void) =>
      fileStorageService.uploadFiles(files, patientId, onProgress),
    getFile: (fileId: string) => fileStorageService.getFile(fileId),
    getPatientFiles: (patientId: string) => fileStorageService.getPatientFiles(patientId),
    deleteFile: (fileId: string) => fileStorageService.deleteFile(fileId),
    cleanupOldFiles: () => fileStorageService.cleanupOldFiles(),
    getStorageStats: () => fileStorageService.getStorageStats()
  }
}

export default fileStorageService
