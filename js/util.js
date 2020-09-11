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

function formatRoman (v) {
	var data = [
		[1000, 'M'],
		[900, 'CM'],
		[500, 'D'],
		[400, 'CD'],
		[100, 'C'],
		[90, 'XC'],
		[50, 'L'],
		[40, 'XL'],
		[10, 'X'],
		[9, 'IX'],
		[5, 'V'],
		[4, 'IV'],
		[1, 'I']
	], str = [];
	while (v > 0) {
		while (data[0][0] > v) {
			data.shift();
		}
		while (data[0][0] <= v) {
			v -= data[0][0];
			str.push(data[0][1]);
		}
	}
	return str.join('');
}

function replaceFormatString (format, replacer) {
	return format.replace(
		/\{([^}]+)\}\(%([a-z])\)|%(0?)(4?)([a-zA-Z])|(%%)/g,
		function (all, array, c1, pad, roman, c2, percent) {
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
			if (n === undefined) {
				return all;
			}
			if (c.toLowerCase() !== c) {
				n++;
			}
			if (array) {
				return array[Math.min(n, array.length - 1)];
			}
			if (roman) { //Q: Why 4 for Roman number format? A: Because 4 === R in the Mnemonic major system
				return formatRoman(n);
			}
			return (n < 10 ? pad : '') + n;
		}
	);
}

function getUrlParams (url, multi) {
	var params = {};
	if (multi) {
		multi.forEach(function (key) {
			params[key] = [];
		});
	} else {
		multi = [];
	}
	(url || location.search).slice(1).split('&').forEach(function (str) {
		var pos = str.indexOf('='), key, val;
		if (pos !== -1) {
			key = decodeURIComponent(str.slice(0, pos));
			val = decodeURIComponent(str.slice(pos + 1));
			if (multi.indexOf(key) > -1) {
				params[key].push(val);
			} else {
				params[key] = val;
			}
		}
	});
	return params;
}

return {
	htmlEscape: htmlEscape,
	merge: merge,
	clone: clone,
	replaceFormatString: replaceFormatString,
	getUrlParams: getUrlParams
};
})();