const Joi = require('joi');
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50,
    },
    userName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
    },
}));

function validateUser(user) {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
        userName: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required()
            .email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
