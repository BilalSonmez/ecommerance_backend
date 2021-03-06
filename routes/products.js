const loDash = require('lodash');
const express = require('express');
const { Product, validateProductAdd, validateProductUpdate } = require('../models/product');
const { checkAuth } = require('../models/auth');

const router = express.Router();

// Ürün Detay Sayfası için ürün linki ile tek bir ürün çektim
router.get('/get/:id', async (req, res) => {
    const products = await Product.findOne({ contentLink: req.params.id });
    if (products) {
        res.send(products);
    } else {
        res.status(404).send({ status: false, message: 'Not Found' });
    }
});

// Ürünler Sayfası için bütün ürünleri çektim
router.get('/list', async (req, res) => {
    const products = await Product.find({});
    res.send(products);
});

// Sadece Admin kullanıcılar tarafından ürün eklettirdim. bkz: config/db.js
router.post('/add', async (req, res) => {
    if (!checkAuth(req, true)) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const { error } = validateProductAdd(req.body);
    if (error) {
        return res.status(400).send({ status: false, message: error.details[0].message });
    }
    let contentLinkPass = false;
    let contentLinkCount = 0;
    let contentLinkStr = '';
    do {
        contentLinkStr = req.body.contentLink + (contentLinkCount === 0 ? '' : `-${contentLinkCount}`);
        const contentLink = await Product.findOne({ contentLink: contentLinkStr });
        if (contentLink) {
            contentLinkCount++;
        } else {
            contentLinkPass = true;
        }
    } while (!contentLinkPass);

    const product = new Product({
        title: req.body.title,
        description: req.body.description,
        contentLink: contentLinkStr,
        photo: req.body.photo,
        marketPrice: req.body.marketPrice,
        promotionalPrice: req.body.promotionalPrice,
    });
    await product.save();
    return res.send(loDash.pick(product, ['_id', 'title', 'contentLink']));
});

// Sadece Admin kullanıcılar tarafından ürün düzenlendi. bkz: config/db.js
router.post('/update/:id', async (req, res) => {
    if (!checkAuth(req, true)) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const { error } = validateProductUpdate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    let contentLinkPass = false;
    let contentLinkCount = 0;
    let contentLinkStr = '';
    do {
        contentLinkStr = req.body.contentLink + (contentLinkCount === 0 ? '' : `-${contentLinkCount}`);
        const contentLink = await Product.findOne({ contentLink: contentLinkStr });
        if (contentLink && contentLink._id !== req.params.id) {
            contentLinkCount++;
        } else {
            contentLinkPass = true;
        }
    } while (!contentLinkPass);

    await Product.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        (err) => {
            if (err) return res.send(500, { status: false, error: err });
            return res.send({ status: true });
        },
    );
    // await product.update();
    return null;
});

// Sadece Admin kullanıcılar tarafından ürün sildirdim. bkz: config/db.js
router.post('/delete/:id', async (req, res) => {
    if (!checkAuth(req, true)) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    Product.findByIdAndRemove({ _id: req.params.id }, (err) => {
        if (err) return res.send(500, { status: false, error: err });
        return res.send({ status: true });
    });
    return res.send({ status: false });
});

module.exports = router;
