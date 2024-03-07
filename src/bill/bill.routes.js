'use strict'

import express from 'express'
import { getBills } from './bill.controller.js'
import {validateToken, isAdmin} from '../middlewares/validate-jwt.js'

const api = express.Router()

api.get('/getBills', [validateToken], getBills)

export default api