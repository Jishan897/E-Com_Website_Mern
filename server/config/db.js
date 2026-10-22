import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri)
    console.log(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`)
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`)
    process.exit(1)
  }
}
