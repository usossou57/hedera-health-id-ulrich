import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Import des routes
import patientRoutes from './routes/patients.js'
import medecinRoutes from './routes/medecins.js'
import consultationRoutes from './routes/consultations.js'
import hederaRoutes from './routes/hedera.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Hedera Health ID API',
    version: '1.0.0',
    status: 'running'
  })
})

app.use('/api/patients', patientRoutes)
app.use('/api/medecins', medecinRoutes)
app.use('/api/consultations', consultationRoutes)
app.use('/api/hedera', hederaRoutes)

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  })
})

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route non trouvée'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
})
