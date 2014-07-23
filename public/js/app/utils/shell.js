define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery"),
        path = require("utils/path"),
        debug = require("utils/debug")("utils/shell");

    module.exports = {
        saveFile: function (filePath, contents, success, error, context) {
            debug("Sending saveFile request for: " + filePath);
            $.ajax({
                type: "POST",
                url: "save?filePath=" + filePath,
                data: { data: contents },
                success: success.bind(context),
                error: error.bind(context),
                dataType: "json"
            });
        },
        openFile: function (filePath, success, error, context) {
            debug("Sending openFile request for: " + filePath);
            $.ajax({
                url: "open",
                data: { filePath: filePath },
                success: success.bind(context),
                error: error.bind(context),
                dataType: "json"
            });
        },
        listFiles: function (folderPath, success, error, context) {
            debug("Sending listFiles request for: " + folderPath);
            $.ajax({
                url: "list",
                data: { folderPath: path.addSeparatorIfNotPresent(folderPath) },
                success: success.bind(context),
                error: error.bind(context),
                dataType: "json"
            });
        },
        createFolder: function (folderPath, success, error, context) {
            debug("Sending createFolder request for: " + folderPath);
            $.ajax({
                type: "POST",
                url: "create?folderPath=" + folderPath,
                success: success.bind(context),
                error: error.bind(context),
                dataType: "json"
            });
        }
    };
});