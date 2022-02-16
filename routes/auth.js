const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const loDash = require('lodash');
const express = require('express');
const { User, validateUser } = require('../models/user');
const { apiPrivateKey } = require('../config/api');
const { checkAuth } = require('../models/auth');

const router = express.Router();

// Kullanıcı giriş bilgilerini doğruladım
function validateAuth(user) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required()
            .email(),
        password: Joi.string().min(5).max(255).required(),
    });
    return schema.validate(user);
}

// API için eposta ve şifre ile Bearer Token Oluşturma.
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

    const token = jwt.sign({ _id: user._id }, apiPrivateKey, {
        expiresIn: '2h',
    });
    return res.send({
        status: true, message: 'success', token, expires: Math.floor(Date.now() / 1000) + 7200,
    });
});

// Bearer Token kontrolü
router.get('/check', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    return res.send(auth);
});

// Kullanıcı kayıt sistemi.
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
