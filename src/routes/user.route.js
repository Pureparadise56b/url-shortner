import express from 'express'
import {
  deleteAccount,
  updatePassword,
} from '../controllers/user.controller.js'

const router = express.Router()

router.route('/delete-account').get(deleteAccount)
router.route('/update-password').post(updatePassword)

export default router
