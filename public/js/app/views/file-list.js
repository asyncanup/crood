define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        Handlebars = require("handlebars");

    var path = require("utils/path"),
        animate = require("utils/animate");

    module.exports = Backbone.View.extend({
        className: "file-list",
        folderInputTemplate: Handlebars.compile(require("text!templates/folder-input.html")),
        fileListTemplate: Handlebars.compile(require("text!templates/file-list.html")),
        folderUpButtonTemplate: Handlebars.compile(require("text!templates/folder-up-button.html")),

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

                var fileListEl = _this.$el.find(".nav-list");
                if (fileListEl.height() > 500) {
                    fileListEl.css({
                        "overflow-y": "scroll",
                        "height": "500px"
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