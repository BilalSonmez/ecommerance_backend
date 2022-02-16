const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

//Mongo DB için Collection yapısını kurguladım
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
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    products: {
        type: Array,
        required: true,
    },
}));

// Collection Eklerken gerekli alanları ekledim
function validateCollectionAdd(collection) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(500).required(),
        contentLink: Joi.string().min(3).max(50).required(),
        ownerId: Joi.objectId().required(),
        products: Joi.array().required(),
    });
    return schema.validate(collection);
}

// Collection Güncellerken gerekli alanları ekledim
function validateCollectionUpdate(collection) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(500),
        contentLink: Joi.string().min(3).max(50),
        products: Joi.array().required(),
    });
    return schema.validate(collection);
}

exports.Collection = Collection;
exports.validateCollectionAdd = validateCollectionAdd;
exports.validateCollectionUpdate = validateCollectionUpdate;
