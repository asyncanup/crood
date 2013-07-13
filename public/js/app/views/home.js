define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        $ = require("jquery"),
        _ = require("underscore");
    
    var EditorView = require("views/editor"),
        FileListView = require("views/file-list");

    var EditorModel = require("models/editor"),
        FileListCollection = require("models/file-list-collection");

    module.exports = Backbone.View.extend({
        el: "body",

        initialize: function () {
            var editorModel = window.editorModel = this.editorModel = new EditorModel();
            editorModel.updateFromQueryString();

            $(window).on("popstate", editorModel.updateFromQueryString.bind(editorModel));
            editorModel.on("change:filePath change:folderPath", editorModel.updateQueryString.bind(editorModel));

            this.editor = new EditorView({
                model: this.editorModel
            });

            this.fileListCollection = new FileListCollection();
            this.fileList = new FileListView({
                model: this.editorModel,
                collection: this.fileListCollection
            });
        },

        render: function () {
            this.$el.empty()
                .append(this.editor.render().el)
                .append(this.fileList.render().el);
        }
    });
});