define(function (require, exports, module) {
    "use strict";

    module.exports = function (context) {
        return function () {
            var args = ["%c" + context, "color: grey"].concat([].slice.call(arguments));
            console.log.apply(console, args);
        }
    };
});