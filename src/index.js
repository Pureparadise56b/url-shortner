// import dotenv from 'dotenv'
// dotenv.config({ path: './.env' })

// import { connectDb } from './db/connection.db.js'
// import { app } from './app.js'

// const port = process.env.PORT || 3000

// connectDb()
//   .then(() => {
//     app.listen(port, () =>
//       console.log(`\nServer Started at http://localhost:${port}`)
//     )
//   })
//   .catch((error) => console.log('Server Listing Error :: ', error))

import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    messgae: 'hello from home page',
  })
})

app.listen(process.env.PORT, () => console.log('server started...'))
