define(function (require, exports, module) {
    "use strict";

    module.exports = {
        join: function (base, addition) {
            return base + this.getSeparator(base) + addition;
        },
        extname: function (path) {
            var separator = this.getSeparator(path),
                components = path.split(separator),
                fileName = components[components.length - 1],
                nameComponents = fileName.split(".");

            if (nameComponents.length > 1) {
                var lastComponent = nameComponents[nameComponents.length - 1];
                if (lastComponent) {
                    return lastComponent;
                }
                return ".";
            }
            return "";
        },
        upFolder: function (path) {
            var separator = this.getSeparator(path),
                components = path.split(separator);

            if (components.length > 1) {
                return components.slice(0, -1).join(separator);
            }
        },
        getSeparator: function (path) {
            return this.separator || !~path.indexOf("/") ? "\\" : "/";
        },
        addSeparatorIfNotPresent: function (folderPath) {
            var parts = folderPath.split(this.separator || this.getSeparator(folderPath));
            if (parts[parts.length - 1]) {
                folderPath = folderPath + (this.separator || this.getSeparator(folderPath));
            }
            return folderPath;
        }
    };
});
