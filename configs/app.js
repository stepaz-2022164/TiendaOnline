import express from 'express'
import {config} from 'dotenv'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'

const app = express()
config()
const port = process.env.PORT || 3200

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/user', userRoutes)
app.use('/category', categoryRoutes)

export const initServer = () => {
    app.listen(port)
    console.log(`Server running on port ${port}`)
}