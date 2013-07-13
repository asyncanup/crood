define(function (require, exports, module) {
    "use strict";

    var _ = require("underscore");
    
    var debug = require("utils/debug")("utils/animate");

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
        
        transitionOutIn: function (transitionClassPrefix, el, halfwayCallback, direction, endCallback) {
            if (typeof direction === "function") {
                endCallback = direction;
                direction = "left";
            }

            var oppositeDir;
            if (direction === "left") {
                oppositeDir = "right";
            } else if (direction === "right") {
                oppositeDir = "left";
            } else if (direction === "up") {
                oppositeDir = "down";
            } else if (direction === "down") {
                oppositeDir = "up";
            }

            var directionalOutClass = "anim-" + transitionClassPrefix + "-" + direction,
                transitionClassPrefixOpposite = transitionClassPrefix
                    .replace("out", "##").replace("in", "!!")
                    .replace("##", "in").replace("!!", "out"),
                oppositeDirInClass = "anim-" + transitionClassPrefixOpposite + "-" + oppositeDir;
            
            debug(directionalOutClass, oppositeDirInClass);
            
            el.addClass("anim-short-ease-out-quart");
            el.addClass("anim-hidden");
            el.addClass(directionalOutClass);
            _.delay(function () {
                halfwayCallback && halfwayCallback();
                el.removeClass("anim-short-ease-out-quart");
                el.removeClass(directionalOutClass);
                el.addClass(oppositeDirInClass);

                _.defer(function () {
                    el.addClass("anim-short-ease-out-quart");

                    el.removeClass("anim-hidden");
                    el.removeClass(oppositeDirInClass);
                 
                    _.delay(function () {
                        el.removeClass("anim-short-ease-out-quart");
                        endCallback && endCallback();
                    }, 350);
                });
                
                
            }, 250);
            
        },
        
        zoomOutSlideOutIn: function () {
            return this.transitionOutIn.apply(this, [ "zoomed-out-slid" ].concat([].slice.call(arguments)));
        },
        
        zoomInSlideOutIn: function () {
            return this.transitionOutIn.apply(this, [ "zoomed-in-slid" ].concat([].slice.call(arguments)));
        },
        
        slideOutIn: function () {
            return this.transitionOutIn.apply(this, [ "slid" ].concat([].slice.call(arguments)));
        },

        saveSuccessful: function (el) {
            el = el || window.$("#editor");
            el.addClass("anim-short-ease-out-quart");
            el.addClass("anim-semi-hidden");
            _.delay(function () {
                el.removeClass("anim-semi-hidden");
                
                _.delay(function () {
                    el.removeClass("anim-short-ease-out-quart");
                }, 250);
            }, 250);
        },

        saveFailure: function (el) {
            alert("Oops! Couldn't save file.");
        }
    };
});