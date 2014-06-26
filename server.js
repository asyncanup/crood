var app = require("apper")();

if (app.init()) {
	app.start(8000, "0.0.0.0", function () {
		console.log("Serving on " + this.address().port);
	});
}