const bcrypt = require('bcrypt');
const loDash = require('lodash');
const express = require('express');
const { User, validateUser } = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send({ status: false, message: 'User Already Exists!' });
  }
  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });
  user = new User(loDash.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  return res.send(loDash.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;
