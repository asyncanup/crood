var path = require("path"),
    bodyParser = require('body-parser'),
    debug = require("./logger");

module.exports = function (app) {
	app.use(bodyParser.urlencoded({ extended: true }));
	
	app.use(function (req, res, next) {
	    var root = app.get("root");
        
        var err;
        ["filePath", "folderPath"].forEach(function (resourcePath) {
            resourcePath = req.query[resourcePath];
            
            var relative = resourcePath && path.relative(root, resourcePath);
            if (relative && relative.indexOf("..") === 0) {
                err = "Can't access resource (outside exposed scope): " + resourcePath;
            }
        });
        
        if (err) {
            debug(err);
            res.send(403, err);
        } else {
            next();
        }
	});
};