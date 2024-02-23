'use strict'

import express from 'express'
import { register, login, update, deleteU } from './user.controller.js'
import { validateToken } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas públicas
api.post('/register', register)
api.post('/login', login)

//Rutas para usuarios existentes
api.put('/update',[validateToken] ,update)
api.delete('/delete', [validateToken], deleteU)

export default api