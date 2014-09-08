define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery");
    
    var ui = require("utils/ui");
    
    $(document).on("drop dragover", function (event) {
        event.preventDefault();
    });
    
    $(function () {
        if (ui.getQueryStringParameter("terminalPath")) {
            var TerminalView = require("views/terminal");
            var terminalPage = new TerminalView().render();
        } else {
            var HomeView = require("views/home");
            var homePage = new HomeView().render();
        }
    });
});