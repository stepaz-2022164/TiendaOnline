'use strict'

import express from 'express'
import { deleteCategory, getCategories, newCategory, updateCategory } from './category.controller.js'
import { validateToken, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas publicas
api.get('/getCategories', [validateToken], getCategories)

//Rutas para administradores
api.post('/newCategory', [validateToken, isAdmin] , newCategory)
api.put('/updateCategory/:id', [validateToken, isAdmin] , updateCategory)
api.delete('/deleteCategory/:id', [validateToken, isAdmin] , deleteCategory)

export default api