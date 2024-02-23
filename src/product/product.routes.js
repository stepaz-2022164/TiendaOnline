'use strict'

import express from 'express'
import { newProduct } from './product.controller.js'
import { validateToken, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas de administrador
api.post('/newProduct', [validateToken, isAdmin], newProduct)

export default api