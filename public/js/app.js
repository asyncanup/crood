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
        "handlebars": {
            exports: "Handlebars"
        }
    }
});

require(["app/main"]);