import express from 'express'

const router = express.Router()

// GET /api/patients
router.get('/', (req, res) => {
  res.json({
    message: 'Liste des patients',
    data: []
  })
})

// POST /api/patients
router.post('/', (req, res) => {
  res.json({
    message: 'Patient créé',
    data: { id: 'BJ2025001' }
  })
})

export default router
