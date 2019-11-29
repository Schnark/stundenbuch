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

/*
function roman (v) {
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
*/
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