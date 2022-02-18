// Mongo DB Username & Password Heroku Variables
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// Product Add, Edit & Delete Admin User
const perfectUser = [
    '62092e419230e73803e937eb',
];

exports.perfectUser = perfectUser;
exports.dbUserName = username;
exports.dbPassword = password;
