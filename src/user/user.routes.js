'use strict'

import express from 'express'
import { register, login, update, deleteU, registerAdmin, updateAdmin, deleteAdmin, updatePassword, updatePasswordAdmin, buyProducts } from './user.controller.js'
import { validateToken, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas públicas
api.post('/register', register)
api.post('/login', login)

//Rutas para clientes
api.put('/update/:id',[validateToken] ,update)
api.delete('/delete/:id', [validateToken], deleteU)
api.put('/updatePassword/:id', [validateToken], updatePassword)
api.post('/buyProducts', [validateToken], buyProducts)

//Rutas para administradores
api.post('/registerAdmin', [validateToken, isAdmin], registerAdmin)
api.put('/updateAdmin/:id', [validateToken, isAdmin], updateAdmin)
api.delete('/deleteAdmin/:id', [validateToken, isAdmin], deleteAdmin)
api.put('/updatePasswordAdmin/:id', [validateToken, isAdmin], updatePasswordAdmin)

export default api