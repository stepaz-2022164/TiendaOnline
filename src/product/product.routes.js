'use strict'

import express from 'express'
import { newProduct, updateProduct, deleteProduct, getProductsSoldOut, getProduct, getProducts, getProductsByCategory, getProductByName, getProductsBestSelling, addProductToCart } from './product.controller.js'
import { validateToken, isAdmin } from '../middlewares/validate-jwt.js'

const api = express.Router()

//Rutas de administrador
api.post('/newProduct', [validateToken, isAdmin], newProduct)
api.put('/updateProduct/:id', [validateToken, isAdmin], updateProduct)
api.delete('/deleteProduct/:id', [validateToken, isAdmin], deleteProduct)
api.get('/getProductsSoldOut' , [validateToken, isAdmin], getProductsSoldOut)
api.get('/getProduct/:id', [validateToken, isAdmin], getProduct)

//Rutas para ambos roles
api.get('/getProducts' , [validateToken], getProducts)
api.post('/getProductsByCategory', [validateToken], getProductsByCategory)
api.post('/getProductByName', [validateToken], getProductByName)
api.get('/getProductsBestSelling', [validateToken], getProductsBestSelling)

//Rutas para clientes
api.put('/addProductToCart', [validateToken], addProductToCart)

export default api