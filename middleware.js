var express = require("express");

module.exports = function (app) {
    app.use(express.bodyParser());
};