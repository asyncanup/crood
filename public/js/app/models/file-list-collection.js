define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        $ = require("jquery"),
        _ = require("underscore");
        
    var debug = require("utils/debug")("models/file-list-collection"),
        path = require("utils/path");

    function addSeparatorIfNotPresent(folderPath) {
        var parts = folderPath.split(path.separator || path.getSeparator(folderPath));
        if (parts[parts.length - 1]) {
            folderPath = folderPath + (path.separator || path.getSeparator(folderPath));
        }
        return folderPath;
    }

    module.exports = Backbone.Collection.extend({
        refreshFileList: function (folderPath) {
            var coll = this;
            $.getJSON("list?folderPath=" + addSeparatorIfNotPresent(folderPath), function (res) {
                function isFolder(file) { return file.isFolder; }
                
                if (res.success) {
                    var files = res.data;
                    if (!path.separator) {
                        path.separator = res.pathSeparator;
                    }

                    var folders = _.select(files, isFolder);
                    var pureFiles = _.reject(files, isFolder);
                    
                    coll.reset(_.flatten([folders, pureFiles]));
                } else {
                    debug("Wrong folder path: " + folderPath);
                    coll.reset([]);
                }
            });
        }
    });
});