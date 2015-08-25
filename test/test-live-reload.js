var QUnit = require("steal-qunit");
var liveReloadTest = require("live-reload-testing");
var F = require("funcunit");

F.attach(QUnit);

QUnit.module("live-reload", {
	setup: function(assert){
		var done = assert.async();
		F.open("//live/index.html", function(){
			done();
		});
	},
	teardown: function(assert){
		var done = assert.async();
		liveReloadTest.reset().then(function(){
			done();
		});
	}
});

QUnit.test("changing css modules works", function(){
	F("style").exists("the initial style was added to the page");

	F(function(){
		var address = "test/live/basics.js";
		var content = "require('./other.css!');";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Changing css was not successful");
			QUnit.start();
		});
	});

   F("#app").exists().height(20, "The height is now correct");
});

QUnit.test("removing a css module from the graph causes it to be removed from the page", function(){
	F("style").exists("The initial style was added to the page");

	F(function(){
		var address = "test/live/basics.js";
		var content = "module.exports={};";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Changing css did not work");
			QUnit.start();
		});
	});

	F("#app").exists().height(0, "The height is now 0 because the css module was removed from the dependency graph");
});

QUnit.module("live-reload with ssr", {
	setup: function(assert){
		var done = assert.async();
		F.open("//live-ssr/index.html", function(){
			done();
		});
	},
	teardown: function(assert){
		var done = assert.async();
		liveReloadTest.reset().then(function(){
			done();
		});
	}
});

QUnit.test("reloading css that has been server side rendered works", function(){
	F("style").exists("the initial style is on the page");

	F(function(){
		var address = "test/live-ssr/basics.js";
		var content = "require('./other.css!');";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Changing the css was not successful");
			QUnit.start();
		});
	});

	F("#app").exists().height(20, "The height is now correct");
});
