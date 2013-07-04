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

        popIn: function (el, halfwayCallback, endCallback) {
            el.addClass("anim-short-ease-out-quart");
            el.addClass("anim-hidden")
            el.addClass("anim-slid-left");
            _.delay(function () {
                halfwayCallback && halfwayCallback();
                el.removeClass("anim-short-ease-out-quart");
                el.removeClass("anim-slid-left");
                el.addClass("anim-slid-right");

                _.defer(function () {
                    el.addClass("anim-short-ease-out-quart");

                    el.removeClass("anim-hidden");
                    el.removeClass("anim-slid-right");
                
                    _.delay(function () {
                        el.removeClass("anim-short-ease-out-quart");
                        endCallback && endCallback();
                    }, 350);
                });
                
                
            }, 250);
        },

        bigGreenTick: function (el) {
            el.css("background", "darkred");
            _.delay(function () {
                el.css("background", "white");
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