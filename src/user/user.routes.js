'use strict'

import express from 'express'
import { register, login, test } from './user.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/register', register)
api.post('/login', login)

export default api