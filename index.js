var apper = require('apper');

module.exports = function (opts) {
    var app = apper(),
        port = opts.port,
        host = opts.host || '0.0.0.0',
        root = opts.root = ".";
    
    if (app.init()) {
        app.start(port, host);
    }
};