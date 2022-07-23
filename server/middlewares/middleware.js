const {UnauthorizedError} = require("../core/Exceptions/errors");
const {config} = require("../config");

const jwt = require('jsonwebtoken');

const authTokenVerify = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')?.[1];
        if (!token) throw new UnauthorizedError();

        try {
            req.user = jwt.verify(token, config.accessTokenSecret);
        } catch (e) {
            throw new UnauthorizedError();
        }

        next();
    }catch (e) {
        next(e);
    }
};

module.exports = {authTokenVerify};
