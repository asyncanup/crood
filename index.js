var apper = require('apper');

module.exports = function (opts) {
    opts = opts || {};
    
    var app = apper({
            path: __dirname
        }),
        port = opts.port,
        host = opts.host || '0.0.0.0',
        root = opts.root || process.cwd();
    
    app.set("root", root);
    
    app.start(port, host);
};