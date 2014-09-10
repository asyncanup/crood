var debug = require("./logger");

var path        = require("path"),
    spawn       = require("child_process").spawn,
    exec        = require("child_process").exec,
    cmdLine     = require("./terminal/command"),
    fs          = require("fs"),
    repl        = require("repl"),
    util        = require("util"),
    _           = require("underscore"),
    streams     = require("./terminal/streams");

var shell = process.platform === "win32" ? "cmd" : "bash";

module.exports = function (app) {
    app.socketIO.on("connection", function (socket) {
        var cwd         = process.cwd(),
            env         = _.clone(process.env),
            home        = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
            linebreak   = "\n", // check if we need to add \r\n for windows
            promptChar  = process.platform === "win32" ? ">" : "$",
            stdin,
            args,
            cmd,
            proc,
            dir,
            replSrv;

        function execCmd(command, terminate) {
            var opts = { cwd: cwd, env: env };
            proc = spawn(shell, null, opts);
            stdin = proc.stdin;
            stdin.write(command + linebreak);
            if (terminate) {
                stdin.end();
            }

            proc.on("error", function (err) {
                if (err.code === "ENOENT") {
                    err.message = cmd + ": command not found";
                }
                socket.emit("console", err.message);
            });

            proc.stdout.setEncoding("utf8");
            proc.stdout.on("data", function (data) {
                socket.emit("console", data);
            });

            proc.stderr.setEncoding("utf8");
            proc.stderr.on("data", function (data) {
                if (data.indexOf("execvp():") === 0) {
                    data = cmd + ": command not found";
                }
                socket.emit("console", data);
            });

            proc.on("close", function () {
                stdin = null;
                socket.emit("exit", "");
            });
        }
        function startRepl() {
            var input   = streams.ReplStream(),
                output  = streams.ReplStream();

            input.setEncoding("utf8");
            output.setEncoding("utf8");

            stdin = input;
            output.on("data", function (data) {
                socket.emit("console", data);
            });

            replSrv = repl.start({
                prompt: "> ",
                input: input,
                output: output,
                terminal: false,
                useColors: true
            });

            replSrv.on("exit", function () {
                stdin = null;
                socket.emit("configure", {
                    prompt      : cwd,
                    promptChar  : promptChar
                });
                socket.emit("exit");
                replSrv = null;
            });

            socket.emit("configure", {
                prompt      : "",
                promptChar  : ">"
            });
        }

        socket.on("terminal-path", function (terminalPath) {
            cwd = path.resolve(terminalPath);
            console.log('terminal-path', cwd);
            socket.emit('terminal-path-set');
        });

        socket.on("disconnect", function () {
            if (app.socketIO.clients().length === 0) {
                server.close();
            }
        });

        socket.on("signal", function (signal) {
            var cmd;

            if (replSrv) {
                switch (signal) {
                case "SIGINT":
                    cmd = ".break";
                    break;
                case "SIGQUIT":
                    cmd = ".exit";
                    break;
                }
                stdin.write(cmd + linebreak);
            } else if (proc) {
                proc.kill(signal);
            }
        });

        socket.on("console", function (command) {
            var i, arg, basePath;

            if (stdin) {
                stdin.write(command + linebreak);
            } else {
                args    = cmdLine.parse(command);
                cmd     = args.splice(0, 1)[0];

                switch (cmd) {
                case "cd":
                    arg = args[0];
                    if (arg[0] === "~") {
                        basePath = home;
                        arg = arg.substring(2);
                    } else {
                        basePath = cwd;
                    }
                    dir = path.resolve(basePath, arg);
                    fs.exists(dir, function (exists) {
                        var msg;
                        if (exists) {
                            cwd = dir;
                            msg = "cwd: " + cwd;
                        } else {
                            msg = "No such file or directory";
                        }
                        socket.emit("exit", msg);
                    });
                    break;
                case "export":
                    for (i = 0; i < args.length; i++) {
                        arg = args[i].split("=");
                        env[arg[0]] = arg[1];
                    }
                    socket.emit("exit");
                    break;
                case "unset":
                    for (i = 0; i < args.length; i++) {
                        delete env[args[i]];
                    }
                    socket.emit("exit");
                    break;
                case "ls":
                    if (command.length === 2) {
                        command += " --color -C";
                    }
                    execCmd(command);
                    break;
                case "node":
                    if (args.length === 0) {
                        startRepl();
                    } else {
                        execCmd(command);
                    }
                    break;
                case "echo":
                    execCmd(command, true);
                    break;
                default:
                    execCmd(command);
                }
            }
        });

        function begin() {
            socket.emit("configure", {
                srvOS       : process.platform,
                prompt      : cwd,
                promptChar  : promptChar
            });
            socket.emit("exit");
        }

        begin();
    });
};