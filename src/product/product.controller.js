'use strict'

import Product from './product.model.js'
import User from '../user/user.model.js'
import Category from '../category/category.model.js'

// ---------------------------------------------------------------- Admin ----------------------------------------------------------------
export const newProduct = async (req, res) => {
    try {
        let data = req.body
        let existingProduct = await Product.findOne({name: data.name})
        if (existingProduct) return res.status(400).send({message: 'Product already exists'})
        let existingCategory = await Category.findOne({_id: data.category})
        if (!existingCategory) return res.status(404).send({message: 'Category does not exist'})
        let product = new Product(data)
        await product.save()
        return res.send({message: 'Product saved successfully'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error creating product'})
    }
}

export const updateProduct = async (req, res) => {
    try {
        let data = req.body
        let productId = req.params.id
        if (data.category) {
            let existingCategory = await Category.findOne({_id: data.category})
            if (!existingCategory) return res.status(404).send({message: 'Category not found'})
        }
        let updatedProduct = await Product.findOneAndUpdate(
            {_id: productId},
            data,
            {new: true}
        )
        if(!updatedProduct) return res.status(404).send({message: 'Product not found and not updated'})
        return res.send({message: 'Product updated successfully', updatedProduct})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating product'})
    }
}

export const deleteProduct = async (req, res) => {
    try {
        let productId = req.params.id
        let deletedProduct = await Product.findOneAndDelete({_id: productId})
        if(!deletedProduct) return res.status(404).send({message: 'Product not found and not deleted'})
        return res.send({message: 'Product deleted successfully'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error deleting product'})
    }
}

export const getProduct = async (req, res) => {
    try {
        let productId = req.params.id
        let product = await Product.findOne({_id: productId}).populate('category', ['name'])
        if(!product) return res.status(404).send({message: 'Product not found'})
        return res.send({message: 'Product founded:', product})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting product'})
    }
}

export const getProductsSoldOut = async (req, res) => {
    try {
        let products = await Product.find({stock: 0}).populate('category', ['name'])
        if (!products || products.length == 0) return res.status(404).send({message: 'Products not found'})
        return res.send({message: 'Products founded:', products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting products'})
    }
}

// ---------------------------------------------------------------- Ambos roles ----------------------------------------------------------------

export const getProducts = async (req, res) => {
    try {
        let products = await Product.find().populate('category' , ['name'])
        return res.send({message: 'Products founded:', products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting products'})
    }
}

export const getProductsByCategory = async (req, res) => {
    try {
        let {category} = req.body
        let products = await Product.find({category: category}).populate('category', ['name'])
        let existingCategory = await Category.findOne({_id: category})
        if (!existingCategory) return res.status(404).send({message: 'Category not found'})
        if (products.length == 0) return res.status(404).send({message: 'Products not found'})
        return res.send({message: 'Products founded:', products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting products'}) 
    }
}

export const getProductByName = async (req, res) => {
    try {
        let {name} = req.body
        let coincidence = new RegExp(name.trim(), 'i')
        let products = await Product.find({name: coincidence}).populate('category', ['name'])
        if (!products || products.length == 0) return res.status(404).send({message: 'Product not found'})
        return res.send({message: 'Product founded:', products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting product'})
    }
}

export const getProductsBestSelling = async(req, res) => {
    try {
        let products = await Product.find().sort({sales: -1}).populate('category', ['name'])
        return res.send({message: 'Products founded:', products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting products'})
    }
}

// ---------------------------------------------------------------- Client ----------------------------------------------------------------

export const addProductToCart = async(req, res) => {
    try {
        let userId = req.user._id
        let {productId} = req.body
        let quantityProduct = 0
        let total = 0
        let existingProduct = await Product.findOne({_id: productId})
        let existingUser = await User.findOne({_id: userId})
        let totalCart = existingUser.totalCart

        if(!existingProduct) return res.status(404).send({message: 'Product not found'})
        let existingProductCart = await User.findOne({_id: userId, "shoppingCart.product": productId})
        if (existingProductCart) {
            let shoppingCart = existingProductCart.shoppingCart
            for (let productCart of shoppingCart){
                if (productCart.product = productId) {
                    quantityProduct = productCart.quantity
                }
            }
            quantityProduct = quantityProduct + 1
            let updatedShoppingCart = await User.updateOne(
                {_id: userId, 'shoppingCart.product': productId},
                { $set: { "shoppingCart.$.quantity": quantityProduct } },
            )
            total = totalCart + existingProduct.price
            let updatedUser = await User.findOneAndUpdate(
                {_id: userId},
                {totalCart: total}
            )
            let newShoppingCart = updatedUser.shoppingCart
            if(!updatedShoppingCart) return res.status(400).send({message: 'Could not save product'})
            return res.send({message: 'Product added to cart', newShoppingCart})
        }
        let shoppingCart = await User.updateOne(
            {_id: userId},
            { $push: {shoppingCart: {product: productId, quantity: 1}}},
        )
        total = totalCart + existingProduct.price
        await User.findOneAndUpdate(
            {_id: userId},
            {totalCart: total}
        )
        if (!shoppingCart) return res.status(400).send({message: 'Could not save product'})
        return res.send({message: 'Product saved succesfully in the cart'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error adding product to cart'})
    }
}