var fs = require("fs"),
    exec = require("child_process").exec,
    // pty = require("pty.js"),
    debug = require("./logger");

var colorful = fs.existsSync('/usr/share/terminfo/x/xterm-256color');

module.exports = function (app) {
    app.socketIO.on("connection", function (socket) {
        var terminalPath;
        
        socket.on("terminal-path", function (path) {
            terminalPath = path;
            debug("terminal-path", path);
            socket.emit("terminal-connected");
        });
        
        socket.on("terminal-data", function (data) {
            if (!terminalPath) error("Terminal not initialized yet! Pass terminal-path and wait for terminal-connected");

            debug("terminal-data", data);
            exec("cd " + terminalPath, function (err, success, stderr) {
                if (stderr) return error(stderr);
                exec(data, function (err, stdout, stderr) {
                    if (stderr) return error(stderr);
                    socket.emit("terminal-data", stdout);
                });
            });
        });
        
        function error(msg) {
            socket.emit("terminal-error", msg);
        }
    });
};