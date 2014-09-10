define(function (require, exports, module) {
    "use strict";

    var Backbone = require("backbone"),
        Handlebars = require("handlebars"),
        Terminal = require("term");
    
    var ui = require("utils/ui"),
        socket = require("utils/socket"),
        debug = require("utils/debug")(module.id);
    
    module.exports = Backbone.View.extend({
        el: "body",
        
        template: Handlebars.compile(require("text!templates/terminal.html")),

        initialize: function () {
            this.model = new Backbone.Model({
                terminalPath: ui.getQueryStringParameter("terminalPath"),
                linePos: -1,
                currentLine: '',
                scrolling: false,
                prompt: '>',
                promptChar: '',
                cursorPos: 0,
                uiLineIdx: 0
            });

            this.lines = [''];

            socket.on("configure", function (data) {
                debug('terminal-configure', data);
                if (data.srvOS) {
                    this.srvOS = data.srvOS;
                }
                if (data.prompt || data.prompt === "") {
                    this.model.set('prompt', data.prompt);
                }
                if (data.promptChar) {
                    this.model.set('promptChar', data.promptChar);
                }
                this.channel = "console";
            }.bind(this));

            socket.on("exit", function (data) {
                debug('terminal-exit', data);
                this.clearCursor();
                if (data) {
                    if (data.indexOf("cwd: ") === 0) {
                        this.model.set('prompt', data.substr(5));
                    } else {
                        this.appendContent(data);
                    }
                }
                this.addNewLine();
            }.bind(this));

            socket.on("console", function (data) {
                debug('terminal-console', data);
                this.clearCursor();
                this.appendContent(convertToHtml(data));
                this.addPromptLine();
            }.bind(this));
        },

        events: {
            'keydown': function (e) {
                var part1, part2;

                var currentLine = this.model.get('currentLine'),
                    cursorPos = this.model.get('cursorPos'),
                    linePos = this.model.get('linePos');

                debug('keydown', this.model.toJSON(), e.keyCode);
                switch (e.keyCode) {
                case 8: // Backspace
                    e.stopImmediatePropagation();
                    if (currentLine.length > 0) {
                        if (cursorPos === currentLine.length) {
                            this.model.set('currentLine', currentLine.slice(0, -1));
                        } else {
                            part1 = currentLine.substr(0, cursorPos - 1);
                            part2 = currentLine.substr(cursorPos);
                            this.model.set('currentLine', part1 + part2);
                        }

                        this.model.set('cursorPos', cursorPos - 1);
                        this.moveCursor();
                    }
                    return false;
                case 46: // Delete
                    e.stopImmediatePropagation();
                    if (currentLine.length > cursorPos) {

                        part1 = currentLine.substr(0, cursorPos);
                        part2 = currentLine.substr(cursorPos + 1);
                        this.model.set('currentLine', part1 + part2);

                        this.moveCursor();
                    }
                    return false;
                case 38: // Up Arrow
                    e.stopImmediatePropagation();
                    if (linePos < this.lines.length - 1) {
                        this.model.set('linePos', linePos + 1);
                        this.recall();
                    }
                    return false;
                case 40: // Down Arrow
                    e.stopImmediatePropagation();
                    if (linePos > 0) {
                        this.model.set('linePos', linePos - 1);
                        this.recall();
                    }
                    return false;
                case 37: // Left Arrow
                    e.stopImmediatePropagation();
                    if (cursorPos > 0) {
                        this.model.set('cursorPos', cursorPos - 1);
                        this.moveCursor();
                    }
                    return false;
                case 39: // Right Arrow
                    e.stopImmediatePropagation();
                    if (cursorPos <= currentLine.length) {
                        this.model.set('cursorPos', cursorPos + 1);
                        this.moveCursor();
                    }
                    return false;
                }
            },


            'keyup': function (e) {
                if (e.ctrlKey) {

                    var charCode = (typeof e.which === "number") ? e.which : e.keyCode;

                    switch (charCode) {
                    case 67:
                        debug('keyup', 'Ctrl-C');
                        e.stopImmediatePropagation();
                        socket.emit("signal", "SIGINT");
                        this.appendContent("^C");
                        break;
                    case 68:
                        e.stopImmediatePropagation();
                        socket.emit("signal", "SIGQUIT");
                        this.appendContent("^D");
                        break;
                    }
                }
            },

            'keypress': function (e) {
                var currentLine = this.model.get('currentLine'),
                    cursorPos = this.model.get('cursorPos');

                var charCode = (typeof e.which === "number") ? e.which : e.keyCode,
                    letter = String.fromCharCode(charCode),
                    part1,
                    part2;

                e.stopImmediatePropagation();

                // Handle 'enter'.
                if (charCode === 13) {
                    debug('keypress', 'Enter');
                    this.clearCursor(true);
                    if (currentLine.length > 0) {
                        // Send...
                        if (currentLine === "exit") {
                            socket.disconnect();
                            window.open('', '_self', '');
                            window.close();
                        } else {
                            this.appendContent("<br />");
                            socket.emit(this.channel, currentLine);
                            if (currentLine !== this.lines[1]) {
                                this.lines.splice(1, 0, currentLine);
                            }
                            this.model.set('currentLine', "");
                            this.model.set('linePos', 0);
                        }
                    } else {
                        this.addNewLine();
                    }
                } else if (letter && letter.match(/^[^\x00-\x1F\x80-\x9F]+$/)) {
                    debug('keypress', 'letter');
                    if (cursorPos === currentLine.length) {
                        this.model.set('currentLine', currentLine + letter);
                    } else {
                        part1 = currentLine.substr(0, cursorPos);
                        part2 = currentLine.substr(cursorPos);
                        this.model.set('currentLine', part1 + letter + part2);
                    }
                    if (letter === " ") {
                        letter = "&nbsp;";
                    }
                    this.uiLineCnt.append(letter);
                    this.model.set('cursorPos', cursorPos + 1);
                }
            }
        },

        appendContent: function (data) {
            var content = this.$el,
                el = this.el,
                model = this.model,
                scrolling = model.get('scrolling');

            content.append(data);
            // Magic number, this fix buggy scroll behavior on mobile browsers
            // when the content height is shorter than window's height.
            var mobile_magic = 0.7;
            if (!scrolling && content.height() > $(window.document).height() * mobile_magic) {
                model.set('scrolling', true);
                window.setTimeout(function () {
                    content.animate({ scrollTop: el.scrollHeight }, 500);
                    model.set('scrolling', false);
                }, 10);
            }
        },

        recall: function () {
            this.model.set('currentLine', this.lines[this.model.get('linePos')]);
            this.uiLineCnt.text(this.model.get('currentLine'));
            this.model.set('cursorPos', this.model.get('currentLine').length);
        },

        clearCursor: function (leavePrompt) {
            if (this.cursor) {
                this.cursor.remove();
                this.cursor = null;
            }
            if (this.uiLineSuf) {
                this.uiLineSuf.remove();
                this.uiLineSuf = null;
            }
            if (this.uiLineCnt) {
                if (this.model.get('currentLine').length > 0 || leavePrompt) {
                    this.uiLineCnt.text(this.model.get('currentLine'));
                } else {
                    this.uiLineWrp.remove();
                }
                this.uiLineCnt = null;
            }
        },

        moveCursor: function () {
            var currentLine = this.model.get('currentLine'),
                cursorPos = this.model.get('cursorPos');

            this.uiLineCnt.text(currentLine.substr(0, cursorPos));
            if (cursorPos === currentLine.length) {
                this.cursor.html("&nbsp;");
                this.uiLineSuf.text("");
            } else {
                this.cursor.text(currentLine[cursorPos]);
                this.uiLineSuf.text(currentLine.substr(cursorPos + 1));
            }
        },

        addPromptLine: function () {
            var uiLineIdx = this.model.get('uiLineIdx');
            var id = "ln" + (++uiLineIdx);
            this.model.set('uiLineIdx', uiLineIdx);
            this.appendContent("<span id=\"" + id + "\">&nbsp;<span id=\"lnCnt\"></span><span id=\"cursor\" class=\"inverse\">&nbsp;</span><span id=\"lnSuf\"></span></span>");
            this.uiLineWrp = $("#" + id);
            this.uiLineCnt = this.uiLineWrp.find("#lnCnt");
            this.uiLineSuf = this.uiLineWrp.find("#lnSuf");
            this.cursor = this.uiLineWrp.find("#cursor");
            this.model.set('cursorPos', 0);

            // Trigger a global event
            this.trigger('cursor:ready');
        },

        addNewLine: function () {
            var uiLineIdx = this.model.get('uiLineIdx');
            var id = "ln" + (++uiLineIdx);
            this.model.set('uiLineIdx', uiLineIdx);
            this.appendContent("<div id=\"" + id + "\">" + this.model.get('prompt') + this.model.get('promptChar') + "&nbsp;<span id=\"lnCnt\"></span><span id=\"cursor\" class=\"inverse\">&nbsp;</span><span id=\"lnSuf\"></span></div>");
            this.uiLineWrp = $("#" + id);
            this.uiLineCnt = this.uiLineWrp.find("#lnCnt");
            this.uiLineSuf = this.uiLineWrp.find("#lnSuf");
            this.cursor = this.uiLineWrp.find("#cursor");
            this.model.set('cursorPos', 0);

            // Trigger a global event
            this.trigger('cursor:ready');
        },
        
        render: function () {
            return this;
        }
    });

    var index = {};
    var zvt100 = {
        ""      : ["", false],
        "0"     : ["", false],
        "1"     : ["<b>", "</b>"],
        "01"    : ["<b>", "</b>"],
        "22"    : ["</b>", true],
        "3"     : ["<i>", "</i>"],
        "03"    : ["<i>", "</i>"],
        "23"    : ["</i>", true],
        "4"     : ["<u>", "</u>"],
        "04"    : ["<u>", "</u>"],
        "24"    : ["</u>", true],
        "7"     : ["<span class=\"inverse\">", "</span>"],
        "07"    : ["<span class=\"inverse\">", "</span>"],
        "27"    : ["</span>", true],
        "9"     : ["<del>", "</del>"],
        "09"    : ["<del>", "</del>"],
        "29"    : ["</del>", true],
        "39"    : ["</span>", true],
        "90"    : ["<span style=\"color:grey;\">", "</span>"],
        "30"    : ["<span style=\"color:black;\">", "</span>"],
        "31"    : ["<span style=\"color:red;\">", "</span>"],
        "32"    : ["<span style=\"color:green;\">", "</span>"],
        "33"    : ["<span style=\"color:yellow;\">", "</span>"],
        "34"    : ["<span style=\"color:blue;\">", "</span>"],
        "35"    : ["<span style=\"color:magenta;\">", "</span>"],
        "36"    : ["<span style=\"color:cyan;\">", "</span>"],
        "37"    : ["<span style=\"color:white;\">", "</span>"],
        "40"    : ["<span style=\"background-color:black;\">", "</span>"],
        "41"    : ["<span style=\"background-color:red;\">", "</span>"],
        "42"    : ["<span style=\"background-color:green;\">", "</span>"],
        "43"    : ["<span style=\"background-color:yellow;\">", "</span>"],
        "44"    : ["<span style=\"background-color:blue;\">", "</span>"],
        "45"    : ["<span style=\"background-color:magenta;\">", "</span>"],
        "46"    : ["<span style=\"background-color:cyan;\">", "</span>"],
        "47"    : ["<span style=\"background-color:white;\">", "</span>"]
    };

    function addSequence(seq, val, closure) {

        var prnt    = index,
            len     = seq.length - 1,
            chld,
            prop,
            i;

        for (i = 0; i <= len; i++) {
            prop = seq.charAt(i);
            chld = prnt[prop];

            if (!chld) {
                prnt[prop] = chld = (i === len) ? { sequance: seq, value: val, closure: closure} : {};
            }
            prnt = chld;
        }
    }

    // Build the index
    //
    addSequence("\n", "<br />");
    addSequence("\r\n", "<br />");
    addSequence("\t", "&nbsp;&nbsp;&nbsp;&nbsp;");
    addSequence("  ", "&nbsp;&nbsp;");
    addSequence("\x1B[", parseVT100);


    function parseVT100(i, data, closures) {
        var code    = "",
            output  = "",
            val,
            curr,
            clsr;

        while (true) {
            curr = data[++i];
            if (curr === "m" || curr === ";") {
                val = vt100[code];
                if (val) {
                    output += val[0];
                    clsr = val[1];

                    if (clsr === true) {
                        closures.pop();
                    } else if (clsr === false) {
                        while (closures.length > 0) {
                            output += closures.pop();
                        }
                    } else if (clsr) {
                        closures.push(clsr);
                    }

                    if (curr === ";") {
                        code = "";
                        continue;
                    } else {
                        break;
                    }
                } else {
                    output += code;
                    break;
                }
            } else if (i === data.length) {
                output += code;
                break;
            }
            code += curr;
        }

        return { output: output, i: i };
    }

    function convertToHtml(data) {

    var i,
        chr,
        output      = "",
        idx         = index,
        seq         = 0,
        closures    = [],
        res;


    for (i = 0; i < data.length; i++) {
        chr = data[i];
        idx = idx[chr];
        if (idx) {
            switch (typeof idx.value) {
            case "string":
                output += idx.value;
                idx = index;
                seq = 0;
                break;
            case "function":
                res = idx.value(i, data, closures);
                i = res.i;
                output += res.output;
                idx = index;
                seq = 0;
                break;
            default:
                seq++;
                break;
            }
        } else {
            idx = index;

            if (seq > 0) {
                i = i - seq;
                seq = 0;
                chr = data[i];
            }
            switch (chr) {
            case "<":
                chr = "&lt;";
                break;
            case ">":
                chr = "&gt;";
                break;
            case "&":
                chr = "&amp;";
                break;
            case "\"":
                chr = "&quot;";
                break;
            case "'":
                chr = "&#39;";
                break;
            }
            output += chr;
        }
    }

    return output;
}


});