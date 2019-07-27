/*global Config, Day, l10n*/
(function () {
"use strict";

function getCalendar () {
	var config = new Config({}), calendar = {}, source, cal, i, key, extra, region;
	for (source in Day.calendars) {
		cal = Day.calendars[source].getEntries(config);
		for (i = 0; i < cal.length; i++) {
			key = cal[i][2];
			if (key && !calendar[key]) {
				calendar[key] = {source: source};
			}
		}
		extra = Day.calendars[source].extra || {};
		for (region in extra) {
			cal = extra[region];
			for (i = 0; i < cal.length; i++) {
				key = cal[i][2];
				if (key && !calendar[key]) {
					calendar[key] = {source: source + ' (' + region + ')'};
				}
			}
		}
	}
	return calendar;
}

function checkL10N (calendar) {
	var key;
	for (key in calendar) {
		calendar[key].title = l10n.has(key);
		calendar[key].name = l10n.has(key + '-nomen');
		calendar[key].intro = l10n.has(key + '-introductio');
		calendar[key].oratio = l10n.has('oratio-' + key);
		calendar[key].lectio = l10n.has('lectio-lectionis-' + key + '-b') &&
			l10n.has('responsorium-lectionis-' + key + '-b');
	}
	return calendar;
}

function display (calendar) {
	var html = [], key;
	html.push('<tr><th>Id</th><th>Kalender</th><th>Titel</th><th>Name</th><th>Intro</th><th>Oration</th><th>Lesung</th></tr>');
	for (key in calendar) {
		html.push('<tr><td>' + key + '</td><td>' +
			calendar[key].source + '</td><td>' +
			(calendar[key].title ? '' : 'FEHLT') + '</td><td>' +
			(calendar[key].name ? '' : 'FEHLT') + '</td><td>' +
			(calendar[key].intro ? '' : 'FEHLT') + '</td><td>' +
			(calendar[key].oratio ? '' : 'FEHLT') + '</td><td>' +
			(calendar[key].lectio ? '' : 'FEHLT') + '</td></tr>'
		);
	}
	document.getElementById('output').innerHTML = '<table>' + html.join('') + '</table>';
}

function test (lang) {
	l10n.load(lang, function () {
		display(checkL10N(getCalendar()));
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