'use strict'

import {Schema, model} from 'mongoose'

const billSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    NIT: {
        type: String,
        required: true
    },
    products: {
        type: [{
            product:{
                type: Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

export default model('bill', billSchema)