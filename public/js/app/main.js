define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery");
    
    $(document).on("dragover", function (event) {
        event.preventDefault();
    });
    
    $(function () {
        var HomeView = require("views/home");
        var homePage = window.homePage = new HomeView();
        homePage.render();
    });
    
});