'use strict'

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { createToken } from '../utils/jwt.js'

export const test = async (req, res) => {
    return res.send('Hello World')
}

export const register = async (req, res) => {
    try {
        let data = req.body
        data.totalCart = 0
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let existUser = await User.findOne({username: data.username})
        if(existUser) return res.status(400).send({message: 'User already exist'})
        let user = new User(data)
        await user.save()
        return res.send({ message: 'User created succesfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering' })
    }
}

export const login = async(req, res) => {
    try {
        let {username, password} = req.body
        let user = await User.findOne({username})
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                surname: user.surname,
                role: user.role
            }
            let token = await createToken(loggedUser)
            return res.send({
                message: `Welcome ${user.name}`,
                loggedUser,
                token
            })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error logging in' })
    }
}

export const update = async (req, res) => {
    try {
        let data = req.body
        let userId = req.user._id
        let update = checkUpdate(data, userId)
        if(!update) return res.status(400).send({ message: 'Can not update some data or missing data' })
        let updatedUser = await User.findOneAndUpdate(  
            {_id: userId},
            data,
            {new: true}
        )
        if(!updatedUser) return res.status(401).send({ message: 'User not found and not updated' })
        return res.send({ message: 'User updated succesfully', updatedUser })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating user' })
    }
}

export const deleteU = async (req, res) => {
    try {
        let userId = req.user._id
        let deleteUser = await User.findOneAndDelete({_id: userId})
        if(!deleteUser) return res.status(401).send({ message: 'User not found and not deleted' })
        return res.send({ message: `User ${deleteUser.username} deleted succesfully` })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}