import JWT from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { generateTokens } from '../controllers/user.controller.js'
import { cookieOptions } from '../constants.js'
import { AsyncHandler } from '../utils/AsyncHandler.util.js'
import { ApiError } from '../utils/ApiError.util.js'

const JWTVerify = AsyncHandler(async (req, res, next) => {
  const access_token = req.cookies?.access_token
  const refresh_token = req.cookies?.refresh_token

  if (!access_token || !refresh_token) {
    throw new ApiError(400, 'Tokens are required :: Login first')
  }

  const decodeData = JWT.verify(access_token, process.env.ACCESS_TOKEN_SECRET)

  const user = await User.findById(decodeData?.id).select('-password')

  if (!user) {
    throw new ApiError(400, 'User not found :: Invalid access token')
  }

  if (decodeData.exp < Date.now()) {
    if (refresh_token !== user?.refreshToken) {
      throw new ApiError(400, 'Invalid refresh token')
    } else {
      const { accessToken, refreshToken } = await generateTokens(user._id)
      res
        .status(200)
        .cookie('access_token', accessToken, cookieOptions)
        .cookie('refresh_token', refreshToken, cookieOptions)
      req.user = user
      next()
    }
  } else {
    req.user = user
    next()
  }
})

export { JWTVerify }
