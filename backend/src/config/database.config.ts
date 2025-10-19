import { PrismaClient } from '@prisma/client'
import { config } from './app.config'

// Configuration Prisma avec logging conditionnel
const prisma = new PrismaClient({
  log: config.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty',
})

// Gestion de la connexion
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect()
    console.log('✅ Base de données connectée avec succès')
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error)
    process.exit(1)
  }
}

// Gestion de la déconnexion
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect()
    console.log('✅ Base de données déconnectée')
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error)
  }
}

// Gestion graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDatabase()
  process.exit(0)
})

export { prisma }
export default prisma
