import express from 'express'
import { generateShortUrl, deleteUrl } from '../controllers/url.controller.js'

const router = express.Router()

router.route('/generate-shortid').post(generateShortUrl)
router.route('/delete-url/:id').get(deleteUrl)

export default router
