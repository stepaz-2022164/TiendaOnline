'use strict'

import User from '../user/user.model.js'
import Bill from './bill.model.js'
import Product from '../product/product.model.js'

export const getBills = async (req, res) => {
    try {
        let userId = req.user._id
        let myBills = await Bill.find({user: userId}).populate({path: 'user', select: 'username'}).populate({path: 'products.product', select: 'name'}).select('-_id -products._id')
        if (!myBills) return res.status(404).send({message: 'User has not bills'})
        return res.send({message: 'User bills:', myBills })
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting bills'})
    }
}

export const updateBills = async (req, res) => {
    try {
        let billId = req.params.id
        let data = req.body
        let quantity = 0
        let existingBill = await Bill.findOne({_id: billId, "products.product": data.product})
        if (!existingBill) return res.status(404).send({message: 'Product not found'})
        let existingProduct = await Product.findOne({_id: data.product})
        for (let product of existingBill.products) {
            if (product.product == data.product) quantity = product.quantity
        }
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating bill'})
    }
}