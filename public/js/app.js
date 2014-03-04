requirejs.config({
    baseUrl: "js/lib",
    paths: {
        app: "../app",
        views: "../app/views",
        models: "../app/models",
        templates: "../../templates",
        utils: "../app/utils"
    },
    shim: {
        "backbone": {
            deps: [
                "underscore",
                "jquery"
            ],
            exports: "Backbone"
        },
        "underscore": {
            exports: "_"
        },
        "ace/ace": {
            exports: "ace"
        },
        "handlebars": {
            exports: "Handlebars"
        }
    }
});

require(["app/router", "app/main"]);