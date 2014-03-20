define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        Handlebars = require("handlebars"),
        $ = require("jquery"),
        _ = require("underscore");

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
            
            var _this = this,
                timeout;
            var el = _this.$el;
            el.hover(function () {
                if (_this.timeout) clearTimeout(_this.timeout);
                el.addClass("visible");
            }, function () {
                el.addClass("visible");
                if (el.find("input").is(":focus")) {
                    el.find("input").one("blur", setTheTimeout);
                } else {
                    setTheTimeout();
                }
                
                function setTheTimeout() {
                    _this.timeout = setTimeout(function () {
                        el.removeClass("visible");
                    }, 2000);
                }
            });
        },

        events: {
            "change .folder-input": function () {
                var folderPath = this.$(".folder-input").val();
                
                shell.listFiles(path.addSeparatorIfNotPresent(folderPath), function (res) {
                    if (res.success) {
                        this.model.set("folderPath", folderPath);
                    } else {
                        debug("Wrong folder path in folder input: " + folderPath);
                        this.$el.find(".folder-input-container").addClass("error");
                    }
                }.bind(this));
            },
            
            "click .nav-list li": function (event) {
                if (event.metaKey || event.ctrlKey) return;
                event.preventDefault();
                
                var el = this.$(event.target).closest("li"),
                    index = el.index();

                this.$(".nav-list li").removeClass("active");
                el.addClass("active");
                el.find("i").addClass("icon-white");
                this.selectItem(this.collection.at(index));
            },

            "click .folder-up-button": function (event) {
                if (event.metaKey || event.ctrlKey) return;
                event.preventDefault();
                
                var el = this.$(".folder-up-button");
                var upFolder = path.upFolder(this.$(".folder-input").val());
                if (upFolder) {
                    el.addClass("btn-primary");
                    el.find("i").addClass("icon-white");
                    this.model.set("folderPath", upFolder);
                }
            },
            
            "click .new-file-button": function (event) {
                var el = $(event.target).closest(".new-file-button"),
                    icon = el.find("i");
                
                this.selectButton(el);
                
                var fileName = prompt("Enter a file name:");
                if (fileName) {
                    var filePath = path.join(this.model.get("folderPath"), fileName);
                    shell.saveFile(filePath, "", function (res) {
                        if (res.success) {
                            this.collection.push({
                                fileName: fileName,
                                isFolder: false
                            });
                            this.model.set("filePath", filePath);
                        } else {
                            debug("Could not create file: " + fileName);
                        }
                    }.bind(this));
                } else {
                    this.unSelectButton(el);
                }
            },
            
            "click .new-folder-button": function (event) {
                var el = $(event.target).closest(".new-folder-button"),
                    icon = el.find("i");
                    
                this.selectButton(el);
                
                var folderName = prompt("Enter a folder name:");
                if (folderName) {
                    var folderPath = path.join(this.model.get("folderPath"), folderName);
                    shell.createFolder(folderPath, function (res) {
                        if (res.success) {
                            // this.collection.push({
                            //     fileName: folderName,
                            //     isFolder: true
                            // });
                            this.model.set("folderPath", folderPath);
                        } else {
                            debug("Could not create folder: " + folderName);
                        }
                    }.bind(this));
                } else {
                    this.unSelectButton(el);
                }
            }
        },
        
        selectButton: function (btn) {
            btn.addClass("btn-primary");
            btn.find("i").addClass("icon-white");
        },
        
        unSelectButton: function (btn) {
            btn.removeClass("btn-primary");
            btn.find("i").removeClass("icon-white");
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
            var folderPath = this.model.get("folderPath"),
                inputContainer = this.$el.find(".folder-input").closest(".folder-input-container");
            
            if (folderPath) {
                shell.listFiles(path.addSeparatorIfNotPresent(folderPath), function (res) {
                    function isFolder(file) { return file.isFolder; }
                    
                    if (res.success) {
                        var files = res.data;
                        if (!path.separator) {
                            path.separator = res.pathSeparator;
                        }
    
                        var folders = _.select(files, isFolder);
                        var pureFiles = _.reject(files, isFolder);
                        
                        this.collection.reset(_.flatten([folders, pureFiles]));
                    } else {
                        debug("Wrong folder path: " + folderPath);
                        this.collection.reset([]);
                    }
                }.bind(this));
            }
        },

        render: function () {
            // TODO: animate
            var el = this.$el,
                items = this.collection,
                model = this.model,
                folderPath = model.get("folderPath"),
                filePath = model.get("filePath"),
                previousFolderPath = model.previous("folderPath") || "",
                _this = this;

            items.forEach(function (item) {
                item.set("isActive", false);
                if (path.join(folderPath, item.get("fileName")) === filePath) {
                    item.set("isActive", true);
                }
            });

            function render() {
                localStorage.setItem(
                    "scrollTop-" + previousFolderPath,
                    el.find(".nav-list").scrollTop()
                );
                
                el.empty();
                if (_this.timeout) {
                    clearTimeout(_this.timeout);
                }
                el.addClass("visible");
                _this.timeout = setTimeout(function () {
                    el.removeClass("visible");
                }, 2000);
                if (folderPath) {
                    el.append(_this.folderUpButtonTemplate({
                        upFolderPath: path.upFolder(folderPath)
                    }));
                    el.append(_this.newFileButtonsTemplate());
                }
                el.append(_this.folderInputTemplate({
                    folderPath: folderPath
                }));
                el.append(_this.fileListTemplate({
                    files: _.map(items.toJSON(), function (item) {
                        item.filePath = path.join(folderPath, item.fileName);
                        item.folderPath = folderPath;
                        return item;
                    })
                }));
                if (el.find("li").hasClass("active")) {
                    $(".ace_editor").find("textarea").focus();
                }
                
                if (!items.length) {
                    el.find(".new-file-button").addClass("centered");
                    el.find(".new-folder-button").addClass("centered");
                }
                
                var folderInputEl = el.find(".folder-input")[0];
                folderInputEl.scrollLeft = folderInputEl.scrollWidth;
                
                var fileListEl = el.find(".nav-list"),
                    windowHeight = $(window).height(),
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
                    fileListEl.find("li").css("width", "100%");
                }
                
                fileListEl.scrollTop(localStorage.getItem("scrollTop-" + folderPath) || 0);
            }

            if (previousFolderPath.length === folderPath.length) {
                render();
            } else {
                var direction = previousFolderPath.length < folderPath.length ? "left" : "right";
                if (direction === "left") {
                    animate.zoomOutSlideOutIn(el, render, "left");
                } else {
                    animate.zoomInSlideOutIn(el, render, "right");
                }
            }

            return this;
        }
    });
});
