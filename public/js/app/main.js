define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery");
    
    $(document).on("drop dragover", function (event) {
        event.preventDefault();
    });
    
    $(function () {
        var HomeView = require("views/home");
        var homePage = new HomeView();
        homePage.render();
    });
    
});