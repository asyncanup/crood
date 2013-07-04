define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone");

    var path = require("utils/path");

    module.exports = Backbone.Model.extend({
        defaults: {
            filePath: "",
            fileExt: "",
            content: "",
            folderPath: ""
        },

        updateFromQueryString: function () {
            var queryString = location.search;

            function getParameterByName(name) {
                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(queryString);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }

            var attributes = {};
            var filePath = getParameterByName("filePath"),
                folderPath = getParameterByName("folderPath");

            if (filePath) {
                attributes.filePath = filePath;

                if (!folderPath) {
                    attributes.folderPath = path.upFolder(filePath);
                }
            }

            this.set(attributes);
        }
    });
});