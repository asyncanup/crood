define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery"),
        debug = require("utils/debug")("utils/ui");

    module.exports = {
        changePageTitle: changePageTitle,
        getQueryStringParameter: getQueryStringParameter,
        updateQueryString: updateQueryString
    };

    function changePageTitle(title) {
        debug("Changing page title to: " + title);
        $("head > title").text(title);
    }

    function getQueryStringParameter(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(window.location.search);
        return (results === null || results === undefined)
            ? ""
            : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function updateQueryString(data, isReplace) {
        var filePath = data.filePath,
            folderPath = data.folderPath,
            action = isReplace ? "replaceState" : "pushState";

        if (getQueryStringParameter("filePath") !== data.filePath ||
                getQueryStringParameter("folderPath") !== data.folderPath) {
            window.history[action](
                {},
                "",
                "?filePath=" + filePath + "&folderPath=" + folderPath
            );
        }
    }

});
