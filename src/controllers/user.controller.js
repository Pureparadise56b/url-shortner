import { User } from '../models/user.model.js'
import { cookieOptions } from '../constants.js'
import { Url } from '../models/url.model.js'
import mongoose from 'mongoose'

export const generateTokens = async (userId) => {
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return { accessToken, refreshToken }
}

const registerUser = async (req, res, next) => {
  try {
    const { userName, password } = req.body

    if (!userName || !password) {
      res
        .status(400)
        .redirect('/auth/signup?error=Username and password is required')
      throw new Error('Username and password is required')
    }

    const existingUser = await User.findOne({ userName: userName.trim() })

    if (existingUser) {
      res.status(400).redirect('/auth/signup?error=User already exists')
      throw new Error('User already exists')
    }

    await User.create({
      userName: userName.trim(),
      password,
    })

    res.redirect('/auth/login')
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { userName, password } = req.body
    if (!userName || !password) {
      res
        .status(400)
        .redirect('/auth/login?error=Username and password is required')
      throw new Error('Username and password is required')
    }

    const user = await User.findOne({ userName })

    if (!user) {
      res.status(400).redirect('/auth/login?error=User not found')
      throw new Error('User not found')
    }

    const isPasswordMatch = await user.matchPassword(password)

    if (!isPasswordMatch) {
      res.status(400).redirect('/auth/login?error=Incorrect Password')
      throw new Error('Incorrect Password')
    }

    const { accessToken, refreshToken } = await generateTokens(user._id)
    res
      .status(200)
      .cookie('access_token', accessToken, cookieOptions)
      .cookie('refresh_token', refreshToken, cookieOptions)
      .redirect('/user/profile')
  } catch (error) {
    next(error)
  }
}

const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user?.id

    const user = await User.findById(userId)

    user.refreshToken = ''
    await user.save({ validateBeforeSave: false })

    res.clearCookie('access_token').clearCookie('refresh_token').redirect('/')
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const { error } = req.query
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

    res.render('profile', {
      user: user[0],
      host: req.hostname,
      protocol: req.protocol,
      port: req.socket.localPort,
      error,
    })
  } catch (error) {
    res.render('profile', { error })
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user?._id

    const deletedPosts = await Url.deleteMany({ createdBy: userId })

    if (deletedPosts.acknowledged) {
      await User.findOneAndDelete({ _id: userId })
    }

    res.clearCookie('access_token').clearCookie('refresh_token').redirect('/')
  } catch (error) {
    next(error)
  }
}

const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (!oldPassword || !newPassword || !confirmPassword) {
      res
        .status(400)
        .redirect('/user/update-password?error=All fields are required')
      throw new Error('All fields are required')
    }

    if (newPassword !== confirmPassword) {
      res
        .status(400)
        .redirect('/user/update-password?error=New password mismatch')
      throw new Error('new password mismatch')
    }

    const userId = req.user?.id

    const user = await User.findOne({ _id: userId })

    const isPasswordMatch = await user.matchPassword(oldPassword)

    if (!isPasswordMatch) {
      res
        .status(400)
        .redirect('/user/update-password?error=Invalid old password')
      throw new Error('Invalid old password')
    }

    user.password = newPassword
    await user.save()

    res.status(200).redirect('/user/profile')
  } catch (error) {
    next(error)
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  deleteAccount,
  updatePassword,
}
