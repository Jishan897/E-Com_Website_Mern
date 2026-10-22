// Gives an existing account admin rights.
//   1. Create the account on the website (Sign in → Create an account)
//   2. npm run make-admin -- you@example.com
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: npm run make-admin -- you@example.com')
  process.exit(1)
}

await connectDB()
const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' })
if (user) {
  console.log(`${user.email} is now an admin.`)
} else {
  console.error(`No account found for ${email}. Register on the website first.`)
  process.exitCode = 1
}
await mongoose.disconnect()
