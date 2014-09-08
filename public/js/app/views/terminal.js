define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        Handlebars = require("handlebars"),
        Terminal = require("term");
    
    var ui = require("utils/ui"),
        socket = require("utils/socket"),
        debug = require("utils/debug")(module.id);
    
    module.exports = Backbone.View.extend({
        el: "body",
        
        template: Handlebars.compile(require("text!templates/terminal.html")),

        initialize: function () {
            var model = this.model = new Backbone.Model({
                terminalPath: ui.getQueryStringParameter("terminalPath")
            });
            var term = window.term = this.term = new Terminal({
                cols: 80,
                rows: 24,
                useStyle: true,
                screenKeys: true,
                cursorBlink: false
            });

            socket.emit("terminal-path", model.get("terminalPath"));
            socket.on("terminal-connected", function () {
                var command = "";
                term.on("data", function (data) {
                    if (data === "\r") {
                        debug("command", command);
                        socket.emit("terminal-data", command);
                        command = "";
                    } else {
                        command += data;
                        term.write(data);
                    }
                });
            });
            socket.on("terminal-error", function (err) {
                debug("error", err);
            });
            socket.on("terminal-data", function (data) {
                term.write(data);
            });
        },
        
        render: function () {
            this.term.element && this.term.destroy();
            this.term.open(this.el);
            return this;
        }
    });
});