var QUnit = require("steal-qunit");
var F = require("funcunit");

F.attach(QUnit);

QUnit.module("basics", {
	setup: function(){
		F.open("//basics/index.html");
	}
});

QUnit.test("basics works", function(){
	F("style").exists("the style was added to the page");
});

QUnit.module("renderingLoader", {
	setup: function(){
		F.open("//rendering-loader/index.html");
	}
});

QUnit.test("is used when rewriting url()s", function(){
	F("style").exists().text(/example\.com\/app/, "The renderingLoader's base url is http://example.com/app and this was used to rewrite font urls() correctly");
});
