const Joi = require('joi');
const mongoose = require('mongoose');

const Collection = mongoose.model('Collection', new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 500,
    },
    contentLink: {
        type: String,
        required: true,
        minlength: 3,
        unique: true,
    },
    products: {
        type: Array,
        required: true,
    },
}));

function validateCollectionAdd(Collection) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(500).required(),
        contentLink: Joi.string().min(3).max(50).required(),
        products: Joi.array().required(),
    });
    return schema.validate(Collection);
}

function validateCollectionUpdate(Collection) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(500),
        contentLink: Joi.string().min(3).max(50),
        products: Joi.array().required(),
    });
    return schema.validate(Collection);
}

exports.Collection = Collection;
exports.validateCollectionAdd = validateCollectionAdd;
exports.validateCollectionUpdate = validateCollectionUpdate;
