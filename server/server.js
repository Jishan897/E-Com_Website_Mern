import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { errorHandler, notFoundRoute } from './middleware/error.js'
import { UPLOAD_DIR } from './middleware/upload.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()

app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.clientUrls, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Uploaded product images
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFoundRoute)
app.use(errorHandler)

await connectDB()
app.listen(env.port, () => console.log(`Trendi API running on http://localhost:${env.port}`))
