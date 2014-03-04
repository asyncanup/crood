define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone");

    var path = require("utils/path"),
        ui = require("utils/ui");

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
                folderPath = ui.getQueryStringParameter("folderPath");

            if (filePath) {
                attributes.filePath = filePath;

                if (!folderPath) {
                    attributes.folderPath = path.upFolder(filePath);
                }
            }

            if (folderPath) {
                attributes.folderPath = folderPath;
            }

            this.set(attributes);
        }
    });
});