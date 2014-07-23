var fs = require("fs"),
    path = require("path"),
    _ = require("underscore");
    
var debug = require("debug")("crood");

module.exports = function (app) {

    app.get("/list", function (req, res) {
        var folderPath = req.query.folderPath;
        
        fs.readdir(folderPath, function (err, fileNames) {
            var files = [];
            function finalCallback() {
                res.json({ success: true, data: _.sortBy(files, "fileName") });
            }
            
            if (err) {
                res.jsonError("Couldn't read folder path: " + folderPath);
            } else if (!fileNames.length) {
                finalCallback();
            } else {
                var proxyCallback = _.after(fileNames.length, finalCallback);
                fileNames.forEach(function (fileName) {
                    fs.stat(path.join(folderPath, fileName), function (err, fileStat) {
                        files.push({
                            fileName: fileName,
                            isFolder: fileStat && fileStat.isDirectory()
                        });
                        proxyCallback();
                    });
                });
            }
        });
    });
    
    app.get("/open", function (req, res) {
        var filePath = req.query.filePath;
        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.jsonError("Error reading file from disk: " + filePath);
            } else {
                res.json({ success: true, data: data.toString() });
            }
        });
    });

    app.post("/save", function (req, res) {
        var filePath = req.query.filePath;

        fs.writeFile(filePath, req.body.data, function (err) {
            if (err) {
                res.jsonError("Error writing file to disk: " + filePath);
            } else {
                res.json({ success: true });
            }
        });
    });
    
    app.post("/create", function (req, res) {
        var folderPath = req.query.folderPath;
        
        fs.mkdir(folderPath, function (err) {
            if (err) {
                res.jsonError("Error creating folder at: " + folderPath);
            } else {
                res.json({ success: true });
            }
        });
    });
};
