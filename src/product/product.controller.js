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