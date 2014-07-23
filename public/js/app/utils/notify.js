define(function (require, exports, module) {
    "use strict";

    var humane;
    function create() {
        if (!humane) {
            humane = require("humane").create({ baseCls: "humane-flatty" });
            humane.success = humane.spawn({ addnCls: "humane-flatty-success "});
            humane.error = humane.spawn({ addnCls: "humane-flatty-error "});
        }
    }

    var notify = function (msg) {
        create();
        humane.log(msg);
    };
    notify.success = function (msg) {
        create();
        humane.success(msg);
    };
    notify.error = function (msg) {
        create();
        humane.error(msg);
    };

    module.exports = notify;
});