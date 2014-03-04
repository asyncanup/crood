define(function (require, exports, module) {
    "use strict";

    var $ = require("jquery"),
        Backbone = require("backbone");
    
    $(document).on("dragover", function (event) {
        event.preventDefault();
    });
    
    $(function () {

        Backbone.history.start();
        var HomeView = require("views/home");
        var homePage = window.homePage = new HomeView();
        homePage.render();
    });
    
});