const express = require('express')
const router = express.Router()
const { signup, login, logout } = require('../controllers/user')
const authenticateUser = require('../middleware/authentications')

router.post('/signup', signup)
router.post('/login', login)
router.patch('/logout',authenticateUser, logout)

module.exports = router