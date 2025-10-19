import dotenv from 'dotenv'
import { z } from 'zod'

// Charger les variables d'environnement
dotenv.config()

// Schéma de validation pour les variables d'environnement
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_VERSION: z.string().default('v1'),
  
  // Base de données
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Hedera
  HEDERA_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  HEDERA_ACCOUNT_ID: z.string().min(1, 'HEDERA_ACCOUNT_ID est requis'),
  HEDERA_PRIVATE_KEY: z.string().min(1, 'HEDERA_PRIVATE_KEY est requis'),
  
  // Chiffrement
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY doit faire au moins 32 caractères'),
  
  // Redis (optionnel)
  REDIS_URL: z.string().optional(),
  
  // CORS
  CORS_ORIGIN: z.string().default('https://hedera-health-id.vercel.app'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // Email (pour notifications)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),
})

// Validation et export de la configuration
const envVars = envSchema.parse(process.env)

export const config = {
  // Application
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  API_VERSION: envVars.API_VERSION,
  
  // Base de données
  DATABASE_URL: envVars.DATABASE_URL,
  
  // JWT
  JWT: {
    SECRET: envVars.JWT_SECRET,
    EXPIRES_IN: envVars.JWT_EXPIRES_IN,
    REFRESH_EXPIRES_IN: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  
  // Hedera
  HEDERA: {
    NETWORK: envVars.HEDERA_NETWORK,
    ACCOUNT_ID: envVars.HEDERA_ACCOUNT_ID,
    PRIVATE_KEY: envVars.HEDERA_PRIVATE_KEY,
  },
  
  // Sécurité
  ENCRYPTION_KEY: envVars.ENCRYPTION_KEY,
  CORS_ORIGIN: envVars.CORS_ORIGIN,
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: envVars.RATE_LIMIT_WINDOW_MS,
    MAX_REQUESTS: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // Upload
  UPLOAD: {
    MAX_FILE_SIZE: envVars.MAX_FILE_SIZE,
    DIR: envVars.UPLOAD_DIR,
  },
  
  // Email
  SMTP: {
    HOST: envVars.SMTP_HOST,
    PORT: envVars.SMTP_PORT,
    USER: envVars.SMTP_USER,
    PASS: envVars.SMTP_PASS,
  },
  
  // Logs
  LOG: {
    LEVEL: envVars.LOG_LEVEL,
    FILE: envVars.LOG_FILE,
  },
  
  // Redis
  REDIS_URL: envVars.REDIS_URL,
} as const

// Validation au démarrage
export const validateConfig = (): void => {
  try {
    envSchema.parse(process.env)
    console.log('✅ Configuration validée avec succès')
  } catch (error) {
    console.error('❌ Erreur de configuration:', error)
    process.exit(1)
  }
}

export default config
