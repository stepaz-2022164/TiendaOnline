'use strict'

import User from './user.model.js'
import Product from '../product/product.model.js'
import Bill from '../bill/bill.model.js'
import { encrypt, checkPassword, checkUpdate } from '../utils/validator.js'
import { createToken } from '../utils/jwt.js'
import { generateBill } from '../bill/bill.controller.js'

export const test = async (req, res) => {
    return res.send('Hello World')
}

// ---------------------------------------------------------------- CLIENTE ----------------------------------------------------------------
export const register = async (req, res) => {
    try {
        let data = req.body
        data.totalCart = 0
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let existUser = await User.findOne({
            $or: [
                {username: data.username},
                {email: data.email}
            ]
        })
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
        let {username, password, email} = req.body
        let user = await User.findOne({
            $or: [
                {username: username},
                {email: email}
            ]
        })
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                surname: user.surname,
                role: user.role
            }
            let token = await createToken(loggedUser)
            let myBills = await Bill.find({user: user._id, state: true}).populate({path: 'user', select: 'username'}).populate({path: 'products.product', select: 'name'}).select('-_id -products._id')
            return res.send({
                message: `Welcome ${user.name}`,
                loggedUser,
                token,
                myBills
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
        let userIdU = req.params.id
        let userIdL = req.user._id
        if (userIdL.toString() !== userIdU.toString()) return res.status(404).send({ message: 'You only can update your user'})
        let update = checkUpdate(data, userIdU)
        if(!update) return res.status(400).send({ message: 'Can not update some data or missing data' })
        let updatedUser = await User.findOneAndUpdate(  
            {_id: userIdU},
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

export const updatePassword = async (req, res) => {
    try {
        let data = req.body
        let userIdU = req.params.id
        let userIdL = req.user._id
        let user = await User.findOne({ _id: userIdU })
        let password = data.password
        if (userIdL.toString() !== userIdU.toString()) return res.status(404).send({ message: 'You only can update your user'})
        if (user && await checkPassword(password, user.password)) {
            if (data.passwordNew) data.passwordNew = await encrypt(data.passwordNew)
            let update = checkUpdate(data, userIdU)
            if (!update) return res.status(400).send({ message: 'Can not update because missing data' })
            let updatedUser = await User.findOneAndUpdate(
                { _id: userIdU },
                { password: data.passwordNew },
                { new: true }
            )
            if (!updatedUser) return res.status(401).send({ message: 'User not found and not updated' })
            return res.send({ message: 'User password updated succesfully'})
        }
        return res.status(404).send({ message: 'Password is not correct' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating password' })
    }
}

export const deleteU = async (req, res) => {
    try {
        let userIdL = req.user._id
        let userIdD = req.params.id
        let user = await User.findOne({_id: userIdD})
        if (!user) return res.status(401).send({ message: 'User not found' })
        let {password} = req.body
        if (user && await checkPassword(password, user.password)) {
            if (userIdL.toString() !== userIdD.toString()) return res.status(404).send({ message: 'You only can delete your user'})
            let deleteUser = await User.findOneAndDelete({_id: userIdD})
            if(!deleteUser) return res.status(401).send({ message: 'User not found and not deleted' })
            return res.send({ message: `User ${deleteUser.username} deleted succesfully` })
        }
        return res.status(404).send({ message: 'Password is not correct' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}

export const buyProducts = async (req, res) => {
    try {
        let data = req.body
        let userId = req.user._id
        let existingUser = await User.findOne({_id: userId})
        let shoppingCart = existingUser.shoppingCart
        for(let productCart of shoppingCart) {
            let existingStock = await Product.findOne({_id: productCart.product})
            if(existingStock.stock < productCart.quantity) return res.status(400).send({ message: `Not enough stock for the product ${productCart.product}` })
        }
        for (let productCart of shoppingCart) {
            let product = await Product.findOne({_id: productCart.product})
            let stock = product.stock - productCart.quantity
            let updateStock = await Product.findOneAndUpdate(
                {_id: productCart.product},
                {stock: stock})
        }
        let billData = {
            user: userId,
            NIT: data.NIT,
            products: existingUser.shoppingCart,
            date: Date.now(),
            amount: existingUser.totalCart
        }
        if (billData.products.length == 0) return res.status(404).send({ message:'You need add products to shopping cart'})
        let bill = new Bill(billData)
        let newBill = await bill.save()
        let userBill = await Bill.findOne({_id: newBill._id}).populate({path: 'user', select: ['username', 'name' , 'email']}).populate({path: 'products.product', select: 'name'}).select('-_id -products._id')
        let clearTotalCart = 0
        let emptyCart = []
        await User.findOneAndUpdate(
            {_id: userId},
            {totalCart: clearTotalCart, shoppingCart: emptyCart},
            {new: true})
        let productsBill = userBill.products
        for (let productSales of productsBill){
            let product = await Product.findOne({_id: productSales.product})
            let sales = product.sales + productSales.quantity
            let updateSales = await Product.findOneAndUpdate(
                {_id: productSales.product},
                {sales: sales}
            )
        }
        return res.send({ message: 'Products bought succesfully', userBill })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error buying products' })
    }
}

// ---------------------------------------------------------------- ADMIN ----------------------------------------------------------------
export const defaultAdmin = async () => {
    try {
        let existingAdmin = await User.findOne({role: 'ADMIN'})
        if(!existingAdmin) {
            let data = {
                name: 'Sergio',
                surname: 'Tepaz',
                username: 'stepaz',
                password: await encrypt('12345'),
                email: 'stepaz@kinal.edu.gt',
                phone: '87654321',
                role: 'ADMIN',
                totalCart: 0
            }
            let user = new User(data)
            await user.save()
            return console.log('Admin by default created')  
        } else {
            return console.log('Admin by default already exist')
        }
    } catch (error) {
        console.error(error)
    }
}

export const registerAdmin = async (req, res) => {
    try {
        let data = req.body
        data.totalCart = 0
        data.password = await encrypt(data.password)
        let existUser = await User.findOne({
            $or: [
                {username: data.username},
                {email: data.email}
            ]
        })
        if(existUser) return res.status(400).send({message: 'User already exist'})
        let user = new User(data)
        await user.save()
        return res.send({ message: 'User created succesfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error registering' })
    }
}

export const updateAdmin = async (req, res) => {
    try {
        let data = req.body
        let updateUser = req.params.id
        let userId = req.user._id
        let existingUser = await User.findOne({_id: updateUser})
        if((existingUser.role == 'ADMIN') && (updateUser != userId)) return res.status(400).send({ message: 'You can not update another admin'})
        if (data.password) await encrypt(data.password)
        let updatedUser = await User.findOneAndUpdate(  
            {_id: updateUser},
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

export const updatePasswordAdmin = async (req, res) => {
    try {
        let data = req.body
        let updateUser = req.params.id
        let userId = req.user._id
        let existingUser = await User.findOne({_id: updateUser})
        let password = data.password
        if((existingUser.role == 'ADMIN') && (updateUser != userId)) return res.status(400).send({ message: 'You can not update another admin'})
        if (existingUser && await checkPassword(password, existingUser.password)) {
            if (data.passwordNew) data.passwordNew = await encrypt(data.passwordNew)
            let updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { password: data.passwordNew },
                { new: true }
            )
            if (!updatedUser) return res.status(401).send({ message: 'User not found and not updated' })
            return res.send({ message: 'User password updated succesfully'})
        }
        return res.status(404).send({ message: 'Password is not correct' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating password' })
    }
}

export const deleteAdmin = async (req, res) => {
    try {
        let eliminateUser = req.params.id 
        let userId = req.user._id
        let existingUser = await User.findOne({_id: eliminateUser})
        if((existingUser.role === 'ADMIN') && (userId != eliminateUser)) return res.status(400).send({ message: 'You can not delete another admin'})
        let deleteUser = await User.findOneAndDelete({_id: eliminateUser})
        if(!deleteUser) return res.status(401).send({ message: 'User not found and not deleted' })
        return res.send({ message: `User ${existingUser.username} deleted succesfully` })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}