import { Url } from '../models/url.model.js'
import { accpetedProtocols } from '../constants.js'
import { AsyncHandler } from '../utils/AsyncHandler.util.js'
import { ApiError } from '../utils/ApiError.util.js'
import { ApiResponse } from '../utils/ApiResponse.util.js'

const generateId = () => {
  const charecters =
    'abcdefghijklmnopqrstwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

  let shortId = ''

  for (let index = 0; index < 8; index++) {
    shortId += charecters[Math.floor(Math.random() * charecters.length)]
  }

  return shortId
}

const generateShortUrl = AsyncHandler(async (req, res) => {
  const { url } = req.body

  if (!url) {
    throw new ApiError(400, 'Url is required')
  }

  if (!accpetedProtocols.includes(url.split('://')[0])) {
    throw new ApiError(400, 'Url must be a type of http or https')
  }

  const shortId = generateId()

  const data = await Url.create({
    url,
    shortId,
    createdBy: req.user?.id,
  })

  res
    .status(200)
    .json(new ApiResponse(201, data, 'shortUrl generated successfully'))
})

const deleteUrl = AsyncHandler(async (req, res) => {
  const { id } = req.params

  if (!id) {
    throw new ApiErrorError(400, 'Id is required')
  }

  const deletedUrl = await Url.findOneAndDelete({ _id: id })

  res
    .status(200)
    .json(new ApiResponse(200, deletedUrl, 'Ulr deleted successfully'))
})

export { generateShortUrl, deleteUrl }
