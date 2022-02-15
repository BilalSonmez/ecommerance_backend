const loDash = require('lodash');
const express = require('express');
const { Collection, validateCollectionAdd, validateCollectionUpdate } = require('../models/collection');
const { checkAuth } = require('../models/auth');

const router = express.Router();

router.get('/list', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const collection = await Collection.find({ user_id: auth._id });
    return res.send(collection);
});

router.post('/add', async (req, res) => {
    const auth = checkAuth(req);
    if (!auth) {
        return res.status(401).send({ status: false, Message: 'Invalid Token' });
    }
    const { error } = validateCollectionAdd(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
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
    return res.send(loDash.pick(collection, ['_id', 'title', 'contentLink']));
});

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
    return res.send(loDash.pick(collection, ['_id', 'title', 'contentLink']));
});

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
    return res.send({ status: false });
});

module.exports = router;
