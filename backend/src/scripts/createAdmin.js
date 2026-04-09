import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const admin = await User.create({
      username: 'adminos',
      password: 'CW_HUINA_EBANAYA67',  // Измените!
      displayName: 'Администратор',
      role: 'admin'
    })

    console.log('Admin created:', admin.username)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createAdmin()