const express = require('express')
const router = express.Router()
const { signup, login } = require('../controllers/user')
const { body } = require('express-validator')

router.post('/signup', signup)
router.post('/login', login)


module.exports = router