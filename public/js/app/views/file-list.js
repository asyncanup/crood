define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        Handlebars = require("handlebars"),
        $ = require("jquery");

    var path = require("utils/path"),
        shell = require("utils/shell"),
        animate = require("utils/animate"),
        debug = require("utils/debug")("views/file-list");

    module.exports = Backbone.View.extend({
        className: "file-list",
        folderInputTemplate: Handlebars.compile(require("text!templates/folder-input.html")),
        fileListTemplate: Handlebars.compile(require("text!templates/file-list.html")),
        folderUpButtonTemplate: Handlebars.compile(require("text!templates/folder-up-button.html")),
        newFileButtonsTemplate: Handlebars.compile(require("text!templates/new-file-buttons.html")),

        initialize: function () {
            this.listenTo(this.collection, "reset", this.render);
            this.listenTo(this.model, "change:filePath", this.render);
            this.listenTo(this.model, "change:folderPath", this.changeFolder);
            
            if (this.model.get("folderPath")) {
                this.changeFolder();
            }
        },

        events: {
            "change .folder-input": function () {
                this.model.set("folderPath", this.$(".folder-input").val());
            },
            
            "click .nav-list li a": function (event) {
                var el = this.$(event.target),
                    index = el.closest("li").index();

                this.selectItem(this.collection.at(index));
                event.preventDefault();
            },

            "click .folder-up-button": function () {
                var upFolder = path.upFolder(this.$(".folder-input").val());
                if (upFolder) {
                    this.model.set("folderPath", upFolder);
                }
            },
            
            "click .new-file-button": function () {
                var _this = this,
                    el = $(event.target).closest(".new-file-button"),
                    icon = el.find("i");
                    
                el.addClass("btn-primary");
                icon.addClass("icon-white");
                
                var fileName = prompt("Enter a file name:");
                if (fileName) {
                    var filePath = path.join(_this.model.get("folderPath"), fileName);
                    shell.saveFile(filePath, "", function (res) {
                        if (res.success) {
                            _this.collection.push({
                                fileName: fileName,
                                isFolder: false
                            });
                            _this.model.set("filePath", filePath);
                        } else {
                            debug("Could not create file: " + fileName);
                        }
                    });
                } else {
                    el.removeClass("btn-primary");
                    icon.removeClass("icon-white");
                }
            }
        },

        selectItem: function (fileItem) {
            var fullPath = path.join(this.model.get("folderPath"), fileItem.get("fileName"));

            if (fileItem.get("isFolder")) {
                this.model.set("folderPath", fullPath);
            } else {
                this.model.set("filePath", fullPath);
            }
        },

        changeFolder: function () {
            var folderPath = this.model.get("folderPath");
            if (folderPath) {
                this.collection.refreshFileList(folderPath);
            }
        },

        render: function () {
            // TODO: animate
            var el = this.$el,
                items = this.collection,
                model = this.model,
                folderPath = model.get("folderPath"),
                filePath = model.get("filePath"),
                previousFolderPath = model.previous("folderPath"),
                _this = this;

            items.forEach(function (item) {
                item.set("isActive", false);
                if (path.join(folderPath, item.get("fileName")) === filePath) {
                    item.set("isActive", true);
                }
            });

            function render() {
                el.empty();
                el.append(_this.folderUpButtonTemplate());
                el.append(_this.folderInputTemplate({
                    folderPath: _this.model.get("folderPath")
                }));
                el.append(_this.fileListTemplate({
                    files: items.toJSON()
                }));
                el.append(_this.newFileButtonsTemplate());

                var fileListEl = el.find(".nav-list");
                
                var windowHeight = $(window).height(),
                    availableHeight = (
                        $(window).height() -
                        (
                            parseInt(el.css("top"), 10) +
                            el.find(".folder-input").outerHeight() +
                            el.find(".new-file-buttons").outerHeight()
                        )
                    );

                if (fileListEl.height() > availableHeight) {
                    fileListEl.css({
                        "overflow-y": "scroll",
                        "height": (availableHeight - 30) + "px"
                    });
                }
            }

            if (previousFolderPath.length === folderPath.length) {
                render();
            } else {
                var direction = previousFolderPath.length < folderPath.length ? "left" : "right";
                animate.slideOutIn(el, render, direction);
            }

            return this;
        }
    });
});