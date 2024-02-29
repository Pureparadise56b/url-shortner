import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDb = async () => {
  try {
    const dbConnectionResponse = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_NAME}`
    )

    console.log('\nDatabase connected...')
    console.log('HOST: ' + dbConnectionResponse.connection.host)
  } catch (error) {
    console.error('Database Connection Error :: ', error)
    process.exit(1)
  }
}

export { connectDb }
