var steal = require("@steal");
var helpers = require("steal-test-helpers")(steal);
var pkg = require("../package.json");
var cssPkg = require("../node_modules/steal-css/package.json");
require("done-css");

exports.clone = clone;
exports.removeAddedStyles = removeAddedStyles;

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
		if(style.tagName === "STYLE" && !/QUnit/.test(style.innerHTML)) {
			style.parentNode.removeChild(style);
			removeUntilQUnit(document.head.lastChild);
		}
	}

}
