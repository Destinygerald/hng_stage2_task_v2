const express = require('express')
const Route = express.Router()

const { login, register } = require('../controllers/authController')

// login route
// POST - /auth/login
Route.post('/login', login)

// register route
// POST - /auth/register
Route.post('/register', register)

module.exports = Route