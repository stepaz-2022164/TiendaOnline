'use strict'

import User from '../user/user.model.js'
import Bill from './bill.model.js'
import Product from '../product/product.model.js'
import PDF from 'pdfkit'
import fs from 'fs'

export const getBills = async (req, res) => {
    try {
        let userId = req.params.id
        let bills = await Bill.find({user: userId, state: true}).populate({path: 'user', select: 'username'}).populate({path: 'products.product', select: 'name'}).select('-_id -products._id')
        if (!bills) return res.status(404).send({message: 'User has not bills'})
        if (!bills || bills.length === 0) {
            return res.status(404).send({ message: 'User does not have active bills' })
        }
        return res.send({ message: 'User bills:', bills })
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting bills'})
    }
}

export const getProductBill = async (req, res) => {
    try {
        let billId = req.params.id
        let existingBill = await Bill.findOne({_id: billId})
        if (!existingBill) return res.status(404).send({message: 'Bill not found'})
        let productsId = existingBill.products.map(product => product.product)
        let existingProducts = await Product.find({_id: {$in: productsId}})
        if (!existingProducts) return res.status(404).send({message: 'Product not found'})
        return res.send({ message: 'Products found:', existingProducts })
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting products of bill'})        
    }
}

export const updateBill = async (req, res) => {
    try {
        let billId = req.params.id
        let data = req.body
        let quantity = 0
        let amount = 0
        let existingBill = await Bill.findOne({_id: billId, "products.product": data.product})
        if (!existingBill) return res.status(404).send({message: 'Product not found'})
        let existingProduct = await Product.findOne({_id: data.product})
        for (let product of existingBill.products) {
            if (product.product == data.product) quantity = product.quantity
        }
        if (data.quantity > quantity) amount = existingProduct.stock - (data.quantity - quantity)
        if (data.quantity < quantity) amount = existingProduct.stock + (quantity - data.quantity)
        if (data.quantity == quantity) amount = existingProduct.stock
        if (existingProduct.stock < quantity) return res.status(400).send({message: 'Not enough stock for the product'})
        let updatedBill = await Bill.findOneAndUpdate(
            {_id: billId},
            {$set: {products: {quantity: data.quantity, product: data.product}}},
            {new: true}
        )
        let updateProductStock = await Product.findOneAndUpdate(
            {_id: data.product},
            {stock: amount},
            {new: true}).select('stock')
        return res.send({message: 'Bill updated successfully', updateBill}) 
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating bill'})
    }
}

export const deleteBill = async (req, res) => {
    try {
        let billId = req.params.id
        let deletedBill = await Bill.findOneAndUpdate(
            {_id: billId},
            {state: false},
            {new: true}
        )
        if(!deletedBill) return res.status(404).send({message: 'Bill not found and not deleted'})
        return res.send({message: 'Bill deleted successfully'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error deleting bill'})
    }
}

export const generateBill = async (req, res) => {
    try {
        let billId = req.params.id
        let bill = await Bill.findOne({_id: billId})
        let user = await User.findOne({_id: bill.user})
        let dateParams = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
        let date = bill.date.toLocaleString('es-ES', dateParams)
        let pdf = new PDF()
        pdf.pipe(fs.createWriteStream(`bills/${bill._id}.pdf`))
        pdf.fontSize(20).text(`Bill`, {align: 'center'})
        pdf.moveDown()
        pdf.fontSize(15).text(`User: ${user.username}`)
        pdf.fontSize(15).text(`Name: ${user.name + ' ' + user.surname}`)
        pdf.fontSize(15).text(`NIT: ${bill.NIT}`)
        pdf.fontSize(15).text(`Date: ${date}`)
        pdf.moveDown()
        pdf.fontSize(17).text(`Products:`)
        let products = bill.products
        for (let productBill of products) {
            let product = await Product.findOne({_id: productBill.product})
            pdf.fontSize(15).text(`${product.name}: Q.${product.price}.00`)
            pdf.fontSize(15).text(`Quantity: ${productBill.quantity}`)
            pdf.moveDown()
        }
        pdf.moveDown()
        pdf.fontSize(17).text(`Amount: Q${bill.amount}.00`)
        pdf.end()
        return res.send({message: 'Bill was successfully created'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error generating bill'})
    }
}