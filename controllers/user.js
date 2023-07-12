require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const CustomAPIError = require('../errors/custom-error')
const { createJWT, isTokenValid } = require('../utils/jwt')
const origin = process.env.ORIGIN

const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new CustomAPIError('Please enter email and password', 400)
        }
        const emailExists = await User.findOne({ email })
        if (emailExists) {
            return res.status(StatusCodes.OK).json({ status: 'duplicate', msg: 'Email already exists' })
        }
        const user = await User.create({ email, password, authTokenExpiration: Date.now() + 1000 * 60 * 60 })
        const authToken = user.createJWT()

        return res.status(StatusCodes.CREATED).json({ status: 'ok', msg: 'Account has been created', authToken })

    } catch (error) {
        next(error)
    }

}


const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            throw new CustomAPIError('Please enter email and password ', 400)
        }

        const user = await User.findOne({ email })
        const isPasswordCorrect = user && await user.comparePassword(password)

        if (!user || !isPasswordCorrect) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'enter valid credentials' })
        } 
            const authToken = user.createJWT()
            const oneDay = 1000 * 60 * 60 * 24
            await User.findOneAndUpdate({ email },
                { authTokenExpiration: Date.now() + oneDay },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'ok', authToken })
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    signup,
    login,
}