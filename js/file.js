/*global file: true*/
/*global Blob, URL, MozActivity*/
file =
(function () {
"use strict";

function createIcal (data, strict) {
	var now = (new Date()).toISOString().replace(/[\-:]|\.\d*/g, '');
	function validDate (d, m) {
		if (!strict) {
			return d && m;
		}
		if (isNaN(d) || isNaN(m)) {
			return false;
		}
		if (Number(d) !== Math.floor(d) || Number(m) !== Math.floor(m)) {
			return false;
		}
		if (d <= 0 || d > 31 || m <= 0 || m > 12) {
			return false;
		}
		return true;
	}
	return 'BEGIN:VCALENDAR\r\n' +
		'VERSION:2.0\r\n' +
		'PRODID:schnark-stundenbuch\r\n' +
		data.split('\n').map(function (line, i) {
			var d, m;
			line = line.split('|');
			d = line.shift();
			m = line.shift();
			line = line.join('|')
				.replace(/\\/g, '\\\\')
				.replace(/,/g, '\\,')
				.replace(/;/g, '\\;');
			if (!validDate(d, m)) {
				return '';
			}
			if (!isNaN(m)) {
				if (m < 10) {
					m = '0' + m;
				}
				if (d > 0 && d < 10) {
					d = '0' + d;
				}
			}
			return 'BEGIN:VEVENT\r\n' +
				'UID:schnark-stundenbuch-' + i + '-' + now + '\r\n' +
				'DTSTAMP:' + now + '\r\n' +
				'DTSTART;VALUE=DATE:2000' + m + d + '\r\n' +
				'RRULE:FREQ=YEARLY\r\n' +
				'SUMMARY:' + line + '\r\n' +
				'DESCRIPTION:' + line + '\r\n' +
				'TRANSP:TRANSPARENT\r\n' +
				'END:VEVENT\r\n';
		}).join('') +
		'END:VCALENDAR';
}

function parseIcal (ical) {
	var result = [],
		i, line,
		pos, pos0, pos1, val, parts,
		date,
		summary,
		description;
	ical = ical.replace(/\r\n?/g, '\n');
	ical = ical.replace(/\n\s+/g, '');
	ical = ical.split('\n');
	for (i = 0; i < ical.length; i++) {
		line = ical[i];
		pos0 = line.indexOf(':');
		pos1 = line.indexOf(';');
		if (pos0 === -1) {
			pos = pos1;
		} else if (pos1 === -1) {
			pos = pos0;
		} else {
			pos = Math.min(pos0, pos1);
		}
		val = line.slice(pos0 + 1);
		switch (line.toLowerCase().slice(0, pos)) {
		case 'begin':
			if (val.toLowerCase() === 'vevent') {
				date = '';
				summary = '';
				description = '';
			}
			break;
		case 'end':
			if (val.toLowerCase() === 'vevent' && date) {
				description = description || summary;
				result.push(date + (description ? '|' + description : ''));
			}
			break;
		case 'dtstart':
			parts = /(\d\d)(\d\d)(?:T|$)/.exec(val);
			if (parts) {
				date = Number(parts[2]) + '|' + Number(parts[1]);
			} else {
				parts = /([es])(-?\d+)$/.exec(val);
				if (parts) {
					date = Number(parts[2]) + '|' + parts[1];
				} else {
					parts = /(\d\d)(-\d+)$/.exec(val);
					if (parts) {
						date = Number(parts[2]) + '|' + Number(parts[1]);
					}
				}
			}
			break;
		case 'summary':
			summary = val.replace(/\\(.)/g, '$1');
			break;
		case 'description':
			description = val.replace(/\\(.)/g, '$1');
		}
	}
	return result.join('\n');
}

function saveText (text, name) {
	fileSaveAs(createTextFile(text), name);
}

function createTextFile (text, type) {
	return new Blob([text], {type: type || 'image/png'}); //stupid, but yes
}

function fileSaveAs (file, name) {
	var a = document.createElement('a');
	a.dataset.nativ = true;
	if (typeof file !== 'string') {
		file = URL.createObjectURL(file);
	}
	a.href = file;
	if ('download' in a) {
		a.download = name || '';
	} else {
		a.target = '_blank';
	}
	a.style.display = 'none';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function openFile (callback, type) {
	var pick;

	function readText (file, callback) {
		if (!file) {
			callback();
			return;
		}
		var reader = new FileReader();
		reader.onload = function (e) {
			callback(e.target.result);
		};
		reader.onerror = function () {
			callback();
		};
		reader.readAsText(file);
	}

	if (!type) {
		type = 'text/plain';
	}
	if (!Array.isArray(type)) {
		type = [type];
	}
	if (type.indexOf('application/pdf') === -1) {
		type.push('application/pdf'); //this is ridiculous, but it does work
	}
	if (window.MozActivity) {
		pick = new MozActivity({
			name: 'pick',
			data: {
				type: type
			}
		});

		pick.onsuccess = function () {
			readText(this.result.blob, callback);
		};

		pick.onerror = function () {
			callback();
		};
	} else {
		pick = document.createElement('input');
		pick.type = 'file';
		pick.style.display = 'none';
		document.getElementsByTagName('body')[0].appendChild(pick);
		pick.addEventListener('change', function () {
			readText(pick.files[0], callback);
			document.getElementsByTagName('body')[0].removeChild(pick);
		}, false);
		pick.click();
	}
}

return {
	export: saveText,
	import: openFile,
	createIcal: createIcal,
	parseIcal: parseIcal
};

})();