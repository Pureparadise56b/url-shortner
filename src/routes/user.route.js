import express from 'express'
import {
  deleteAccount,
  updatePassword,
  getProfile,
} from '../controllers/user.controller.js'

const router = express.Router()

router.route('/profile').get(getProfile)
router.route('/delete-account').get(deleteAccount)
router.route('/update-password').post(updatePassword)

export default router
