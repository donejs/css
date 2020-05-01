var loader = require("@loader");
var cssPlugin = require("steal-css");

var StealCSSModule = cssPlugin.CSSModule;

exports.locateScheme = cssPlugin.locateScheme;
exports.buildType = cssPlugin.buildType;
exports.includeInBuild = cssPlugin.includeInBuild;
exports.pluginBuilder = "steal-css/slim";

var getDocument = cssPlugin.getDocument;
var getHead = cssPlugin.getHead;

var DoneCSSModule = function(){
	StealCSSModule.apply(this, arguments);
};

var proto = DoneCSSModule.prototype = Object.create(StealCSSModule.prototype);
proto.constructor = DoneCSSModule;

proto.getSSRRegister = function(){
	// Register for server-side rendering.
	var register = loader.has("asset-register") ?
		loader.get("asset-register")["default"] : function(){};

	return register;
};

proto.updateProductionHref = function(){
	var cssFile = this.address;
	var loader = this.loader;

	// Get a relative path from the baseURL to the module's address
	var path = loader._nodeRequire("path");
	cssFile = path.relative(loader.baseURL, cssFile).replace(/\\/g, "/");

	var href = "/" + cssFile;

	// If server side rendering and a baseURL is set, use it.
	var baseURL;
	if(loader.renderingBaseURL) {
		baseURL = loader.renderingBaseURL;

		// if loading from a CDN (or other http:// URL),
		// remove the dist/ from CSS href
		if (baseURL !== '/') {
			href = addSlash(baseURL) + cssFile.replace("dist/", "");
		} else {
			href = addSlash(baseURL) + cssFile;
		}
	}

	if(loader.renderingCacheVersion) {
		var cacheKey = loader.cacheKey || "version";
		var cacheKeyVersion  = cacheKey + "=" + loader.renderingCacheVersion;
		if(href.indexOf(cacheKeyVersion) === -1) {
			href = href + (href.indexOf("?") === -1 ? "?" : "&") + cacheKeyVersion;
		}
	}

	this.href = href;
};

proto.registerSSR = function(){
	var css = this;

	var cb;
	if(loader.isEnv("production")) {
		this.updateProductionHref();
		cb = function(){
			var link = getDocument().createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("href", css.href);
			return link;
		};
	} else {
		cb = function(){
			return css.style.cloneNode(true);
		};
	}

	this.getSSRRegister()(this.load.name, "css", cb);
};

proto.updateURLs = function(){
	var loader = this.loader;
	var address = this.address;

	// If on the server use the renderingLoader to use the correct
	// address when rewriting url()s.
	if(loader.renderingLoader || loader.renderingBaseURL) {
		var href = address.substr(loader.baseURL.length);
		var baseURL = addSlash(
			loader.renderingBaseURL || loader.renderingLoader.baseURL
		);
		address = steal.joinURIs(baseURL, href);
	}
	this.address = address;

	return StealCSSModule.prototype.updateURLs.call(this);
};

proto.shouldInjectStyle = function(){
	var head = getHead();
	var style = getExistingAsset(this.load);
	if(style) {
		this.style = style;
	}

	return !style || style.__isDirty;
};

proto.injectStyle = function(){
	if(this.shouldInjectStyle()) {
		StealCSSModule.prototype.injectStyle.call(this);
	}
};

proto.dependencies = function(){
	// Specify the css dependencies
	var meta = this.loader.meta[this.load.name];
	return (meta && meta.deps) || [];
};

function getExistingAsset(load, head){
	var doc = getDocument();

	if(doc.querySelectorAll) {
		var selector = "[asset-id='" + load.name + "']";
		var val = doc.querySelectorAll(selector);
		return val && val[0];
	} else {
		var els = doc.getElementsByTagName("*"), el;

		for(var i = 0, len = els.length; i < len; i++) {
			el = els[i];
			if(el.getAttribute("asset-id") === load.name) {
				return el;
			}
		}
	}
}

function addSlash(url) {
	var hasSlash = url[url.length - 1] === "/";
	return url + (hasSlash ? "" : "/");
}

var isNode = typeof process === "object" &&
	{}.toString.call(process) === "[object process]";

var isNW = (function(){
	try {
		return typeof loader._nodeRequire("nw.gui") !== "undefined";
	} catch(e) {
		return false;
	}
})();

var isElectron = isNode && !!process.versions.electron;

if(loader.isEnv("production")) {
	exports.fetch = function(load) {
		var css = new DoneCSSModule(load, this);

		if(isNode && !isNW && !isElectron) {
			css.registerSSR();
			return "";
		} else {
			return css.injectLink();
		}
	};
} else {
	exports.instantiate = function(load) {
		var loader = this;

		var css = new DoneCSSModule(load, this);
		load.source = css.updateURLs();

		load.metadata.deps = css.dependencies();
		load.metadata.format = "css";
		load.metadata.execute = function(){
			if(getDocument()) {
				css.injectStyle();
				css.setupLiveReload(loader, load.name);
			}
			if(isNode && !isNW && !isElectron) {
				css.registerSSR();
			}

			return loader.newModule({
				source: css.source
			});
		};
	};
}
