/*global caches, fetch, Promise */
(function (worker) {
"use strict";

var PREFIX = 'stundenbuch',
	VERSION = '1.26',
	FILES = [
		'index.html',
		'style.css',
		'img/config.svg',
		'img/icon-512.png',
		'img/nav.svg',
		'img/note.svg',
		'js/lib/pako.min.js',
		'js/lib/xtea-asm.js',
		'js/app.js',
		'js/audio.js',
		'js/audio-manager.js',
		'js/calendar.js',
		'js/commune.js',
		'js/config.js',
		'js/day.js',
		'js/debug.js',
		'js/file.js',
		'js/form-additional.js',
		'js/format.js',
		'js/hora.js',
		'js/l10n.js',
		'js/password.js',
		'js/screenlock.js',
		'js/util.js',
		'l10n/de.xtea',
		'l10n/en.xtea',
		'l10n/la.xtea'
	];

worker.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(PREFIX + ':' + VERSION).then(function (cache) {
			return cache.addAll(FILES);
		})
	);
});

worker.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
				if (key.indexOf(PREFIX + ':') === 0 && key !== PREFIX + ':' + VERSION) {
					return caches.delete(key);
				}
			}));
		})
	);
});

worker.addEventListener('fetch', function (e) {
	e.respondWith(caches.match(e.request, {ignoreSearch: true})
		.then(function (response) {
			return response || fetch(e.request);
		})
	);
});

})(this);