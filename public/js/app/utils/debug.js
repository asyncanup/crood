define(function (require, exports, module) {
    "use strict";

    module.exports = function (context) {
        return function () {
            console.log.apply(console, [context, ":"].concat([].slice.call(arguments, 0)));
        }
    };
});