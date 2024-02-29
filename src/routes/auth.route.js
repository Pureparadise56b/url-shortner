import express from 'express'
import {
  registerUser,
  loginUser,
  logoutUser,
} from '../controllers/user.controller.js'
import { JWTVerify } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.route('/signup').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(JWTVerify, logoutUser)

export default router
