const Joi = require('joi');
const mongoose = require('mongoose');

const Product = mongoose.model('Product', new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 500,
    },
    description: {
        type: String,
        required: true,
        minlength: 5,
    },
    contentLink: {
        type: String,
        required: true,
        minlength: 5,
        unique: true,
    },
    photo: {
        type: String,
        required: true,
    },
    marketPrice: {
        type: Number,
        required: true,
    },
    promotionalPrice: {
        type: Number,
        required: false,
    },
}));

function validateProductAdd(product) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(500).required(),
        description: Joi.string().min(5).required(),
        contentLink: Joi.string().min(3).max(50).required(),
        photo: Joi.string().required(),
        marketPrice: Joi.number().required(),
        promotionalPrice: Joi.number().required(),
    });
    return schema.validate(product);
}

function validateProductUpdate(product) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(500),
        description: Joi.string().min(5),
        contentLink: Joi.string().min(3).max(50),
        photo: Joi.string(),
        marketPrice: Joi.number(),
        promotionalPrice: Joi.number(),
    });
    return schema.validate(product);
}

exports.Product = Product;
exports.validateProductAdd = validateProductAdd;
exports.validateProductUpdate = validateProductUpdate;
