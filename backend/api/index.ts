import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { config, validateConfig } from '../src/config/app.config'
import { connectDatabase } from '../src/config/database.config'
import prisma from '../src/config/database.config'
import statistiquesRouter from '../src/routes/statistiques'

// Charger les variables d'environnement
dotenv.config()

// Valider la configuration
validateConfig()

const app = express()

// Middlewares de sécurité
app.use(helmet())

// Configuration CORS pour accepter plusieurs origines
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://hedera-health-id.vercel.app',
  'https://hedera-health-id-backend.vercel.app',
  config.CORS_ORIGIN
].filter(Boolean)

console.log('🔒 CORS Allowed Origins:', allowedOrigins)

app.use(cors({
  origin: (origin, callback) => {
    console.log(`🔍 CORS Check - Origin: ${origin}`)

    // Autoriser les requêtes sans origine (ex: applications mobiles, Postman)
    if (!origin) {
      console.log('✅ CORS: No origin - allowing')
      return callback(null, true)
    }

    // En développement, autoriser localhost sur tous les ports
    if (config.NODE_ENV === 'development' && origin?.includes('localhost')) {
      console.log('✅ CORS: Development localhost - allowing')
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed')
      return callback(null, true)
    }

    console.log(`❌ CORS: Origin ${origin} not allowed. Allowed origins:`, allowedOrigins)
    return callback(new Error('Non autorisé par CORS'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Route de santé
app.get('/health', async (req, res) => {
  try {
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`

    return res.status(200).json({
      status: 'OK',
      message: 'Hedera Health API is running',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      version: config.API_VERSION
    })
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Route de test des données
app.get('/api/v1/test', async (req, res) => {
  try {
    const stats = {
      hopitaux: await prisma.hopital.count(),
      medecins: await prisma.medecin.count(),
      patients: await prisma.patient.count(),
      consultations: await prisma.consultation.count(),
      permissions: await prisma.permissionMedecin.count()
    }

    return res.json({
      message: 'API Test successful',
      database_stats: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Database query failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Route pour lister les hôpitaux
app.get('/api/v1/hopitaux', async (req, res) => {
  try {
    const hopitaux = await prisma.hopital.findMany({
      select: {
        id: true,
        code: true,
        nom: true,
        ville: true,
        telephone: true,
        email: true,
        isActive: true
      }
    })

    return res.json({
      success: true,
      data: hopitaux,
      count: hopitaux.length
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch hospitals',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Route pour lister les patients
app.get('/api/v1/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        patientId: true,
        nom: true,
        prenom: true,
        telephone: true,
        ville: true,
        hopitalPrincipal: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.json({
      success: true,
      data: patients,
      count: patients.length
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch patients',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Route pour récupérer un patient spécifique par patientId
app.get('/api/v1/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params

    const patient = await prisma.patient.findUnique({
      where: {
        patientId: patientId
      },
      select: {
        id: true,
        patientId: true,
        nom: true,
        prenom: true,
        dateNaissance: true,
        telephone: true,
        email: true,
        ville: true,
        hopitalPrincipal: true,
        groupeSanguin: true,
        allergies: true,
        maladiesChroniques: true,
        contactUrgence: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    })

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: `Patient avec l'ID ${patientId} non trouvé`
      })
    }

    return res.json({
      success: true,
      data: patient
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch patient',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Route pour récupérer les consultations d'un patient
app.get('/api/v1/patients/:patientId/consultations', async (req, res) => {
  try {
    const { patientId } = req.params

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { patientId: patientId }
    })

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: `Patient avec l'ID ${patientId} non trouvé`
      })
    }

    const consultations = await prisma.consultation.findMany({
      where: {
        patientId: patient.id
      },
      select: {
        id: true,
        consultationId: true,
        dateConsultation: true,
        type: true,
        motif: true,
        diagnostic: true,
        statut: true,
        notes: true,
        createdAt: true,
        medecin: {
          select: {
            nom: true,
            prenom: true,
            specialite: true
          }
        },
        hopital: {
          select: {
            nom: true,
            code: true
          }
        }
      },
      orderBy: {
        dateConsultation: 'desc'
      }
    })

    return res.json({
      success: true,
      data: consultations,
      count: consultations.length
    })
  } catch (error) {
    console.warn('Erreur lors de la récupération des consultations:', error)
    return res.json({
      success: true,
      data: [],
      count: 0
    })
  }
})

// Route pour lister les médecins
app.get('/api/v1/medecins', async (req, res) => {
  try {
    const medecins = await prisma.medecin.findMany({
      select: {
        id: true,
        medecinId: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        specialite: true,
        service: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        hopital: {
          select: {
            nom: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.json({
      success: true,
      data: medecins,
      count: medecins.length
    })
  } catch (error) {
    console.warn('Table medecin non trouvée, utilisation de valeur par défaut')
    return res.json({
      success: true,
      data: [],
      count: 0
    })
  }
})

// Route pour lister les consultations
app.get('/api/v1/consultations', async (req, res) => {
  try {
    const consultations = await prisma.consultation.findMany({
      select: {
        id: true,
        consultationId: true,
        dateConsultation: true,
        type: true,
        motif: true,
        diagnostic: true,
        statut: true,
        createdAt: true,
        patient: {
          select: {
            patientId: true,
            nom: true,
            prenom: true
          }
        },
        medecin: {
          select: {
            nom: true,
            prenom: true,
            specialite: true
          }
        },
        hopital: {
          select: {
            nom: true,
            code: true
          }
        }
      },
      orderBy: {
        dateConsultation: 'desc'
      }
    })

    return res.json({
      success: true,
      data: consultations,
      count: consultations.length
    })
  } catch (error) {
    console.warn('Table consultation non trouvée, utilisation de valeur par défaut')
    return res.json({
      success: true,
      data: [],
      count: 0
    })
  }
})

// Route pour créer une nouvelle consultation
app.post('/api/v1/consultations', async (req, res) => {
  try {
    const {
      patientId,
      medecinId,
      hopitalId,
      type,
      motif,
      diagnostic,
      prescription,
      examensPrescrits,
      poids,
      taille,
      tensionArterielle,
      temperature,
      pouls,
      notes,
      statut = 'PROGRAMMEE'
    } = req.body

    // Générer un ID unique pour la consultation
    const consultationId = `CONS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    const consultation = await prisma.consultation.create({
      data: {
        consultationId,
        patientId,
        medecinId,
        hopitalId,
        dateConsultation: new Date(),
        type,
        motif,
        diagnostic,
        prescription,
        examensPrescrits: examensPrescrits || [],
        poids: poids ? parseFloat(poids) : null,
        taille: taille ? parseFloat(taille) : null,
        tensionArterielle,
        temperature: temperature ? parseFloat(temperature) : null,
        pouls: pouls ? parseInt(pouls) : null,
        statut,
        notes
      },
      include: {
        patient: {
          select: {
            patientId: true,
            nom: true,
            prenom: true
          }
        },
        medecin: {
          select: {
            nom: true,
            prenom: true,
            specialite: true
          }
        },
        hopital: {
          select: {
            nom: true,
            code: true
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      data: consultation,
      message: 'Consultation créée avec succès'
    })
  } catch (error) {
    console.error('Erreur création consultation:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create consultation',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Route d'authentification patient
app.post('/api/v1/auth/patient', async (req, res) => {
  try {
    const { patientId, password } = req.body

    // Validation des données
    if (!patientId || !password) {
      return res.status(400).json({
        success: false,
        error: 'ID patient et mot de passe requis'
      })
    }

    // Recherche du patient
    const patient = await prisma.patient.findUnique({
      where: {
        patientId: patientId,
        isActive: true
      }
    })

    if (!patient) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      })
    }

    // En production, vérifier le hash du mot de passe avec bcrypt
    // Pour la démo, on accepte tous les mots de passe
    const isPasswordValid = true // await bcrypt.compare(password, patient.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      })
    }

    // Mise à jour de la dernière connexion
    await prisma.patient.update({
      where: { id: patient.id },
      data: { lastLogin: new Date() }
    })

    // Génération du token JWT (simulation)
    const token = `jwt_patient_${patient.id}_${Date.now()}`

    return res.json({
      success: true,
      data: {
        token,
        patient: {
          id: patient.id,
          patientId: patient.patientId,
          nom: patient.nom,
          prenom: patient.prenom,
          email: patient.email,
          telephone: patient.telephone,
          ville: patient.ville,
          hopitalPrincipal: patient.hopitalPrincipal,
          lastLogin: new Date()
        }
      }
    })
  } catch (error) {
    console.error('Erreur authentification patient:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'authentification'
    })
  }
})

// Route d'authentification hôpital/admin
app.post('/api/v1/auth/hospital', async (req, res) => {
  try {
    const { adminId, password } = req.body

    // Validation des données
    if (!adminId || !password) {
      return res.status(400).json({
        success: false,
        error: 'ID admin et mot de passe requis'
      })
    }

    // Recherche de l'admin hôpital
    const admin = await prisma.hospitalAdmin.findUnique({
      where: {
        adminId: adminId,
        isActive: true
      },
      include: {
        hopital: {
          select: {
            id: true,
            nom: true,
            code: true,
            ville: true
          }
        }
      }
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      })
    }

    // En production, vérifier le hash du mot de passe avec bcrypt
    // Pour la démo, on accepte tous les mots de passe
    const isPasswordValid = true // await bcrypt.compare(password, admin.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      })
    }

    // Mise à jour de la dernière connexion
    await prisma.hospitalAdmin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    })

    // Génération du token JWT (simulation)
    const token = `jwt_admin_${admin.id}_${Date.now()}`

    return res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          adminId: admin.adminId,
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          role: admin.role,
          hopital: admin.hopital,
          lastLogin: new Date()
        }
      }
    })
  } catch (error) {
    console.error('Erreur authentification admin hôpital:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'authentification'
    })
  }
})

// Route d'authentification médecin
app.post('/api/v1/auth/medecin', async (req, res) => {
  try {
    const { email, password, hopitalCode } = req.body

    // Validation des données
    if (!email || !password || !hopitalCode) {
      return res.status(400).json({
        success: false,
        error: 'Email, mot de passe et code hôpital requis'
      })
    }

    // Recherche du médecin
    const medecin = await prisma.medecin.findFirst({
      where: {
        email: email.toLowerCase(),
        hopital: {
          code: hopitalCode
        },
        isActive: true
      },
      include: {
        hopital: {
          select: {
            nom: true,
            code: true
          }
        }
      }
    })

    if (!medecin) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      })
    }

    // En production, vérifier le hash du mot de passe avec bcrypt
    // Pour la démo, on accepte tous les mots de passe
    const isPasswordValid = true // await bcrypt.compare(password, medecin.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Identifiants invalides'
      })
    }

    // Mise à jour de la dernière connexion
    await prisma.medecin.update({
      where: { id: medecin.id },
      data: { lastLogin: new Date() }
    })

    // Génération du token JWT (simulation)
    const token = `jwt_token_${medecin.id}_${Date.now()}`

    return res.json({
      success: true,
      data: {
        token,
        medecin: {
          id: medecin.id,
          medecinId: medecin.medecinId,
          nom: medecin.nom,
          prenom: medecin.prenom,
          email: medecin.email,
          specialite: medecin.specialite,
          service: medecin.service,
          hopital: medecin.hopital,
          lastLogin: medecin.lastLogin
        }
      }
    })
  } catch (error) {
    console.error('Erreur authentification médecin:', error)
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'authentification'
    })
  }
})

// Routes API
app.use('/api/v1/statistiques', statistiquesRouter)

// Routes Hedera simplifiées pour les tests - v2
app.get('/api/hedera/health', (req, res) => {
  return res.json({
    success: true,
    message: 'Service Hedera opérationnel - v2',
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

app.get('/api/hedera/contracts', (req, res) => {
  return res.json({
    success: true,
    contracts: {
      patientIdentity: process.env.PATIENT_IDENTITY_CONTRACT_ID || '0.0.6853950',
      accessControl: process.env.ACCESS_CONTROL_CONTRACT_ID || '0.0.6853951',
      medicalRecords: process.env.MEDICAL_RECORDS_CONTRACT_ID || '0.0.6853952'
    },
    network: process.env.HEDERA_NETWORK || 'testnet',
    operator: process.env.OPERATOR_ID || '0.0.6853949'
  });
});

app.post('/api/hedera/create-patient', (req, res) => {
  const { personalData, patientAddress } = req.body;

  // Simulation de création de patient
  return res.json({
    success: true,
    patientId: Math.floor(Math.random() * 10000),
    transactionId: `0.0.${Date.now()}`,
    message: 'Patient créé avec succès (simulation)',
    data: {
      personalData,
      patientAddress,
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
});

app.get('/api/hedera/patient/:id', (req, res) => {
  const patientId = req.params.id;

  // Simulation de récupération de patient
  return res.json({
    success: true,
    patient: {
      patientId: parseInt(patientId),
      encryptedPersonalData: 'encrypted_data_simulation',
      patientAddress: '0x1234567890123456789012345678901234567890',
      isActive: true,
      creationDate: Math.floor(Date.now() / 1000),
      metadataHash: 'metadata_hash_simulation'
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  })
})

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Initialisation de la base de données pour Vercel
let isInitialized = false

async function initializeDatabase() {
  if (!isInitialized) {
    try {
      await connectDatabase()
      isInitialized = true
      console.log('✅ Base de données initialisée pour Vercel')
    } catch (error) {
      console.error('❌ Erreur initialisation base de données:', error)
    }
  }
}

// Export pour Vercel
export default async function handler(req: any, res: any) {
  await initializeDatabase()
  return app(req, res)
}
