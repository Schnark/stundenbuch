/*global util: true*/
util =
(function () {
"use strict";

function htmlEscape (str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function merge (a, b) {
	var key;
	for (key in b) {
		if (b.hasOwnProperty(key)) {
			if (key in a) {
				if (typeof a[key] === 'object' && b[key] !== false) {
					merge(a[key], b[key]);
				} else {
					a[key] = b[key];
				}
			} else {
				a[key] = b[key];
			}
		}
	}
}

function clone (obj) {
	return JSON.parse(JSON.stringify(obj));
}

function replaceFormatString (format, replacer) {
	return format.replace(/\{([^}]+)\}\(%([a-z])\)|%(0?)([a-zA-Z])|(%%)/g, function (all, array, c1, pad, c2, percent) {
		var c, n;
		if (percent) {
			return '%';
		}
		if (array) {
			array = array.split('|');
			c = c1;
		} else {
			c = c2;
		}
		n = replacer(c.toLowerCase());
		if (n === false) {
			return all;
		}
		if (c.toLowerCase() !== c) {
			n++;
		}
		return array ? array[Math.min(n, array.length - 1)] : (n < 10 ? pad : '') + n;
	});
}

return {
	htmlEscape: htmlEscape,
	merge: merge,
	clone: clone,
	replaceFormatString: replaceFormatString
};
})();