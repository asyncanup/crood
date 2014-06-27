define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        $ = require("jquery"),
        _ = require("underscore");
    
    var EditorView = require("views/editor"),
        FileListView = require("views/file-list");

    var EditorModel = require("models/editor"),
        FileListCollection = require("models/file-list-collection");
        
    var path = require("utils/path"),
        ui = require("utils/ui");

    module.exports = Backbone.View.extend({
        el: "body",

        initialize: function () {
            var editorModel = window.editorModel = this.editorModel = new EditorModel();

            editorModel.updateFromQueryString();
            
            $(window).on("popstate", editorModel.updateFromQueryString.bind(editorModel));
            editorModel.on("change:filePath change:folderPath", function () {
                ui.updateQueryString(editorModel.toJSON());
            });
            
            editorModel.on("change:filePath", this.changePageTitle, this);

            this.editor = new EditorView({
                model: this.editorModel
            });

            this.fileListCollection = new FileListCollection();
            this.fileList = new FileListView({
                model: this.editorModel,
                collection: this.fileListCollection
            });
        },
        
        changePageTitle: function (editorModel) {
            var filePath = editorModel.get("filePath"),
                filePathParts = filePath.split(path.getSeparator(filePath)),
                fileName = filePathParts[filePathParts.length - 1];
                
            ui.changePageTitle(fileName + " - Crood");
        },

        render: function () {
            this.$el.empty()
                .append(this.editor.render().el)
                .append(this.fileList.render().el);
        }
    });
});