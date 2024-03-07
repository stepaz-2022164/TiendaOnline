'use strict'

import mongoose from "mongoose"

export const connect = async() => {
    try {
        mongoose.connection.on('error', () =>{
            console.log('Faied to connect')
            mongoose.disconnect()
        })

        mongoose.connection.on('connected', () => console.log('MongoDB | Connected to MongoDB'))
        mongoose.connection.on('open', ()=> console.log('MongoDB | Connected to database'))

        await mongoose.connect('mongodb://127.0.0.1:27017/TiendaOnline2022164')
    } catch (error) {
        console.error({message: 'Database connection error', error})
    }
}