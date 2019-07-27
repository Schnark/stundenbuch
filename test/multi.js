/*global Day, console*/
(function () {
"use strict";

var queue = [], currentExtra = [];

function onMessage (e) {
	var f;
	if (e.data === 'done') {
		f = queue.shift();
		if (f) {
			f();
		}
	} else if (Array.isArray(e.data)) {
		updateExtra(e.data);
	}
}

function updateExtra (extra) {
	var extraInput = document.getElementById('extra'),
		extraButton, i;
	for (i = 0; i < extra.length; i++) {
		if (currentExtra.indexOf(extra[i]) === -1) {
			currentExtra.push(extra[i]);
		}
	}
	if (extraInput.value !== currentExtra.join('|')) {
		extraButton = document.getElementById('extra-button');
		extraButton.onclick = function () {
			extraInput.value = currentExtra.join('|');
		};
		extraButton.disabled = false;
	}
}

function makeUrl (lang, hora, date, extra, compare) {
	return 'test.html?lang=' + lang +
		'&hora=' + hora +
		'&date=' + date.format() +
		'&extra=' + extra +
		(compare ? '&compare=1' : '') +
		'&hide=1';
}

function makeIframe (td, params, callback) {
	var iframe = document.createElement('iframe');
	td.appendChild(iframe);
	queue.push(callback);
	iframe.src = makeUrl(params.lang, params.hora, params.date, params.extra, params.compare);
}

function makeEntry (row, params, callback) {
	var td = document.createElement(params.lang ? 'td' : 'th');
	row.appendChild(td);
	if (params.lang) {
		if (
			params.compare && (
				['index', 'tertia-complementaris', 'sexta-complementaris', 'nona-complementaris'].indexOf(params.hora) > -1 ||
				params.lang === 'de' && ['invitatorium', 'lectionis'].indexOf(params.hora) > -1
			)
		) {
			params.compare = false;
			makeIframe(td, params, callback);
			params.compare = true;
		} else {
			makeIframe(td, params, callback);
		}
	} else {
		td.textContent = {
			index: 'Übersicht',
			invitatorium: 'Invitatorium',
			lectionis: 'Lesehore',
			laudes: 'Laudes',
			tertia: 'Terz',
			'tertia-complementaris': 'Terz',
			sexta: 'Sext',
			'sexta-complementaris': 'Sext',
			nona: 'Non',
			'nona-complementaris': 'Non',
			vespera: 'Vesper',
			completorium: 'Komplet'
		}[params.hora];
		setTimeout(callback, 0);
	}
}

function makeRow (table, langs, params, callback) {
	var row = document.createElement('tr'), i = 0;
	table.appendChild(row);

	function next () {
		params.lang = langs[i];
		i++;
		makeEntry(row, params, i === langs.length ? callback : next);
	}

	next();
}

function makeDay (table, langs, hora, day, extra, compare, callback) {
	var row = document.createElement('tr'), th = document.createElement('th'),
		horas, i = 0;

	if (hora) {
		horas = [hora];
	} else {
		horas = ['index', 'invitatorium', 'lectionis', 'laudes', 'tertia', 'sexta', 'nona', 'vespera', 'completorium'];
	}

	function next () {
		var params = {date: day, hora: horas[i], extra: extra, compare: compare};
		i++;
		makeRow(table, langs, params, i === horas.length ? callback : next);
	}

	th.colSpan = langs.length;
	th.textContent = day.format(
		'{So|Mo|Di|Mi|Do|Fr|Sa}(%w), %d. {Jan.|Feb.|Mär.|Apr.|Mai|Jun.|Jul.|Aug.|Sep.|Okt.|Nov.|Dez.}(%m) %y'
	);
	row.appendChild(th);
	table.appendChild(row);
	next();
}

function makeTable (table, langs, hora, days, extra, compare, callback) {
	var row = document.createElement('tr'), th, i;

	function next () {
		var day = days[i];
		i++;
		makeDay(table, langs, hora, day, extra, compare, i === days.length ? callback : next);
	}

	langs.unshift('');
	for (i = 0; i < langs.length; i++) {
		th = document.createElement('th');
		th.textContent = {
			de: 'Deutsch',
			'de-x-local': 'Deutsch',
			la: 'Latein',
			en: 'Englisch'
		}[langs[i]] || langs[i];
		row.appendChild(th);
	}
	table.appendChild(row);

	i = 0;
	next();
}

function getDays (start, length) {
	var days = [], current, i;
	current = start;
	for (i = 0; i < length; i++) {
		days.push(current);
		current = current.next();
	}
	return days;
}

function init (langs, hora, start, length, extra, compare, doit) {
	document.getElementById('de').checked = langs.indexOf('de') > -1;
	document.getElementById('de-x-local').checked = langs.indexOf('de-x-local') > -1;
	document.getElementById('la').checked = langs.indexOf('la') > -1;
	document.getElementById('en').checked = langs.indexOf('en') > -1;
	document.getElementById('hora').value = hora;
	document.getElementById('start').value = start.format();
	document.getElementById('length').value = length;
	document.getElementById('extra').value = extra;
	document.getElementById('compare').checked = compare;
	if (doit) {
		makeTable(
			document.getElementsByTagName('tbody')[0],
			langs,
			hora,
			getDays(start, length),
			extra,
			compare,
			function () {
				console.log('done');
			}
		);
	}
}

function run () {
	var params = {};
	location.search.slice(1)
		.split('&')
		.forEach(function (str) {
			var pos = str.indexOf('='), key, val;
			if (pos !== -1) {
				key = decodeURIComponent(str.slice(0, pos));
				val = decodeURIComponent(str.slice(pos + 1));
				if (key === 'lang') {
					params.lang = params.lang || [];
					params.lang.push(val);
				} else {
					params[key] = val;
				}
			}
		});
	if (params.lang) {
		params.lang = params.lang.filter(function (lang) {
			return ['de', 'de-x-local', 'la', 'en'].indexOf(lang) !== -1;
		});
	}
	window.addEventListener('message', onMessage, false);
	init(
		params.lang || ['de', 'la'],
		params.hora || '',
		new Day(params.start),
		params.length || 1,
		params.extra || '',
		!!params.compare,
		!!params.doit
	);
}

run();

})();