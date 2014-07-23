var path = require("path"),
    debug = require("debug")("crood");

module.exports = function (app) {
	app.use(app.express.bodyParser());
	
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