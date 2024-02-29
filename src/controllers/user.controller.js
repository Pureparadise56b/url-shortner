import { User } from '../models/user.model.js'
import { cookieOptions } from '../constants.js'
import { Url } from '../models/url.model.js'
import mongoose from 'mongoose'
import { AsyncHandler } from '../utils/AsyncHandler.util.js'
import { ApiError } from '../utils/ApiError.util.js'
import { ApiResponse } from '../utils/ApiResponse.util.js'

export const generateTokens = async (userId) => {
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return { accessToken, refreshToken }
}

const registerUser = AsyncHandler(async (req, res) => {
  const { userName, password } = req.body

  if (!userName || !password) {
    throw new ApiError(400, 'Username and password is required')
  }

  const existingUser = await User.findOne({ userName: userName.trim() })

  if (existingUser) {
    throw new ApiError(400, 'User already exists')
  }

  await User.create({
    userName: userName.trim(),
    password,
  })

  const createdUser = await User.findOne({ userName }).select(
    '-password -refreshToken'
  )

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, 'User created successfully'))
})

const loginUser = AsyncHandler(async (req, res) => {
  const { userName, password } = req.body
  if (!userName || !password) {
    throw new ApiError(400, 'Username and password is required')
  }

  const user = await User.findOne({ userName })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isPasswordMatch = await user.matchPassword(password)

  if (!isPasswordMatch) {
    throw new ApiError(400, 'Incorrect Password')
  }

  const { accessToken, refreshToken } = await generateTokens(user._id)
  res
    .status(200)
    .cookie('access_token', accessToken, cookieOptions)
    .cookie('refresh_token', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        'User login successfully'
      )
    )
})

const logoutUser = AsyncHandler(async (req, res) => {
  const userId = req.user?.id

  const user = await User.findById(userId)

  user.refreshToken = ''
  await user.save({ validateBeforeSave: false })

  res
    .clearCookie('access_token')
    .clearCookie('refresh_token')
    .json(new ApiResponse(200, {}, 'User logout successfully'))
})

const getProfile = AsyncHandler(async (req, res) => {
  const userId = req.user?.id

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'urls',
        foreignField: 'createdBy',
        localField: '_id',
        as: 'urls',
        pipeline: [
          {
            $project: {
              createdBy: 0,
            },
          },
        ],
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
      },
    },
  ])

  const networkDetails = {
    protocol: req.protocol,
    host: req.hostname,
    port: req.socket.localPort,
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...user, ...networkDetails },
        'User fetched successfully'
      )
    )
})

const deleteAccount = AsyncHandler(async (req, res) => {
  const userId = req.user?._id

  const deletedPosts = await Url.deleteMany({ createdBy: userId })

  if (deletedPosts.acknowledged) {
    await User.findOneAndDelete({ _id: userId })
  }

  res
    .status(200)
    .clearCookie('access_token')
    .clearCookie('refresh_token')
    .json(new ApiResponse(200, {}, 'User deleted successfully'))
})

const updatePassword = AsyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'All fields are required')
  }

  const userId = req.user?.id

  const user = await User.findOne({ _id: userId })

  const isPasswordMatch = await user.matchPassword(oldPassword)

  if (!isPasswordMatch) {
    throw new ApiError(400, 'Invalid old password')
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'New password mismatch')
  }

  user.password = newPassword
  await user.save()

  res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  deleteAccount,
  updatePassword,
}
