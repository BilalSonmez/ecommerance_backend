const Joi = require('joi');
const mongoose = require('mongoose');

const ContentLink = mongoose.model('ContentLink', new mongoose.Schema({
  contentLink: {
    type: String,
    required: true,
    unique: true,
  },
  contentType: {
      type: Integer,
      required: true,
      default: 0
  }
}));

function validateLink(contentLink) {
  const schema = Joi.object({
    contentLink: Joi.number().required(),
    contentType: Joi.number().required(),
  });
  return schema.validate(contentLink);
}

exports.ContentLink = ContentLink;
exports.validateLink = validateLink;
