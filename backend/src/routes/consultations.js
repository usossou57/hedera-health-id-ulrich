import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'Liste des consultations',
    data: []
  })
})

export default router
