import express from 'express'
import { JWTVerify } from '../middlewares/auth.middleware.js'
import { getProfile } from '../controllers/user.controller.js'

const router = express.Router()

router.route('/').get((req, res) => {
  res.render('index')
})

router.route('/auth/signup').get((req, res) => {
  const { error } = req.query
  res.render('signup', { error })
})

router.route('/auth/login').get((req, res) => {
  const { error } = req.query
  res.render('login', { error })
})

router.route('/user/update-password').get((req, res) => {
  const { error } = req.query
  res.render('updatePassword', { error })
})

router.route('/user/profile').get(JWTVerify, getProfile)

export default router
