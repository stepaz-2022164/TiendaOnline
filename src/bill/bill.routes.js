'use strict'

import express from 'express'
import { deleteBill, getBills, updateBill, generateBill, getProductBill } from './bill.controller.js'
import {validateToken, isAdmin} from '../middlewares/validate-jwt.js'

const api = express.Router()

//Client

//Admins
api.put('/updateBill/:id' , [validateToken, isAdmin], updateBill)
api.put('/deleteBill/:id' , [validateToken, isAdmin], deleteBill)
api.get('/generateBill/:id' , [validateToken, isAdmin], generateBill)
api.get('/getBills/:id', [validateToken, isAdmin], getBills)
api.get('/getProductBill/:id', [validateToken, isAdmin], getProductBill)

export default api