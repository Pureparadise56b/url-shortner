import express from 'express'
import { getUrl, deleteUrl } from '../controllers/url.controller.js'

const router = express.Router()

router.route('/generate-shortId').post(getUrl)
router.route('/delete-url/:id').get(deleteUrl)

export default router
