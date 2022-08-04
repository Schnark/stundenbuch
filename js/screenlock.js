/*global screenlock: true*/
screenlock =
(function () {
"use strict";

var lock;

function isAvailable () {
	return window.navigator && (navigator.requestWakeLock || navigator.wakeLock);
}

function enable () {
	try {
		lock = navigator.wakeLock ?
			navigator.wakeLock.request('screen') :
			navigator.requestWakeLock('screen');
	} catch (e) {
	}
}

function disable () {
	try {
		if (lock.then) {
			lock.then(function (lockSentinel) {
				lockSentinel.release();
			});
		} else {
			lock.unlock();
		}
		lock = false;
	} catch (e) {
	}
}

function refresh () {
	/*If screen is turned off manually, the lock is lost when it is turned on again, without
	any notice (for navigator.requestWakeLock, the modern variant has an event mechanism).
	So we just refresh the lock when the users scrolls (and debounce the event).
	This seems the best of all possible approaches.*/
	var scrolling;
	window.addEventListener('scroll', function () {
		if (!scrolling && lock && !document.hidden) {
			disable();
			enable();
		}
		if (scrolling) {
			window.clearTimeout(scrolling);
		}
		scrolling = window.setTimeout(function () {
			scrolling = false;
		}, 2000);
	});
}

if (isAvailable()) {
	refresh();
}

return {
	isAvailable: isAvailable,
	enable: enable,
	disable: disable
};

})();