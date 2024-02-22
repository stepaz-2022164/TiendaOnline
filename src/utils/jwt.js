'use strict'

import jwt from 'jsonwebtoken'

const secretkey = '@LlaveSecreta@'

export const createToken = async (payload) => {
    try {
        return jwt.sign(payload, secretkey, {
            expiresIn: '1d',
            algorithm: 'HS256'
        })
    } catch (error) {
        console.error(error)
        return error
    }
}