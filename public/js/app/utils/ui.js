define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery"),
        debug = require("utils/debug")("utils/ui");

    module.exports = {
        changePageTitle: function (title) {
            debug("Changing page title to: " + title);
            $("head > title").text(title);
        }
    };
});