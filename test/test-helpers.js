var steal = require("@steal");
var helpers = require("steal-test-helpers")(steal);
var pkg = require("../package.json");
var cssPkg = require("../node_modules/steal-css/package.json");
require("done-css");

exports.clone = clone;
exports.removeAddedStyles = removeAddedStyles;
exports.fakeBeingInNode = fakeBeingInNode;
exports.fakeBeingInElectron = fakeBeingInElectron;

function clone(){
	var name = "done-css@" + pkg.version + "#css";
	var source = steal.loader.getModuleLoad(name).source;

	var sName = "steal-css@" + cssPkg.version + "#css";
	var sSource = steal.loader.getModuleLoad(sName).source;

	return helpers.clone()
		//.withModule("@steal", "module.exports = steal")
		.withModule("done-css", source)
		.withModule("steal-css", sSource);
}

function removeAddedStyles() {
	// clean up by removing each style until you get to the qunit one
	removeUntilQUnit(document.head.lastChild);

	function removeUntilQUnit(style) {
		var isAddedStyle = style.tagName === "STYLE" && !/QUnit/.test(style.innerHTML);
		var isAddedLink = style.tagName === "LINK";

		if(isAddedStyle || isAddedLink) {
			style.parentNode.removeChild(style);
			removeUntilQUnit(document.head.lastChild);
		}
	}
}

function fakeBeingInNode() {
	process = {versions:{}};
	var ts = Object.prototype.toString;
	Object.prototype.toString = function(){
		if(this === process) {
			return "[object process]";
		}
		return ts.call(this);
	};

	return function(){
		var global = steal.loader.global;
		delete global.process;
		Object.prototype.toString = ts;
	};
}

function fakeBeingInElectron() {
	var reset = fakeBeingInNode();
	process = {
		versions: {electron: "1.0.0"}
	};

	return function(){
		reset();
	};
}
