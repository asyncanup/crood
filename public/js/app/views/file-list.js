define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        Handlebars = require("handlebars");

    module.exports = Backbone.View.extend({
        className: "file-list",
        template: Handlebars.compile(require("text!templates/file-list.html")),

        initialize: function () {
            this.editorModel = this.options.editorModel;
            this.listenTo(this.collection, "reset", this.render);
        },

        events: {
            "change .folder-input": function () {
                var folderPath = this.folderPath = this.$(".folder-input").val();
                if (folderPath) {
                    this.collection.refreshFileList(folderPath);
                }
            },
            "click .nav-list li a": function (event) {
                var index = $(event.target).closest("li").index(),
                    fileItem = this.collection.at(index),
                    filePath = this.folderPath + "\\" + fileItem.get("fileName");

                if (!fileItem.get("isFolder")) {
                    this.editorModel.set("filePath", filePath);
                }
                event.preventDefault();
            }
        },

        render: function () {

            this.$el.html(this.template({
                folderPath: this.folderPath,
                files: this.collection.toJSON()
            }));
            return this;
        }
    });
});