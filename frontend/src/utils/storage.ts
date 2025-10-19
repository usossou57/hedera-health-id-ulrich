/**
 * Utilitaires pour la gestion sécurisée du stockage local
 */

/**
 * Parse JSON de manière sécurisée
 * @param jsonString - Chaîne JSON à parser
 * @param fallback - Valeur par défaut en cas d'erreur
 * @returns Objet parsé ou valeur par défaut
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) {
    return fallback
  }

  try {
    // Vérifier que la chaîne ressemble à du JSON
    const trimmed = jsonString.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      console.warn('Données stockées ne ressemblent pas à du JSON:', trimmed.substring(0, 50))
      return fallback
    }

    const parsed = JSON.parse(trimmed)
    return parsed
  } catch (error) {
    console.error('Erreur lors du parsing JSON:', error)
    return fallback
  }
}

/**
 * Stocke des données JSON de manière sécurisée
 * @param key - Clé de stockage
 * @param data - Données à stocker
 * @param useSessionStorage - Utiliser sessionStorage au lieu de localStorage
 */
export function safeJsonStore(key: string, data: any, useSessionStorage = false): void {
  try {
    const jsonString = JSON.stringify(data)
    const storage = useSessionStorage ? sessionStorage : localStorage
    storage.setItem(key, jsonString)
  } catch (error) {
    console.error('Erreur lors du stockage JSON:', error)
  }
}

/**
 * Récupère des données JSON de manière sécurisée
 * @param key - Clé de stockage
 * @param fallback - Valeur par défaut
 * @param checkBothStorages - Vérifier localStorage ET sessionStorage
 * @returns Données parsées ou valeur par défaut
 */
export function safeJsonRetrieve<T>(
  key: string, 
  fallback: T, 
  checkBothStorages = true
): T {
  // Essayer localStorage d'abord
  let stored = localStorage.getItem(key)
  
  // Si pas trouvé et checkBothStorages activé, essayer sessionStorage
  if (!stored && checkBothStorages) {
    stored = sessionStorage.getItem(key)
  }

  return safeJsonParse(stored, fallback)
}

/**
 * Supprime des données des deux stockages
 * @param key - Clé à supprimer
 */
export function removeFromBothStorages(key: string): void {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

/**
 * Nettoie les données corrompues d'une clé spécifique
 * @param key - Clé à nettoyer
 */
export function cleanCorruptedData(key: string): void {
  console.warn(`Nettoyage des données corrompues pour la clé: ${key}`)
  removeFromBothStorages(key)
}

/**
 * Valide et récupère les données médecin stockées
 * @returns Données médecin ou null
 */
export function getMedecinData(): any | null {
  const data = safeJsonRetrieve('medecin_data', null, true)

  // Validation basique de la structure
  if (data && typeof data === 'object' && (data as any).id && (data as any).email) {
    return data
  }

  if (data !== null) {
    console.warn('Données médecin invalides détectées, nettoyage...')
    cleanCorruptedData('medecin_data')
    cleanCorruptedData('medecin_token')
  }

  return null
}

/**
 * Stocke les données médecin de manière sécurisée
 * @param medecinData - Données du médecin
 * @param token - Token d'authentification
 * @param rememberMe - Utiliser localStorage (true) ou sessionStorage (false)
 */
export function storeMedecinData(medecinData: any, token: string, rememberMe = false): void {
  const useSessionStorage = !rememberMe
  
  safeJsonStore('medecin_data', medecinData, useSessionStorage)
  safeJsonStore('medecin_token', token, useSessionStorage)
}

/**
 * Supprime toutes les données médecin
 */
export function clearMedecinData(): void {
  removeFromBothStorages('medecin_data')
  removeFromBothStorages('medecin_token')
}

/**
 * Valide et récupère les données patient stockées
 * @returns Données patient ou null
 */
export function getPatientData(): any | null {
  const data = safeJsonRetrieve('patient_session', null, true)

  // Validation basique de la structure
  if (data && typeof data === 'object' && (data as any).patientId && (data as any).isAuthenticated) {
    return data
  }

  if (data !== null) {
    console.warn('Données patient invalides détectées, nettoyage...')
    cleanCorruptedData('patient_session')
  }

  return null
}

/**
 * Stocke les données patient de manière sécurisée
 * @param patientData - Données du patient
 */
export function storePatientData(patientData: any): void {
  safeJsonStore('patient_session', patientData, false)
}

/**
 * Supprime toutes les données patient
 */
export function clearPatientData(): void {
  removeFromBothStorages('patient_session')
}
