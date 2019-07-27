/*global Config: true, util*/
Config =
(function () {
"use strict";

var config;

function Config (defaultConfig, styleKeys, key) {
	this.defaultConfig = defaultConfig;
	this.vals = util.clone(defaultConfig);
	this.styleKeys = styleKeys;
	this.key = key;
	if (key) {
		this.load();
	}
	this.updateClass();
}

Config.getConfig = function () {
	return config;
};

Config.setConfig = function (c) {
	config = c;
};

Config.prototype.load = function () {
	try {
		util.merge(this.vals, JSON.parse(localStorage.getItem(this.key)));
	} catch (e) {
	}
};

Config.prototype.save = function () {
	try {
		localStorage.setItem(this.key, JSON.stringify(this.vals));
	} catch (e) {
	}
};

Config.prototype.reset = function () {
	this.vals = util.clone(this.defaultConfig);
	this.updateClass();
	if (this.key) {
		try {
			localStorage.removeItem(this.key);
		} catch (e) {
		}
	}
};

Config.prototype.export = function () {
	return JSON.stringify(this.vals);
};

Config.prototype.import = function (str) {
	if (!this.key) {
		return false;
	}
	try {
		JSON.parse(str || 'x'); //verify JSON
		localStorage.setItem(this.key, str);
		this.vals = util.clone(this.defaultConfig);
		this.load();
		this.updateClass();
	} catch (e) {
		return false;
	}
	return true;
};

Config.prototype.updateClass = function () {
	if (!this.styleKeys) {
		return;
	}
	document.body.className = this.styleKeys.map(function (key) {
		return key + '-' + this.get(key);
	}.bind(this)).join(' ');
};

Config.prototype.get = function (name) {
	return this.vals[name];
};

Config.prototype.set = function (name, val) {
	this.vals[name] = val;
	if (this.key) {
		this.save();
	}
	if (this.styleKeys.indexOf(name) > -1) {
		this.updateClass();
	}
};

return Config;
})();