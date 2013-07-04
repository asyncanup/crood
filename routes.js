var shell = require("shelljs"),
    debug = require("debug")("crood");

var exposedCommands = [
    "cat",
    "ls"
];

module.exports = function (app) {

    exposedCommands.forEach(function (cmd) {
        app.get("/" + cmd, function (req, res) {
            var path = req.query.path;

            try {
                if (shell.test("-e", path)) {
                    res.json({
                        success: true,
                        data: shell[cmd](path)
                    });
                } else {
                    debug("File doesn't exist: " + path);
                    res.json({ success: false });
                }
            } catch (err) {
                debug("Error " + cmd + "'ing file: " + path);
                res.json({ success: false });
            }
        });
    });

    app.post("/save", function (req, res) {
        var path = req.query.path;

        try {
            shell.echo(req.body.data).to(path);
            debug("Saving to disk: " + path + "\n------\n" + req.body.data);
            res.json({ success: true });
        } catch (err) {
            debug("Error writing file to disk: " + path);
            res.json({ success: false });
        }

    });
};