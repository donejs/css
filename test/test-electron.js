var QUnit = require("steal-qunit");
var helpers = require("./test-helpers");
require("done-css");

QUnit.module("Electron", {
	setup: function(){
		this.resetEnv = helpers.fakeBeingInElectron();
	},
	teardown: function(){
		helpers.removeAddedStyles();
		this.resetEnv();
	}
});

QUnit.test("Appends in production mode", function(assert){
	var done = assert.async();

	var loader = helpers.clone()
		.rootPackage({
			name: "app",
			main: "main.js",
			version: "1.0.0"
		})
		.allowFetch("app@1.0.0#test/basics/style.css!done-css")
		.loader;

	loader.env = "production";

	loader["import"]("app/test/basics/style.css!done-css")
	.then(function(){
		assert.ok(true, "It loaded successfully.");
	})
	.then(done)
	.catch(function(err){
		console.error(err);
		done(err);
	});
});
