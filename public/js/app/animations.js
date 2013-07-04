define(function (require, exports, module) {
    "use strict";

    var _ = require("underscore");

    module.exports = {
        fadeIn: function (el) {
            el.addClass("anim-hidden");
            _.defer(function () {
                el.addClass("anim-short-ease");
                el.removeClass("anim-hidden");
            });
            _.delay(function () {
                el.removeClass("anim-short-ease");
            }, 1000);
        },

        bigGreenTick: function (el) {
            el.css("opacity", 0.5);
            _.delay(function () {
                el.css("opacity", 1);
            }, 1000);
        },

        bigRedCross: function (el) {
            el.css("background", "darkred");
            _.delay(function () {
                el.css("background", "white");
            }, 1000);
        }
    };
});