'use strict'

import express from 'express'
import { register, login, update, deleteU, registerAdmin, updateAdmin, deleteAdmin } from './user.controller.js'
import { validateToken, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas públicas
api.post('/register', register)
api.post('/login', login)

//Rutas para clientes
api.put('/update',[validateToken] ,update)
api.delete('/delete', [validateToken], deleteU)

//Rutas para administradores
api.post('/registerAdmin', [validateToken, isAdmin], registerAdmin)
api.put('/updateAdmin/:id', [validateToken, isAdmin], updateAdmin)
api.delete('/deleteAdmin/:id', [validateToken, isAdmin], deleteAdmin)

export default api