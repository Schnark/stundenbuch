/*global Day, Config, l10n, util*/
/*jshint forin: false*/
(function () {
"use strict";

var SOURCES, OMIT, TEXTS, LANG, calendar;

SOURCES = {};

OMIT = [
	'natalis', 'dominica-nativitatis',
	'cinerum', 'palmis', 'cena', 'passionis', 'sabbatum-sanctum',
	'pascha', 'pentecoste', 'pentecoste-secunda',
	'oskar-saier'
];

TEXTS = {
	'I': ['*-introductio'],
	'H': [
		'hymnus-vespera-*-v', 'hymnus-*', 'hymnus-lectionis-*', 'hymnus-laudes-*',
		'hymnus-tertia-*', 'hymnus-sexta-*', 'hymnus-nona-*', 'hymnus-vespera-*'
	],
	'A': [
		'antiphona-invitatorium-*',
		'antiphona-vespera-*-1-v', 'antiphona-vespera-*-2-v', 'antiphona-vespera-*-3-v', 'antiphona-magnificat-*-v',
		'antiphona-lectionis-*-1', 'antiphona-lectionis-*-2', 'antiphona-lectionis-*-3',
		'antiphona-laudes-*-1', 'antiphona-laudes-*-2', 'antiphona-laudes-*-3', 'antiphona-benedictus-*',
		'antiphona-tertia-*', 'antiphona-sexta-*', 'antiphona-nona-*',
		'antiphona-vespera-*-1', 'antiphona-vespera-*-2', 'antiphona-vespera-*-3', 'antiphona-magnificat-*'
	],
	'P': ['preces-vespera-*-v', 'preces-laudes-*', 'preces-vespera-*'],
	'L': [
			'lectio-lectionis-*-a', 'responsorium-lectionis-*-a',
			'lectio-lectionis-*-b', 'responsorium-lectionis-*-b',
			'lectio-lectionis-*-b-alt', 'responsorium-lectionis-*-b-alt'
	],
	'O': ['oratio-vespera-*-v', 'oratio-*']
};

LANG = {
	reEt: /, | et /g,
	reNomen: /(?:)/,
	socii: 'socii',
	maria: 'Maria',
	ecclesia: 'Dedicatio Ecclesiæ'
};

function initLang (lang) {
	var texts;
	if (lang === 'de') {
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
		texts = {
			E: TEXTS.I,
			H: TEXTS.H,
			A: TEXTS.A,
			P: TEXTS.P,
			L: TEXTS.L,
			O: TEXTS.O
		};
		TEXTS = texts;
		LANG = {
			reEt: /, | und /g,
			reNomen: /^(?:Bischof|Bruder|Papst) /,
			socii: 'Gefährten',
			maria: 'Maria',
			ecclesia: 'Kirchweihe'
		};
	} else if (lang === 'en') {
		LANG = {
			reEt: /, | and /g,
			reNomen: /(?:)/,
			socii: 'his companions',
			maria: 'Mary',
			ecclesia: 'Dedication of the Church'
		};
	}
}

function normalize (str) {
	return str.toLowerCase()
		.replace(/ä/g, 'a').replace(/ö/g, 'o')
		.replace(/ü/g, 'u').replace(/ß/g, 'ss');
}

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
		return '<a href="?c=' + texts.join(',') + '">' + key + '</a>';
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

function getAliases (name) {
	var aliases = name.split(LANG.reEt);
	aliases.shift();
	if (aliases[aliases.length - 1] === LANG.socii) {
		aliases.pop();
	}
	return aliases;
}

function addCalendar (cal) {
	Day.calendars[cal].getEntries(new Config({})).forEach(function (entry) {
		var name = entry[2], commune = entry[4];
		if (name && OMIT.indexOf(name) === -1) {
			if (!calendar[name]) {
				if (!Array.isArray(commune)) {
					commune = [commune];
				}
				calendar[name] = {title: l10n.get(name), commune: commune, info: [], texts: formatTexts(name)};
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

function getSort (name, commune) {
	if (commune.indexOf('maria') > -1) {
		return LANG.maria + ', ' + calendar[name].title;
	}
	if (commune.indexOf('ecclesia') > -1) {
		return LANG.ecclesia + ', ' + calendar[name].title;
	}
	return l10n.get(name + '-nomen', calendar[name].title).replace(LANG.reNomen, '');
}

function formatCalendar () {
	var list = [], name, aliases, i;
	for (name in calendar) {
		list.push({
			html: formatEntry(calendar[name]),
			sort: normalize(getSort(name, calendar[name].commune))
		});
		if (calendar[name].commune.indexOf('plures') > -1) {
			aliases = getAliases(l10n.get(name + '-nomen'));
			for (i = 0; i < aliases.length; i++) {
				list.push({
					html: '<li>' + aliases[i] + ' → ' + calendar[name].title + '</li>',
					sort: normalize(aliases[i])
				});
			}
		}
	}
	for (i = 1; i <= 26; i++) {
		list.push({
			html: '</ul></div>\n\n<h2>' + String.fromCharCode(64 + i) + '</h2>\n<div class="p"><ul>',
			sort: String.fromCharCode(96 + i)
		});
	}
	list.sort(function (a, b) {
		return a.sort < b.sort ? -1 : 1;
	});
	return (list.map(function (entry) {
		return entry.html;
	}).join('\n') + '\n</ul></div>')
		.replace(/^<\/ul><\/div>\n\n/, '')
		.replace(/<h2>.<\/h2>\n<div class="p"><ul>\n<\/ul><\/div>(\n\n)?/g, '');
}

function run (lang) {
	calendar = {};
	initLang(lang);
	l10n.load(lang, function () {
		addCalendars();
		document.getElementById('output').textContent = formatCalendar();
	});
}

function init () {
	document.getElementById('run').addEventListener('click', function () {
		run(document.getElementById('lang').value);
	});
}

init();

})();