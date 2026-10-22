import { Router } from 'express'
import { addToWishlist, getWishlist, mergeWishlist, removeFromWishlist } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)
router.get('/wishlist', getWishlist)
router.post('/wishlist/merge', mergeWishlist)
router.post('/wishlist/:productId', addToWishlist)
router.delete('/wishlist/:productId', removeFromWishlist)

export default router
