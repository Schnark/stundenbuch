/*global screenlock: true*/
/*global debug*/
screenlock =
(function () {
"use strict";

var lock;

function isAvailable () {
	return window.navigator && navigator.requestWakeLock;
}

function enable () {
	try {
		lock = navigator.requestWakeLock('screen');
		debug.log('enable lock');
	} catch (e) {
	}
}

function disable () {
	try {
		lock.unlock();
		lock = false;
		debug.log('disable lock');
	} catch (e) {
	}
}

function refresh () {
	/*If screen is turned off manually, the lock is lost when it is turned on again,
	without any notice. So we just refresh the lock the users scrolls (and debounce
	the event, while the user scrolls, the screen wo'n't turn off). This seems the
	best of all possible approaches.*/
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