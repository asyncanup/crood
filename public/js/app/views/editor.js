define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        _ = require("underscore"),
        $ = require("jquery"),
        ace = require("ace/ace"),
        animate = require("utils/animate"),
        debug = require("utils/debug")("views/editor"),
        path = require("utils/path"),
        shell = require("utils/shell");

    var editorElementId = "editor";

    module.exports = Backbone.View.extend({
        tagName: "pre",

        initialize: function () {
            this.$el.attr("id", this.elementId);

            this.listenTo(this.model, "change:filePath", this.loadFile);
            this.listenTo(this.model, "change:fileExt", this.setSyntaxMode);
        },

        events: {
            "drop": function (event) {
                var _this = this,
                    filePath = this.dummyFilePath;

                var files = event.originalEvent.dataTransfer.files;

                if (files.length) {
                    _this.model.set("filePath", filePath);
                    return false;
                }
            }
        },

        isCursorChangeHandlerActive: true,
        disableCursorChangeHandler: function () {
            this.isCursorChangeHandlerActive = false;
        },
        enableCursorChangeHandler: function () {
            this.isCursorChangeHandlerActive = true;
        },
        
        loadFile: function () {
            var filePath = this.model.get("filePath"),
                _this = this;
            
            if (!filePath) {
                debug("No file to show!");
                this.changeContent(this.helpContent);
                this.model.set("fileExt", this.defaultFileExt);
                return;
            }
            var fileExt = path.extname(filePath) || this.defaultFileExt;
            this.model.set("fileExt", fileExt);

            debug("Fetching file: " + filePath);
            var model = this.model;
            $.getJSON("cat?path=" + filePath, function (res) {
                debug("File data successfully fetched!");
                _this.changeContent(res.data);
            });
        },

        setSyntaxMode: function () {
            var fileExt = this.model.get("fileExt"),
                syntaxMode = this.modes[fileExt] || fileExt;

            debug("Setting syntax mode to: " + syntaxMode);
            this.aceEditor.getSession().setMode("ace/mode/" + syntaxMode);
        },

        changeContent: function (content) {
            var contentArea = this.contentAreaCss ? this.$el.find(this.contentAreaCss) : this.$el,
                editor = this.aceEditor,
                _this = this;

            if (content !== editor.getValue()) {
                debug("Changing content");
                animate.slideOutIn(
                    contentArea,
                    function () {
                        _this.disableCursorChangeHandler();

                        editor.setValue(content);
                        editor.clearSelection();
                        editor.getSession().setScrollTop(0);
                        editor.moveCursorToPosition(_this.getLastCursorPosition());

                        _this.enableCursorChangeHandler();
                    },
                    "left"
                );
            }
        },

        lastPositionKey: function (filePath) {
            if (!filePath) {
                return "";
            }
            return this.lastPositionPrefix + filePath;
        },

        getLastCursorPosition: function () {
            var filePath = this.model.get("filePath"),
                lastPosition = window.localStorage.getItem(this.lastPositionKey(filePath));
            
            if (!lastPosition) {
                return {row: 0, column: 0};
            }

            debug("Got last cursor position for this file: " + lastPosition);
            return JSON.parse(lastPosition);
        },

        setLastCursorPosition: _.throttle(function () {
            var cursorPosition = this.aceEditor.getCursorPosition(),
                filePath = this.model.get("filePath"),
                lastPosition;
            try {
                lastPosition = JSON.stringify(cursorPosition);
            } catch (e) {
                debug("Could not serialize current cursor position.", cursorPosition);
                return false;
            }
            debug("Saving last cursor position in file: " + filePath, "\nto: " + lastPosition);
            window.localStorage.setItem(this.lastPositionKey(filePath), lastPosition);
            return true;
        }, 1000),

        setTheme: function (themeName) {
            themeName = themeName || this.defaultTheme;

            debug("Setting theme to: " + themeName);
            this.aceEditor.setTheme("ace/theme/" + themeName);
        },

        initializeAceEditor: function () {
            var _this = this;
            _.defer(function () {
                try {
                    debug("Initializing Ace editor on div: #" + _this.elementId);
                    _this.$el.hide();
                    _this.aceEditor = window.editor = ace.edit(_this.elementId);

                    if (_this.model.get("filePath")) {
                        _this.loadFile();
                    } else {
                        _this.aceEditor.setValue(_this.helpContent);
                    }
                    
                    _this.aceEditor.clearSelection();
                    _this.aceEditor.gotoLine(1);
                    _this.setTheme();
                    _this.aceEditor.getSession().selection.on("changeCursor", function (e) {
                        if (_this.isCursorChangeHandlerActive) {
                            _this.setLastCursorPosition();
                        }
                    });
                    _this.aceEditor.commands.addCommand({
                        name: "saveFile",
                        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                        exec: function(editor) {
                            var filePath = _this.model.get("filePath"),
                                contents = _this.aceEditor.getValue();
                                
                            shell.saveFile(filePath, contents, function (res){
                                if (res.success) {
                                    debug("File saved: " + filePath);
                                    animate.saveSuccessful(_this.$el);
                                } else {
                                    debug("Could not save file to disk: " + filePath);
                                    animate.saveFailure(_this.$el);
                                }
                            });
                        },
                        readOnly: true // false if this command should not apply in readOnly mode
                    });

                    _this.$el.fadeIn();
                    _this.trigger("initialized");
                } catch (err) {
                    debug(err.message, err.stack);
                }
            });
        },

        render: function () {
            if (!this.aceEditor) {
                this.initializeAceEditor();
            }
            return this;
        },

        modes: {
            "js": "javascript",
            "md": "markdown",
            "cs": "csharp"
        },

        fileExtRegExp: /\.[^.]+$/,
        defaultFileExt: "text",
        dummyFilePath: "C:\\Users\\nagarro1\\Desktop\\code\\crood\\public\\css\\main.css",
        defaultTheme: "solarized_light",
        elementId: editorElementId,
        contentAreaCss: null,
        lastPositionPrefix: "lastPosition-",
        helpContent: "Enter a folder path in the input box →"
    });
});