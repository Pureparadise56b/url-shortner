import { Url } from '../models/url.model.js'
import { accpetedProtocols } from '../constants.js'

const generateId = () => {
  const charecters =
    'abcdefghijklmnopqrstwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

  let shortId = ''

  for (let index = 0; index < 8; index++) {
    shortId += charecters[Math.floor(Math.random() * charecters.length)]
  }

  return shortId
}

const getUrl = async (req, res, next) => {
  try {
    const { url } = req.body

    if (!url) {
      res.status(400).redirect(`/user/profile?error=Url is required`)
      throw new Error('Url is required')
    }

    if (!accpetedProtocols.includes(url.split('://')[0])) {
      res
        .status(400)
        .redirect(`/user/profile?error=Url must be a type of http or https`)
      throw new Error('Url must be a type of http or https')
    }

    const shortId = generateId()

    const data = await Url.create({
      url,
      shortId,
      createdBy: req.user?.id,
    })

    res.status(200).redirect('/user/profile')
  } catch (error) {
    next(error)
  }
}

const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      throw new Error('id is required')
    }

    await Url.findOneAndDelete({ _id: id })

    res.status(200).redirect('/user/profile')
  } catch (error) {
    next(error)
  }
}

export { getUrl, deleteUrl }
