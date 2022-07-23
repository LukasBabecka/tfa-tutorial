const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const userRouter = require('./routes/user');
const {NotFoundError, ErrorBase} = require("./core/Exceptions/errors");
const {config} = require("./config");

const app = express();


app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/www')));


app.use('/api/user', userRouter);


//Serve angular app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + 'public/www/index.html'));
});


mongoose.connect(
    config.defaultConnection, // connection string from MongoDB
    {
        useNewUrlParser: true, // options object
        useUnifiedTopology: true
    })
    .then((message) => console.log('Connected successfully!')) // callback for when conn is OK
    .catch((error) => console.log(error));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    if (!req.url.toString().startsWith('/api')){
        res.redirect('/');
    }else {
        next(new NotFoundError());
    }
});

// error handler
app.use(function (err, req, res, next) {
    if (err instanceof ErrorBase) {
        res.status(err.status).send({message: err.message, status: err.status});
    } else {
        const error = {
            message: 'An error has occurred',
            status: err?.status || 500,
            details: req.app.get('env') === 'development' ? err?.stack : ''
        };

        res.status(error.status).send(error);
    }
});

module.exports = app;
