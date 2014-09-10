var fs = require("fs"),
    path = require("path"),
    _ = require("underscore");
    
var debug = require("./logger");

module.exports = function (app) {

    app.get("/list", function (req, res) {
        var folderPath = req.query.folderPath;
        
        fs.readdir(folderPath, function (err, fileNames) {
            var files = [];
            function finalCallback() {
                res.json(_.sortBy(files, "fileName"));
            }
            
            if (err) {
                res.send(404, "Couldn't read folder path: " + folderPath);
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
                res.send(404, "Error reading file from disk: " + filePath);
            } else {
                res.json(data.toString());
            }
        });
    });

    app.post("/save", function (req, res) {
        var filePath = req.query.filePath;

        fs.writeFile(filePath, req.body.data, function (err) {
            if (err) {
                res.send(404, "Error writing file to disk: " + filePath);
            } else {
                res.json({ success: true });
                debug("Saved file: " + filePath);
            }
        });
    });
    
    app.post("/create", function (req, res) {
        var folderPath = req.query.folderPath;
        
        fs.mkdir(folderPath, function (err) {
            if (err) {
                res.send(404, "Error creating folder at: " + folderPath);
            } else {
                res.json({ success: true });
            }
        });
    });

    app.post("/upload", function (req, res) {
        var file = req.files.file,
            folderPath = req.query.folderPath;

        if (!file || !file.path) {
            res.send(400, "File not found in upload request.");
        } else if (!folderPath) {
            res.send(400, "Folder path not specified for uploaded file.");
            fs.unlink(file.path);
        } else {
            var newPath = path.join(folderPath, file.originalFilename);
            fs.rename(file.path, newPath, function (err) {
                if (err) {
                    res.send(500, "Could not save file to folder: " + folderPath);
                } else {
                    res.json({ success: true });
                    debug("Uploaded: " + newPath);
                }
            });
        }
    });

    app.get('/?terminalPath=:terminalPath', function (req, res) {
        res.writeHead(200, 'text/html');
        fs.createReadStream(path.join(__dirname, 'public', 'terminal', 'index.html')).pipe(res);
    });
};
