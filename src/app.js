import express from 'express'
import cookieParser from 'cookie-parser'
import urlRouter from './routes/url.route.js'
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import { JWTVerify } from './middlewares/auth.middleware.js'
import { redirectUrl } from './controllers/redirect.controller.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('./pages'))

app.set('views', './src/pages')
app.set('view engine', 'ejs')

// Routes
app.use('/url', JWTVerify, urlRouter)
app.use('/user', JWTVerify, userRouter)
app.use('/auth', authRouter)
// app.use('/:shortId', redirectUrl)

app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: {
      content: 'Server deployed Successfully ✅',
      fromDeveloper:
        'This is a server that generat short urls of any log links just create your account 😉 and provide a http or https url 😇 and surprise your friends 😎.',
    },
    createdAt: '29/02/2024',
  })
})

export { app }
