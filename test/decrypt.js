/*global xtea, URL, Blob*/
(function () {
"use strict";

function getRawFile (name, type, callback) {
	var xhr;
	xhr = new XMLHttpRequest();
	xhr.open('GET', name);
	xhr.responseType = type;
	xhr.onload = function () {
		callback(xhr.response);
	};
	xhr.send();
}

function getFile (name, password, callback) {
	getRawFile('l10n/' + name, 'arraybuffer', function (data) {
		callback(xtea.decrypt(new Uint8Array(data), password));
	});
}

function addFile (name, content) {
	document.getElementById('result').innerHTML +=
		'<li><a download="' + name + '" ' +
		'href="' + URL.createObjectURL(new Blob([content], {type: 'text/plain'})) + '">' +
		name + '</a></li>';
}

function splitFile (all, parts) {
	var i, lastPos = 0, pos1, pos2;
	for (i = 0; i < parts.length; i++) {
		pos1 = all.indexOf(parts[i].start, lastPos);
		pos2 = i === parts.length - 1 ? all.length : all.indexOf(parts[i + 1].start, pos2);
		lastPos = pos1;
		addFile(parts[i].name, all.slice(pos1, pos2));
	}
}

function decrypt (file, password, parts) {
	getFile(file, password, function (file) {
		splitFile(file, parts);
	});
}

function run (pw) {
	addFile('password.txt', pw);
	decrypt('de.xtea', pw, [
		{name: 'de.txt', start: ''},
		{name: 'interface-de.txt', start: '[titulus]'},
		{name: 'biblia-de.txt', start: '#Einheitsübersetzung'},
		{name: 'lectionis-de.txt', start: '[modus-lectionis]'},
		{name: 'regional-de.txt', start: '#Freiburg'},
		{name: 'catalogus-de.txt', start: '[catalogus-index]'},
		{name: 'audio-de.txt', start: '[audio-data]'}
	]);
	decrypt('en.xtea', pw, [
		{name: 'en.txt', start: ''},
		{name: 'interface-en.txt', start: '[titulus]'},
		{name: 'biblia-en.txt', start: '#New American Bible'},
		{name: 'lectionis-en.txt', start: '[modus-lectionis]'},
		{name: 'catalogus-en.txt', start: '[catalogus-index]'},
		{name: 'audio-en.txt', start: '#TODO\n[audio-data]'}
	]);
	decrypt('la.xtea', pw, [
		{name: 'la.txt', start: ''},
		{name: 'interface-la.txt', start: '[titulus]'},
		{name: 'biblia-la.txt', start: '#Nova Vulgata'},
		{name: 'lectionis-la.txt', start: '[modus-lectionis]'},
		{name: 'catalogus-la.txt', start: '[catalogus-index]'},
		{name: 'audio-la.txt', start: '#TODO\n[audio-data]'}
	]);
}

function init () {
	document.getElementById('decrypt').addEventListener('click', function () {
		run(document.getElementById('password').value);
	});
}

init();

})();