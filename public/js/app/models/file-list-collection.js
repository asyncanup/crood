define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        $ = require("jquery"),
        _ = require("underscore");
        
    var debug = require("utils/debug")("models/file-list-collection"),
        path = require("utils/path");

    module.exports = Backbone.Collection.extend({
        refreshFileList: function (folderPath) {
            var coll = this;
            $.getJSON("ls?path=" + folderPath, function (res) {
                var files = [];
                if (res.success) {
                    res.data.forEach(function (fileName) {
                        var isFolder = !~fileName.indexOf(".");

                        files.push({
                            fileName: fileName,
                            isFolder: isFolder
                        });
                    });
                    var folders = _.filter(files, function (file) {
                        return file.isFolder;
                    });
                    var pureFiles = _.filter(files, function (file) {
                        return !file.isFolder;
                    });
                    coll.reset(_.flatten([folders, pureFiles]));
                } else {
                    debug("Wrong folder path: " + folderPath);
                    coll.reset([]);
                }
            });
        }
    });
});