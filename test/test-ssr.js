var QUnit = require("steal-qunit");
var helpers = require("./test-helpers");
require("done-css");

QUnit.module("SSR", {
	setup: function(){
		this.resetEnv = helpers.fakeBeingInNode();
	},
	teardown: function(){
		helpers.removeAddedStyles();
		this.resetEnv();
	}
});

QUnit.test("Registers in development mode", function(assert){
	var done = assert.async();

	var loader = helpers.clone()
		.rootPackage({
			name: "app",
			main: "main.js",
			version: "1.0.0"
		})
		.withModule("app@1.0.0#app.css!done-css", "body {}")
		.loader;

	loader.set("asset-register", loader.newModule({
		default: function(moduleName, type, cb){
			assert.equal(moduleName, "app@1.0.0#app.css!done-css");
			assert.equal(type, "css");
			assert.equal(typeof cb, "function");
		},
		__useDefault: true
	}));

	loader["import"]("app/app.css!done-css")
	.then(function(){
		done();
	}, done);
});
