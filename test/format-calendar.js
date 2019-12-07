/*global Day, Config, l10n, util*/
/*global console*/
(function () {
"use strict";

var SOURCES, OMIT, TEXTS, calendar;

SOURCES = {
	150: 'EU',
	'de': 'RK',
	'de-DE': 'DE',
	'de-AT': 'AT',
	'de-CH': 'CH',
	'de-freiburg': 'FR',
	'de-mainz': 'MZ',
	'de-rottenburg-stuttgart': 'RS'
};

OMIT = [
	'natalis', 'dominica-nativitatis',
	'cinerum', 'palmis', 'cena', 'passionis', 'sabbatum-sanctum',
	'pascha', 'pentecoste', 'pentecoste-secunda',
	'oskar-saier'
];

TEXTS = {
	'E': ['*-introductio'],
	'H': ['hymnus-vespera-*-v', 'hymnus-*', 'hymnus-lectionis-*', 'hymnus-laudes-*', 'hymnus-tertia-*', 'hymnus-sexta-*', 'hymnus-nona-*', 'hymnus-vespera-*'],
	'A': ['antiphona-invitatorium-*', 'antiphona-vespera-*-1-v', 'antiphona-vespera-*-2-v', 'antiphona-vespera-*-3-v', 'antiphona-magnificat-*-v', 'antiphona-lectionis-*-1', 'antiphona-lectionis-*-2', 'antiphona-lectionis-*-3', 'antiphona-laudes-*-1', 'antiphona-laudes-*-2', 'antiphona-laudes-*-3', 'antiphona-benedictus-*', 'antiphona-tertia-*', 'antiphona-sexta-*', 'antiphona-nona-*', 'antiphona-vespera-*-1', 'antiphona-vespera-*-2', 'antiphona-vespera-*-3', 'antiphona-magnificat-*'],
	'P': ['preces-vespera-*-v', 'preces-laudes-*', 'preces-vespera-*'],
	'L': ['lectio-lectionis-*-a', 'responsorium-lectionis-*-a', 'lectio-lectionis-*-b', 'responsorium-lectionis-*-b', 'lectio-lectionis-*-b-alt', 'responsorium-lectionis-*-b-alt'],
	'O': ['oratio-vespera-*-v', 'oratio-*']
};

calendar = {};

function getTexts (name, templates) {
	return templates.map(function (str) {
		return str.replace('*', name);
	}).filter(function (key) {
		return l10n.has(key);
	});
}

function formatLink (name, key) {
	var texts = getTexts(name, TEXTS[key]);
	if (texts.length) {
		return '<a href="?catalogus,' + texts.join(',') + '">' + key + '</a>';
	}
}

function formatTexts (name) {
	var key, link, links = [];
	for (key in TEXTS) {
		link = formatLink(name, key);
		if (link) {
			links.push(link);
		}
	}
	return links.join(' – ');
}

function formatInfo (source, day, month, rank) {
	var info = [];
	if (SOURCES[source]) {
		info.push(SOURCES[source]);
	}
	if (isNaN(month)) {
		info.push('???');
	} else {
		info.push(
			util.replaceFormatString(l10n.get('date-format-short'), function (c) {
				switch (c) {
				case 'd': return day;
				case 'm': return month - 1;
				}
			}).replace('(', '').replace(')', '')
		);
	}
	info.push(l10n.get(['sollemnitas', 'festum', 'memoria', 'memoria-1'][rank] + '-littera'));
	return info.join(', ');
}

function addCalendar (cal) {
	Day.calendars[cal].getEntries(new Config({})).forEach(function (entry) {
		var name = entry[2];
		if (name && OMIT.indexOf(name) === -1) {
			if (!calendar[name]) {
				calendar[name] = {title: l10n.get(name), info: [], texts: formatTexts(name)};
			}
			calendar[name].info.push(formatInfo(cal, entry[0], entry[1], entry[3]));
		}
	});
}

function addCalendars () {
	var cal;
	for (cal in Day.calendars) {
		if (cal === '*' || cal === '' || SOURCES[cal]) {
			addCalendar(cal);
		}
	}
}

function formatEntry (entry) {
	return '<li>' + entry.title + ' (' + entry.info.join('; ') + ')' + (entry.texts ? ': ' + entry.texts : '') + '</li>';
}

function formatCalendar () {
	var list = [], name;
	for (name in calendar) {
		//TODO maria
		list.push({html: formatEntry(calendar[name]), sort: l10n.get(name + '-nomen', calendar[name].title)});
	}
	list.sort(function (a, b) {
		return a.sort < b.sort ? -1 : 1;
	});
	return list.map(function (entry) {
		return entry.html;
	}).join('\n');
}

function run (lang) {
	l10n.load(lang, function () {
		addCalendars();
		console.log(formatCalendar());
	});
}

run('de');

})();