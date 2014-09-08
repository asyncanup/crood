define(function (require, exports, module) {
    "use strict";

    var io = require("socket.io"),
        socket = io.connect();
    
    module.exports = socket;
});