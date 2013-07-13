define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery"),
        debug = require("utils/debug")("utils/shell");

    module.exports = {
        saveFile: function (filePath, contents, success) {
            debug("Sending saveFile request for file: " + filePath);
            $.post("save?filePath=" + filePath, { data: contents }, success, "json");
        },
        openFile: null,
        listFiles: null
    };
});