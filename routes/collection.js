const loDash = require('lodash');
const express = require('express');
const mongoose = require('mongoose');
const { Collection, validateCollectionAdd, validateCollectionUpdate } = require('../models/collection');
const { checkAuth } = require('../models/auth');
const { Product } = require('../models/product');

const router = express.Router();


// Tekil Koleksiyon ürün ekleme
router.post('/add/:id', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const collection = await Collection.findOne({_id: req.params.id, user_id: auth._id});
    if (collection) {
        collection.products.push(req.body.productId);
        await Collection.findByIdAndUpdate({_id: req.params.id, user_id: auth._id}, collection);
        res.send({status: true});
    } else {
        res.status(404).send({status: false, message: "Not Found"});
    }
});

// Tekil Koleksiyon ürün silme
router.post('/remove/:id', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const collection = await Collection.findOne({_id: req.params.id, user_id: auth._id});
    if (collection) {
        var filtered = collection.products.filter(function(value, index, arr){ 
            return value != req.body.productId;
        });
        collection.products = filtered;
        await Collection.findByIdAndUpdate({_id: req.params.id, user_id: auth._id}, collection);
        res.send({status: true});
    } else {
        res.status(404).send({status: false, message: "Not Found"});
    }
});

// Koleksiyon Detay Sayfası için koleksiyon linki ile tek bir koleksiyon çektim
router.get('/get/:slug', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const collection = await Collection.findOne({contentLink: req.params.slug, ownerId: auth._id});
    if (collection) {
        var products = [];
        for (const key in collection.products) {
            var product_element = await Product.findOne({ _id: mongoose.Types.ObjectId(collection.products[key]) });
            if (product_element) {
                products.push(product_element);
            }
        }
        collection.products = products;
        res.send(collection);
    } else {
        res.status(404).send({status: false, message: "Not Found"});
    }
});

// Koleksiyon Sayfası için kullanıcıya ait koleksiyonları çektim
router.get('/list', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const collection = await Collection.find({ ownerId: auth._id });
    return res.send(collection);
});

// Kullanıcı için yeni koleksiyon oluşturdum.
router.post('/add', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const { error } = validateCollectionAdd(req.body);
    if (error) {
        return res.status(400).send({status: false, message: error.details[0].message});
    }
    let contentLinkPass = false;
    let contentLinkCount = 0;
    let contentLinkStr = '';
    do {
        contentLinkStr = req.body.contentLink + (contentLinkCount === 0 ? '' : `-${contentLinkCount}`);
        const contentLink = await Collection.findOne({ contentLink: contentLinkStr });
        if (contentLink) {
            contentLinkCount++;
        } else {
            contentLinkPass = true;
        }
    } while (!contentLinkPass);

    const collection = new Collection({
        title: req.body.title,
        contentLink: contentLinkStr,
        ownerId: auth._id,
        products: req.body.products,
    });
    await collection.save();
    return res.send({status: true});
});

// Kullanıcı için yeni koleksiyon düzenledim.
router.post('/update/:id', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const { error } = validateCollectionUpdate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    let contentLinkPass = false;
    let contentLinkCount = 0;
    let contentLinkStr = '';
    do {
        contentLinkStr = req.body.contentLink + (contentLinkCount === 0 ? '' : `-${contentLinkCount}`);
        const contentLink = await Collection.findOne({ contentLink: contentLinkStr });
        if (contentLink && contentLink._id !== req.params.id) {
            contentLinkCount++;
        } else {
            contentLinkPass = true;
        }
    } while (!contentLinkPass);

    const collection = Collection.findByIdAndUpdate(
        { _id: req.params.id, ownerId: auth._id },
        req.body,
        (err) => {
            if (err) return res.send(500, { status: false, error: err });
            return res.send({ status: true });
        },
    );
    // await product.update();
    return null;
});

// Kullanıcı için yeni koleksiyon sildirdim.
router.post('/delete/:id', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    Collection.findByIdAndRemove(
        { _id: req.params.id, ownerId: auth._id },
        (err) => {
            if (err) return res.send(500, { status: false, error: err });
            return res.send({ status: true });
        },
    );
    return null;
});

module.exports = router;
