/*global Config, Day*/
/*jshint forin: false*/
(function () {
"use strict";

var comments = {
	'maria-ecclesia': 'g/abweichendes Datum zugunsten von pentecoste-secunda',
	agnes: 'g zugunsten von meinrad',
	'cyrillus-methodius': 'g zugunsten von valentin-terni',
	polycarpus: 'g zugunsten von willigis',
	'aloisius-gonzaga': 'g zugunsten von alban',
	'heinrich-kunigunde': 'statt henricus',
	bonaventura: 'g zugunsten von bernhard-baden, in Baden 17. 7.',
	'alfonsus-liguori': 'g zugunsten von petrus-faber',
	monica: 'g zugunsten von gebhard',
	hieronymus: 'g zugunsten von urs-viktor',
	'albertus-magnus': 'abweichendes Datum',
	leopold: 'aus technischen Gründen doppelt',
	'margarita-scotia': 'aus technischen Gründen doppelt',
	gertrudis: 'abweichendes Datum',
	konrad: 'statt konrad-gebhard',
	lucia: 'g zugunsten von odilia',
	'ioannes-didacus': 'aus technischen Gründen doppelt',
	'petrus-canisius': 'abweichendes Datum'
}, memorials;

/*
Entfallende g:
de-mainz
--------
petrus-canisius
elisabeth-lusitania
ulrich
robertus-bellarmino

de-rottenburg-stuttgart
-----------------------
ioannes-brebeuf-isaac-jogues
paulus-cruce

*/

function findGroups (needle, groups) {
	return groups.map(function (group, index) {
		return group.indexOf(needle) === -1 ? -1 : index;
	}).filter(function (index) {
		return index !== -1;
	});
}

function sortKey (date) {
	if (isNaN(date.m)) {
		return date.d - 100;
	}
	return date.m * 35 + date.d;
}

function getAllOptionalMemorials () {
	var config = new Config({}), memorials = [], source, cal, groups, i, type;
	for (source in Day.calendars) {
		cal = Day.calendars[source].getEntries(config);
		groups = Day.calendars[source].groups;
		for (i = 0; i < cal.length; i++) {
			if (cal[i][3] === 3) {
				type = cal[i][4];
				if (!Array.isArray(type)) {
					type = [type];
				}
				memorials.push({
					name: cal[i][2],
					d: cal[i][0],
					m: cal[i][1],
					type: type[0] || 'proprium',
					mf: type.indexOf('mulier') > -1 || type.indexOf('maria') > -1,
					source: source,
					groups: groups ? findGroups(cal[i][2], groups) : []
				});
			}
		}
	}
	memorials.sort(function (a, b) {
		return sortKey(a) - sortKey(b);
	});
	return memorials;
}

function countGroups (memorials) {
	var counts = {}, key;
	memorials.forEach(function (entry) {
		var i;
		for (i = 0; i < entry.groups.length; i++) {
			key = entry.source + ':' + entry.groups[i];
			if (!counts[key]) {
				counts[key] = {names: [], m: 0, f: 0};
			}
			if (!counts[key][entry.type]) {
				counts[key][entry.type] = 0;
			}
			counts[key].names.push(entry.name);
			counts[key][entry.type]++;
			counts[key][entry.mf ? 'f' : 'm']++;
		}
	});
	return counts;
}

function makeCheckboxCell (i, group, enable) {
	return '<td><input data-index="' + i + '" data-group="' + group + '" type="checkbox"' +
		(enable.indexOf(group) > -1 ? ' checked' : '') + '></td>';
}

function buildTable (memorials) {
	var html;
	html = memorials.map(function (entry, i) {
		return '<tr class="' + entry.groups.map(function (group) {
				return 'g' + group;
			}).join(' ') + '"><td>' + entry.name + '</td><td>' + entry.d  + '</td><td>' + entry.m + '</td>' +
			'<td>' + entry.type + '</td><td>' + (entry.mf ? 'f' : 'm') + '</td><td>' + entry.source + '</td>' +
			makeCheckboxCell(i, 0, entry.groups) + makeCheckboxCell(i, 1, entry.groups) +
			makeCheckboxCell(i, 2, entry.groups) + makeCheckboxCell(i, 3, entry.groups) +
			'<td>' + (comments[entry.name] || '') + '</td></tr>';
	});
	html.unshift('<tr><th>Name</th><th colspan="2">Datum</th><th colspan="2">Commune</th>' +
		'<th>Kalender</th><th colspan="4">Gruppe</th><th>Anmerkung</th></tr>');
	return '<table>' + html.join('') + '</table>';
}

function buildCounts (counts) {
	var html = Object.keys(counts).sort().map(function (key) {
		var data = counts[key], all, c;
		all = (data.m + data.f) + ' (' + data.m + '/' + data.f + ')';
		c = Object.keys(data).sort().filter(function (key) {
			return ['names', 'm', 'f'].indexOf(key) === -1;
		}).map(function (key) {
			return key + ': ' + data[key];
		});
		return '<tr><td>' + key + '</td><td>' + all + '</td><td>' + c.join(', ') + '</td>' +
			'<td><code>[\'' + data.names.join('\', \'') + '\']</code></td></tr>';
	});
	html.unshift('<tr><th>Gruppe</th><th colspan="2">Zahlen</th><th>Code</th></tr>');
	return '<table>' + html.join('') + '</table>';
}

function updateCounts () {
	document.getElementById('output').innerHTML = buildCounts(countGroups(memorials));
}

function onChange (e) {
	var checkbox = e.target, data = checkbox.dataset, row = checkbox.parentElement.parentElement;
	if (checkbox.checked) {
		memorials[data.index].groups.push(Number(data.group));
		row.classList.add('g' + data.group);
	} else {
		memorials[data.index].groups = memorials[data.index].groups.filter(function (group) {
			return group !== Number(data.group);
		});
		row.classList.remove('g' + data.group);
	}
	updateCounts();
}

function onHighlight (e) {
	document.body.className = e.target.value;
}

function init () {
	memorials = getAllOptionalMemorials();
	document.getElementById('input').innerHTML = buildTable(memorials);
	updateCounts();
	document.getElementById('input').addEventListener('change', onChange);
	document.getElementById('highlight').addEventListener('change', onHighlight);
}

init();

})();