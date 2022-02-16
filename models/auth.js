const jwt = require('jsonwebtoken');
const { apiPrivateKey } = require('../config/api');
const { perfectUser } = require('../config/db');

// Kullanıcının token süresi ve _idsini alacağımız yer
function checkAuth(req, power = false) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, apiPrivateKey);
        req.userData = decodedToken;
        if (Date.now() >= (req.userData.exp * 1000)) {
            return false;
        }
        if (power) {
            if (perfectUser.findIndex((e) => e === req.userData._id) === -1) {
                return false;
            }
        }
        return req.userData;
    } catch (error) {
        return false;
    }
}

exports.checkAuth = checkAuth;
