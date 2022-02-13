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
    type: Integer,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
    required: true,
  },
  marketPrice: {
    type: Double,
    required: true,
  },
  promotionalPrice: {
    type: Double,
    required: false,
  },
}));

function validateProduct(product) {
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

exports.Product = Product;
exports.validateProduct = validateProduct;
