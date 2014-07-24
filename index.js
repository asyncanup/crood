var apper = require("apper"),
    openPage = require("opener"),
    debug = require("debug")("crood");

module.exports = function (opts) {
    opts = opts || {};
    
    var app = apper({
            path: __dirname
        }),
        port = opts.port,
        host = opts.host || "0.0.0.0",
        root = opts.root || process.cwd();
    
    app.set("root", root);
    app.start(port, host, function () {
        var info = this.address();
        debug("Serving everything under: " + root + "\non " + info.address + ":" + info.port);
        if (opts.toOpenBrowser) {
            openPage("http://localhost" + ":" + info.port + "/?folderPath=" + root);
        }
    });
};