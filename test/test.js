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
