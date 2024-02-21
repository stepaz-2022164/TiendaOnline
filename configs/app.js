'use strict'

import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()
config()
const port = process.env.PORT || 3200

app.use(express.urlencoded({extended: false}))
app.use(express.json)
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

export const initServer = () => {
    app.listen(port)
    console.log(`Server running on port ${port}`)
}