import { Url } from '../models/url.model.js'

const redirectUrl = async (req, res, next) => {
  try {
    const { shortId } = req.params

    console.log('Short Id', shortId)

    if (!shortId) {
      throw new Error('ShortId is required.')
    }

    if (shortId.startsWith('favicon.ico')) return

    const url = await Url.findOne({ shortId })

    if (!url) {
      throw new Error('Invalid shortID')
    }

    res.status(200).redirect(url.url)
  } catch (error) {
    next(error)
  }
}

export { redirectUrl }
