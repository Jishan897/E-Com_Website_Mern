import { Router } from 'express'
import { cancelMyOrder, createOrder, getOrder, myOrders } from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.post('/', createOrder)
router.get('/mine', myOrders)
router.get('/:id', getOrder)
router.post('/:id/cancel', cancelMyOrder)

export default router
