define(function (require) {
    var Backbone = require("backbone");
    
    var Router = Backbone.Router.extend({
        routes: {
            "": "home"
        },

        home: function (params) {
            
        }
    });

    new Router();
});
