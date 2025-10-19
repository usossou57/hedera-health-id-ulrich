import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'Liste des médecins',
    data: []
  })
})

export default router
