var app = require("apper")();

if (app.init()) {
	app.start(8000);
}