'use strict'

import Category from './category.model.js'

export const defaultCategory = async() => {
    try {
        let category = {
            name: 'Default',
            description: 'Default category'
        }
        let existingCategory = await Category.findOne({name: 'Default'})
        if(existingCategory) return console.log('Default category already exists')
        let defaultCategory = new Category(category)
        await defaultCategory.save()
        return console.log('Default category created') 
    } catch (error) {
        return console.error(error)
    }
}

export const newCategory = async(req, res) => {
    try {
        let data = req.body
        let existingCategory = await Category.findOne({name: data.name})
        if(existingCategory) return res.status(400).send({message: 'Category already exist'})
        let category = new Category(data)
        await category.save()
        return res.send({message: 'Category created successfully'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error creating category'})
    }
}

export const getCategories = async(req, res) => {
    try {
        let categories = await Category.find()
        return res.send({message: 'Categories founded:', categories})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting categories'})
    }
}

export const updateCategory = async(req, res) => {
    try {
        let data = req.body
        let categoryId = req.params.id
        let defaultCategory = await Category.findOne({name: 'Default'})
        if(defaultCategory._id == categoryId) return res.send({message: 'Default category can not be updateded'})
        let updatedCategory = await Category.findOneAndUpdate(
            {_id: categoryId},
            data,
            {new: true}
        )
        if(!updatedCategory) return res.status(404).send({message: 'Category not found and not updated'})
        return res.send({message: 'Category updated successfully', updatedCategory})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating category'})
    }
}

export const deleteCategory = async(req, res) => {
    try {
        let categoryId = req.params.id
        let defaultCategory = await Category.findOne({name: 'Default'})
        if(defaultCategory) return res.status(401).send({message: 'Default category can not be deleted'})
        /*
        await Product.updateMany(
            {category: categoryId},
            {category: defaultCategory._id}    
        )*/
        let deletedCategory = await Category.findOneAndDelete({_id: categoryId})
        if(!deletedCategory) return res.status(404).send({message: 'Category not found and not deleted'})
        return res.send({message: 'Category deleted successfully'})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error deleting category'})
    }
}