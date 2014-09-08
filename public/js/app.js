requirejs.config({
    baseUrl: "js/lib",
    paths: {
        app: "../app",
        views: "../app/views",
        models: "../app/models",
        templates: "../../templates",
        utils: "../app/utils",
        "socket.io": "/socket.io/socket.io.js"
    },
    shim: {
        "handlebars": {
            exports: "Handlebars"
        },
        "term": {
            exports: "Terminal"
        },
        "socket.io": {
            exports: "io"
        }
    }
});

require(["app/main"]);