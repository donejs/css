var loader = require("@loader");

// Register for server-side rendering.
var register = loader.has("asset-register") ?
  loader.get("asset-register")["default"] : function(){};

function getExistingAsset(load){
	var s = typeof jQuery !== "undefined" ? jQuery : document.querySelectorAll.bind(document);
	var val = s("[asset-id='" + load.name + "']");
	return val && val[0];
}

var isNode = typeof process === "object" &&
	{}.toString.call(process) === "[object process]";

if(loader.env === 'production') {
	exports.fetch = function(load) {
		// return a thenable for fetching (as per specification)
		// alternatively return new Promise(function(resolve, reject) { ... })
		var cssFile = load.address;

		var link;
		if(isNode) {
			var path = loader._nodeRequire("path");
			cssFile = path.relative(loader.baseURL, cssFile);

			link = document.createElement('link');
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("href", "/" + cssFile);

			register(load.name, "css", function(){
				return link.cloneNode(true);
			});
		} else {
			if(typeof document !== "undefined") {
				link = getExistingAsset(load);
				if(!link) {
					link = document.createElement('link');
					link.rel = 'stylesheet';
					link.href = cssFile;

					document.head.appendChild(link);
				}
			}
		}

		return "";
	};
} else {
	exports.instantiate = function(load) {
		var loader = this;

		load.metadata.deps = [];
		load.metadata.execute = function(){
			var source = load.source+"/*# sourceURL="+load.address+" */";
			source = source.replace(/url\(['"]?([^'"\)]*)['"]?\)/g, function(whole, part) {
				return "url(" + steal.joinURIs( load.address, part) + ")";
			});

			if(load.source && typeof document !== "undefined") {
				var doc = document.head ? document : document.getElementsByTagName ?
					document : document.documentElement;

				var head = doc.head || doc.getElementsByTagName('head')[0];

				if(!head) {
					var docEl = doc.documentElement || doc;
					head = document.createElement("head");
					docEl.insertBefore(head, docEl.firstChild);
				}

				var style = getExistingAsset(load);
				if(!style) {
					style = document.createElement('style')

					// make source load relative to the current page

					style.type = 'text/css';

					if (style.styleSheet){
						style.styleSheet.cssText = source;
					} else {
						style.appendChild(document.createTextNode(source));
					}
					head.appendChild(style);
				}

				if(loader.has("live-reload")) {
					var cssReload = loader.import("live-reload", { name: "$css" });
					Promise.resolve(cssReload).then(function(reload){
						loader.import(load.name).then(function(){
							reload.once(load.name, function(){
								head.removeChild(style);
							});
						});
					});
				}

				// For server-side rendering, register this module.
				register(load.name, "css", function(){
					return style.cloneNode(true);
				});
			}

			return System.newModule({source: source});
		};
		load.metadata.format = "css";
	};

}

exports.buildType = "css";
exports.includeInBuild = true;
