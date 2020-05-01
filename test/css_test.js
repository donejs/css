var QUnit = require("steal-qunit");
var helpers = require("./test-helpers");
var doneCss = require("done-css");

QUnit.module("done-css exports");

// this means done-css will be replaced by steal-css/slim
// during the optimized build
QUnit.test("it sets steal-css/slim as pluginBuilder", function(assert) {
	assert.equal(doneCss.pluginBuilder, "steal-css/slim");
});

QUnit.module("loading modules with deps", function(hooks){
	hooks.afterEach(function(){
		helpers.removeAddedStyles();
	});

	QUnit.test("Works", function(assert){
		var done = assert.async();

		var appCss = "body { }";

		var loader = helpers.clone()
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

QUnit.module("Using with the cache extension", function(hooks){
	var removeNodeFake;
	hooks.beforeEach(function(){
		removeNodeFake = helpers.fakeBeingInNode();
	});

	hooks.afterEach(function(){
		helpers.removeAddedStyles();
		removeNodeFake();
	});

	QUnit.test("Sets the versio query string", function(assert){
		var done = assert.async();
		var cb;

		var loader = helpers.clone()
			.rootPackage({
				name: "app",
				version: "1.0.0",
				main: "main.js",
				steal: {
					env: 'production',
					renderingCacheVersion: 2
				}
			})
			.allowFetch("app@1.0.0#app.css!done-css")
			.loader;

		loader._nodeRequire = function(name) {
			if(name !== "path") throw new Error("Cannot require " + name);
			return {
				relative: function(base, rel) {
					return steal.relativeURI(base, rel);
				}
			}
		};

		loader.set("asset-register", loader.newModule({
			__useDefault: true,
			"default": function(name, type, callback) {
				cb = callback;
			}
		}));

		loader["import"]("app/app.css!done-css")
		.then(function(){
			assert.equal(typeof cb, "function", "registered module");

			var search = steal.parseURI(cb().href).search;
			assert.ok(search.indexOf("?version=2") !== -1);
		}, function(err){
			console.log("err", err);
			assert.ok(!err, err.message);
		}).then(done, done);

	});
});

require("./test-ssr");
require("./test-electron");
