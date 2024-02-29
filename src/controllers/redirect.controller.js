import { Url } from '../models/url.model.js'
import { AsyncHandler } from '../utils/AsyncHandler.util.js'
import { ApiError } from '../utils/ApiError.util.js'

const redirectUrl = AsyncHandler(async (req, res) => {
  const { shortId } = req.params

  console.log('Short Id', shortId)

  if (!shortId) {
    throw new ApiError(400, 'ShortId is required.')
  }

  if (shortId.startsWith('favicon.ico') || shortId.startsWith('auth')) return

  const url = await Url.findOne({ shortId })

  if (!url) {
    throw new ApiError(400, 'Invalid shortID')
  }

  res.status(200).redirect(url.url)
})

export { redirectUrl }
