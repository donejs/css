var QUnit = require("steal-qunit");
var helpers = require("./test-helpers");

QUnit.module("Replacing an imported CSS", {
	teardown: function(){
		helpers.removeAddedStyles();
	}
});

QUnit.test("removing CSS module works", function(assert){
	var done = assert.async();

	var runner = helpers.clone()
		.rootPackage({
			name: "app",
			version: "1.0.0",
			main: "main.js",
			system: {
				configDependencies: [
					"node_modules/steal/ext/live-reload"
				]
			}
		})
		.withModule("app@1.0.0#main", "module.exports = require('./app.css!done-css');")
		.withModule("app@1.0.0#app.css!done-css", "body { color: blue; }")
		.withModule("app@1.0.0#other.css!done-css", "body { color: red; }")
		.allowFetch("node_modules/steal/ext/live-reload");

	var loader = runner.loader;

	loader["import"]("app")
	.then(function(){
		var liveReload = loader.get("node_modules/steal/ext/live-reload")["default"];
		runner.withModule("app@1.0.0#main", "module.exports = require('./other.css!done-css');");

		return liveReload("app@1.0.0#main");

	})
	.then(function(){
		var ss = document.styleSheets;
		assert.equal(ss.length, 2, "The app.css stylesheet was removed");
	})
	.then(done, done);
});

QUnit.module("SSR", {
	setup: function(assert){
		var done = assert.async();

		this.runner = helpers.clone()
			.rootPackage({
				name: "app",
				version: "1.0.0",
				main: "main.js",
				system: {
					configDependencies: [
						"node_modules/steal/ext/live-reload"
					]
				}
			})
			.withModule("app@1.0.0#main", "module.exports = require('./app.css!done-css');")
			.withModule("app@1.0.0#app.css!done-css", "body { color: blue; }")
			.withModule("app@1.0.0#other.css!done-css", "body { color: red; }")
			.allowFetch("node_modules/steal/ext/live-reload");

		var head = document.head;
		var style = document.createElement("style");
		style.textContent = "body { color: blue; }";
		style.setAttribute("asset-id", "app@1.0.0#app.css!done-css");
		head.appendChild(style);

		this.runner.loader["import"]("app").then(done, done);
	},

	teardown: function(){
		helpers.removeAddedStyles();
	}
});

QUnit.test("No style is added because it already exists", function(assert){
	var ss = document.styleSheets;
	assert.equal(ss.length, 2, "One the pre-existing stylesheet is there");
});

QUnit.test("Replacing the main module with a different style removes the old one", function(assert){
	var done = assert.async();
	var runner = this.runner, loader = runner.loader;

	var liveReload = loader.get("node_modules/steal/ext/live-reload")["default"];

	runner.withModule("app@1.0.0#main", "require('./other.css!done-css');");

	liveReload("app@1.0.0#main")
	.then(function(){
		var ss = document.styleSheets;
		assert.equal(ss.length, 2, "other.css replaced app.css");
	})
	.then(done, done);
});

QUnit.test("Replacing the existing CSS updates it", function(assert){
	var done = assert.async();
	var runner = this.runner, loader = runner.loader;

	var liveReload = loader.get("node_modules/steal/ext/live-reload")["default"];

	runner.withModule("app@1.0.0#app.css!done-css", "body { color: purple; }");

	liveReload("app@1.0.0#app.css!done-css")
	.then(function(){
		var ss = document.styleSheets;
		assert.equal(ss.length, 2, "still just 2 stylesheets");

		var bodyStyles = window.getComputedStyle(document.body);
		var color = bodyStyles.color;
		assert.equal(color, "rgb(128, 0, 128)", "it is now purple");
	})
	.then(done, done);
});

QUnit.module("Orphaned modules", {
	setup: function(assert){
		var done = assert.async();

		this.runner = helpers.clone()
			.rootPackage({
				name: "app",
				version: "1.0.0",
				main: "main.js",
				system: {
					configDependencies: [
						"node_modules/steal/ext/live-reload"
					]
				}
			})
			.withModule("app@1.0.0#main", "require('./app.css!done-css');require('./other.css!done-css');")
			.withModule("app@1.0.0#app.css!done-css", "body { color: blue; }")
			.withModule("app@1.0.0#other.css!done-css", "body { color: red; }")
			.allowFetch("node_modules/steal/ext/live-reload");

		this.runner.loader["import"]("app").then(done, done);
	},

	teardown: function(){
		helpers.removeAddedStyles();
	}
});

QUnit.test("When a module is orphaned it gets removed", function(assert){
	var done = assert.async();
	var runner = this.runner, loader = runner.loader;

	var ss = document.styleSheets;
	assert.equal(ss.length, 3, "there are initially 3 styles");

	var liveReload = loader.get("node_modules/steal/ext/live-reload")["default"];

	runner.withModule("app@1.0.0#main", "require('./app.css!done-css');");

	liveReload("app@1.0.0#main")
	.then(function(){
		assert.equal(ss.length, 2, "now there are only 2 styles");
	})
	.then(done, done);
});
