import express from 'express'

const router = express.Router()

router.get('/status', (req, res) => {
  res.json({
    message: 'Hedera Hashgraph connection',
    status: 'connected',
    network: 'testnet'
  })
})

export default router
