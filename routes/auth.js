const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const express = require('express');
const { User } = require('../models/user');
const { apiPrivateKey } = require('../config/api');

const router = express.Router();

function validateAuth(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required()
      .email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(user);
}

router.post('/', async (req, res) => {
  const { error } = validateAuth(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send({ status: false, message: 'Incorrect Email & Password' });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send({ status: false, message: 'Incorrect Email & Password' });
  }

  const token = jwt.sign({ _id: user._id }, apiPrivateKey);
  return res.send({ status: true, message: 'success', token });
});

router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, apiPrivateKey);
    req.userData = decodedToken;
    return res.send(req.userData);
  } catch(error) {
    return res.status(401).send({
        status: false,
        message: 'Auth failed'
    });
  }
});

module.exports = router;
