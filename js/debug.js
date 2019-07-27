/*global debug: true, console, performance*/
debug =
(function () {
"use strict";

var timer, logEntries = [], silent;

function enableDisable (onoff) {
	silent = !(onoff && window.console && console.log && window.performance && performance.now);
}

function log (entry) {
	if (silent) {
		return;
	}
	console.log(entry);
	logEntries.push(entry);
}

function timerStart () {
	if (silent) {
		return;
	}
	timer = performance.now();
}

function timerEnd (msg) {
	if (silent) {
		return;
	}
	var time = performance.now() - timer;
	log(msg + ': ' + time + 'ms');
}

function getLog () {
	var html = '<pre>' + logEntries.join('\n') + '</pre>';
	logEntries = [];
	return html;
}

enableDisable(true);

return {
	enableDisable: enableDisable,
	log: log,
	timerStart: timerStart,
	timerEnd: timerEnd,
	getLog: getLog
};

})();