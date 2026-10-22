import { Router } from 'express'
import { adminListOrders, adminStats, adminUpdateOrderStatus } from '../controllers/orderController.js'
import {
  adminGetProduct,
  adminListProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImages,
} from '../controllers/productController.js'
import { adminOnly, protect } from '../middleware/auth.js'
import { uploadImages } from '../middleware/upload.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/stats', adminStats)

router.get('/products', adminListProducts)
router.post('/products', createProduct)
router.get('/products/:id', adminGetProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

router.post('/uploads', uploadImages, uploadProductImages)

router.get('/orders', adminListOrders)
router.put('/orders/:id/status', adminUpdateOrderStatus)

export default router
