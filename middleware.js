var path = require("path");

module.exports = function (app) {
	app.use(app.express.bodyParser());
	
	app.use(function (req, res, next) {
	    res.jsonError = res.jsonError || function (msg) {
	        app.log(msg);
	        res.json({ success: false, err: msg });
	    };
	    next();
	});
	
	app.use(function (req, res, next) {
	    var root = app.get("root");
	    if (!root) res.jsonError("No document root defined in application.");
        
        var err;
        ["filePath", "folderPath"].forEach(function (resourcePath) {
            resourcePath = req.query[resourcePath];
            
            var relative = resourcePath && path.relative(root, resourcePath);
            if (relative && relative.indexOf("..") === 0) {
                err = "Can't access resource (outside exposed scope): " + resourcePath;
            }
        });
        
        if (err) res.jsonError(err);
        else next();
	});
};