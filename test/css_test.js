var QUnit = require("steal-qunit");
var helpers = require("steal-test-helpers")(System);
var pkg = require("../package.json");

function clone(){
	var name = "done-css@" + pkg.version + "#css";

	return helpers.clone()
		.withModule("done-css", System.getModuleLoad(name).source);
}

QUnit.module("loading modules with deps", function(hooks){
	hooks.afterEach(function(){
		// clean up by removing each style until you get to the qunit one
		removeUntilQUnit(document.head.lastChild);

		function removeUntilQUnit(style) {
			if(style.tagName === "STYLE" && !/QUnit/.test(style.innerHTML)) {
				style.parentNode.removeChild(style);
				removeUntilQUnit(document.head.lastChild);
			}
		}
	});

	QUnit.test("Works", function(assert){
		var done = assert.async();

		var appCss = "body { }";

		var loader = clone()
			.rootPackage({
				name: "app",
				version: "1.0.0",
				main: "main.js"
			})
			.withModule("app@1.0.0#app.css!done-css", appCss)
			.withModule("dep.css!done-css", "foo { }")
			.loader;

		loader.config({
			meta: {
				"app@1.0.0#app.css!done-css": {
					deps: ["dep.css!done-css"]
				}
			}
		});

		loader["import"]("app/app.css!done-css")
		.then(function(){
			var head = document.head;

			var app = head.lastChild;
			assert.ok(/app.css/.test(app.innerHTML), "app is last");

			var dep = app.previousSibling;
			assert.ok(/dep.css/.test(dep.innerHTML), "dep is next to last");
		}, function(err){
			console.log("err", err);
			assert.ok(!err, err.message);
		}).then(done, done);

	});
});