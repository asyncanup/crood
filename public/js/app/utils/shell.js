define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery"),
        debug = require("utils/debug")("utils/shell");

    module.exports = {
        saveFile: function (filePath, contents, success) {
            debug("Sending saveFile request for file: " + filePath);
            $.post("save?filePath=" + filePath, { data: contents }, success, "json");
        },
        openFile: function (filePath, success) {
            $.getJSON("open?filePath=" + filePath, success);
        },
        listFiles: function (folderPath, success) {
            $.getJSON("list?folderPath=" + folderPath, success);
        },
        createFolder: function (folderPath, success) {
            $.post("create?folderPath=" + folderPath, success, "json");
        }
    };
});