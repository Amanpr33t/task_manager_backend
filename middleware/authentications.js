const User = require('../models/user')
const jwt = require('jsonwebtoken')
const CustomAPIError = require('../errors/custom-error')
require('dotenv').config()
const { isTokenValid, attachCookiesToResponse } = require('../utils/jwt')
const { StatusCodes } = require('http-status-codes')

//authentication with headers
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomAPIError('authorization invalid', 401)
        }
        const token = authHeader.split(' ')[1]

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        if (!payload) {
            throw new Error('authentication invalid', 401)
        }

        const user = await User.findOne({ _id: payload.userId })
        if (!user) {
            throw new Error('authentication invalid', 401)
        }
        if (user.authTokenExpiration < new Date()) {
            await User.findOneAndUpdate({ _id: payload.userId },
                { authTokenExpiration: null },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'session_expired', msg: 'Successfully logged out' })
        }
        req.user = {
            userId: payload.userId,
            email: payload.email
        }

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authenticateUser
