var app = require("apper")();

if (app.init()) {
	app.start(8000, function () {
		console.log("Serving on " + this.address().port);
	});
}