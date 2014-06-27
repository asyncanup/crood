define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone");

    var path = require("utils/path"),
        ui = require("utils/ui"),
        shell = require("utils/shell"),
        debug = require("utils/debug")("models/editor");

    module.exports = Backbone.Model.extend({
        defaults: {
            filePath: "",
            fileExt: "",
            content: "",
            folderPath: ""
        },

        updateFromQueryString: function () {
            var attributes = {};
            var filePath = ui.getQueryStringParameter("filePath"),
                folderPath = ui.getQueryStringParameter("folderPath") || path.upFolder(filePath);

            if (filePath) attributes.filePath = filePath;
            if (folderPath) attributes.folderPath = folderPath;
            
            this.set(attributes);
        }
    });
});