const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    tfAuthInfo: new mongoose.Schema({
        ascii: {type: String},
        hex: {type: String},
        base32: {type: String},
        otpauth_url: {type: String},
        confirmed: {type: Boolean},
        qc: {type: String},
    })
});

module.exports = mongoose.model('User',schema);
