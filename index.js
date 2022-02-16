const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const express = require('express');
const { dbUserName, dbPassword } = require('./config/db');
const auth = require('./routes/auth');
const products = require('./routes/products');
const collection = require('./routes/collection');

const app = express();

// Mongo DB'ye bağlantı sağlandı.
mongoose.connect(`mongodb+srv://${dbUserName}:${dbPassword}@cluster0.vfgfs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
    .then(() => console.log('mongo connected'))
    .catch((err) => console.error('mongo not connect', err));
// Gelen datayı json olarak tanımladım
app.use(express.json());

//Rotaları oluşturdum
app.use('/api/auth', auth);
app.use('/api/product', products);
app.use('/api/collection', collection);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening Port: ${port}`));
