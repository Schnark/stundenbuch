/*global l10n*/
(function () {
"use strict";

function getAudio (key) {
	var lines = l10n.get('audio-data').split('\n'),
		pos = lines.indexOf('!' + key),
		i;
	if (pos === -1) {
		return false;
	}
	for (i = pos; i > 0; i--) {
		if (!lines[i]) {
			return lines[i + 1];
		}
	}
}

function countSyllables (line) {
	return line.replace(/[Qq]u/g, 'q')
		.replace(/ae|ao|ea|eo|ia|io|iu|oa|ua/g, 'a-a')
		.split(/[aeiouyäöüæœáéíóúýǽ]{1,2}/gi).length - 1;
}

function getMeter (lines) {
	return lines.map(function (line) {
		if (!line) {
			return '';
		}
		return countSyllables(line.replace(/ Amen\.$/, ''));
	}).join('/');
}

function getHymns () {
	return l10n.getKeys().filter(function (key) {
		return key.indexOf('hymnus-') === 0;
	}).map(function (key) {
		var lines = l10n.get(key).split('\n'),
			incipit = lines[2],
			audio = getAudio(key),
			meter = getMeter(lines.slice(2));
		return {
			key: key,
			incipit: incipit,
			text: lines.slice(2).join('\n'),
			audio: audio,
			meter: meter,
			equal: audio === incipit || audio === incipit.slice(0, -1)
		};
	});
}

function varies (meter) {
	var stanzas = meter.split('//'),
		first = stanzas[0], i;
	for (i = 1; i < stanzas.length; i++) {
		if (stanzas[i] !== first) {
			return true;
		}
	}
	return false;
}

function display (hymns) {
	var html;
	html = hymns.map(function (data) {
		var cls = data.equal ? 'equal' : (data.audio ? '' : 'missing');
		return '<tr><td><code>' + data.key + '</code></td>' +
			'<td title="' + data.text + '">' + data.incipit + '</td>' +
			'<td' + (cls ? ' class="' + cls + '"' : '') + '>' + (data.audio || '') + '</td>' +
			'<td title="' + data.meter.replace(/\/\//g, '\n') + '">' +
			data.meter.replace(/\/\/.*/, '') + (varies(data.meter) ? ' *' : '') + '</td></tr>';
	});
	document.getElementById('output').innerHTML = '<table>' +
			'<tr><th>Schlüssel</th><th>Incipt</th><th>Melodie</th><th>Metrum</th></tr>' +
			html.join('') +
			'</table>';
}

function test (lang) {
	l10n.load(lang, function () {
		display(getHymns());
	});
}

function run () {
	test(document.getElementById('lang').value);
}

function init () {
	document.getElementById('run').onclick = run;
}

init();

})();