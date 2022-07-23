const express = require('express');
const {BadRequestError} = require("../core/Exceptions/errors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const router = express.Router();

const User = require('../models/user');
const {config} = require("../config");
const {authTokenVerify} = require("../middlewares/middleware");


/**
 * Register
 */
router.post('/register', async (req, res, next) => {
    try {
        const newUser = req.body ?? {};

        if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password)
            throw new BadRequestError('First name, last name, email and password are required');

        //Check if email already exists.
        if (await emailExists(newUser.email))
            throw new BadRequestError(`User with email address ${newUser.email} already exists`);

        //Create new user.
        const user = new User({
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: await bcrypt.hash(newUser.password, 10)
        });

        await user.save();

        res.status(201).send(user);
    } catch (e) {
        next(e);
    }
});


/**
 * Login
 */
router.post('/login', async (req, res,next) => {
    try {
        const user = await User.findOne({email: req.body.email})

        if (!user) throw new BadRequestError('Invalid credentials');

        //verify pwd
        if (!await bcrypt.compare(req.body.password,user.password))
            throw new BadRequestError('Invalid credentials');

        //We have valid password. If 2fa is enabled we need to verify it.
        if (user.tfAuthInfo?.confirmed){
            //Check if 2fa info was provided.
            if (!req.body.token) {
                //Incomplete request.
                res.status(206).send('Please, provide two-factor authentication token');
                return;
            }

            //Verify token.
            const isVerified = speakeasy.totp.verify({ secret: user.tfAuthInfo.base32, encoding: 'base32', token: req.body.token });

            if (!isVerified) throw new BadRequestError('Invalid two-factor authentication token');
        }

        const bearer = jwt.sign({email:user.email},config.accessTokenSecret);

        const userToReturn = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            tfAuthInfo: user.tfAuthInfo,
            token: bearer
        };

        res.send(userToReturn);
    } catch (e) {
        next(e);
    }
});


/**
 * Enable two-factor authentication.
 */
router.post('/enableTwoFactorAuth', authTokenVerify, async (req, res, next) => {
    try {
        //get user from db.
        const user = await User.findOne({email: req.user.email});

        if (user?.tfAuthInfo?.confirmed) throw new BadRequestError('Two-factor authentication is already enabled');

        //generate tf secret data
        user.tfAuthInfo = speakeasy.generateSecret({name: '2fa Tutorial'});
        user.tfAuthInfo.qc = await qrcode.toDataURL(user.tfAuthInfo.otpauth_url);
        user.tfAuthInfo.confirmed = false;

        await user.save();

        res.send(user.tfAuthInfo);
    } catch (e) {
        next(e);
    }
});


/**
 * Confirm two-factor authentication.
 */
router.post('/confirmTwoFactorAuth', authTokenVerify, async (req, res, next) => {
    try {
        //get user from db.
        const user = await User.findOne({email: req.user.email});

        //Validate request.
        if (!user.tfAuthInfo) throw new BadRequestError('Two-factor authentication has to be enabled before the confirmation request is sent.');
        if (user?.tfAuthInfo.confirmed) throw new BadRequestError('Two-factor authentication is already confirmed');

        const base32 = req.body.base32;
        const token = req.body.token;


        if (base32 !== user.tfAuthInfo.base32) throw new BadRequestError('Invalid data for confirmation was sent');

        const isVerified = speakeasy.totp.verify({ secret: base32, encoding: 'base32', token: token });

        if (!isVerified) throw new BadRequestError('Invalid two-factor authentication token');

        //We can confirm tf auth.
        user.tfAuthInfo.confirmed = true;

        await user.save();

        res.send(user.tfAuthInfo);
    } catch (e) {
        next(e);
    }
});


/**
 * Remove two-factor authentication.
 */
router.post('/removeTwoFactorAuth', authTokenVerify, async (req, res, next) => {
    try {
        //get user from db.
        const user = await User.findOne({email: req.user.email});

        user.tfAuthInfo = null;

        await user.save();

        res.send();
    } catch (e) {
        next(e);
    }
});


async function emailExists(email) {
    const user = await User.findOne({email: email});
    return !!user;
}

module.exports = router;
