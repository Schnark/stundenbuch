(function () {
"use strict";

function onNext () {
	var day, week;
	week = Number(document.getElementById('week').value);
	if (isNaN(week)) {
		document.getElementById('week').value = '';
		return;
	}
	switch (document.getElementById('two').value) {
	case 'i':
		document.getElementById('two').value = 'ii';
		return;
	case 'ii':
		document.getElementById('two').value = 'i';
	}
	day = Number(document.getElementById('day').value);
	if (day < 6) {
		document.getElementById('day').value = day + 1;
		return;
	}
	document.getElementById('day').value = 0;
	document.getElementById('week').value = week + 1;
}

function getKey (type, ab) {
	var prefix = document.getElementById('prefix').value,
		week = Number(document.getElementById('week').value),
		day = Number(document.getElementById('day').value),
		two = document.getElementById('two').value,
		id = prefix + String(7 * (week - 1) + day) + two;
	if (isNaN(week)) {
		id = document.getElementById('week').value;
	}
	return '[' + type + '-lectionis-' + id + '-' + ab + ']';
}

function formatGeneral (input) {
	return input
		.replace(/ - /g, ' – ')
		.replace(/ -,/g, ' –,')
		.replace(/\s*—\s*/g, '–')
		.replace(/(\d[a-f]?)-(\d)/g, '$1–$2')
		.replace(/(\d[a-f]?\.) +(\d)/g, '$1$2')
		.replace(/(\d[a-f]?\.) +(\d)/g, '$1$2') //doppelt für Überlappungen
		.replace(/ +\?/g, '?')
		.replace(/'/g, '’')
		.replace(/´/g, '"')
		.replace(/"([^"\n]*)"/g, '»$1«')
		.replace(/“(.*?)”/g, '‹$1›')
		.replace(/„/g, '»')
		.replace(/“/g, '«')
		.replace(/ »(\S[^«»"\n]+\S)[»"]/g, ' »$1«')
		.replace(/ +\n/g, '\n');
}

function formatBibleDe (input) {
	return '#TODO Gliederung\n' +
		('\n' + input + '\n')
		.replace(/\bA\n/g, '\n')
		.replace(/\n+ +/g, ' ')
		.replace(/\n+/g, '\n')
		.replace(/(\n\d+)/g, '$1 ')
		.replace(/\[/g, '(')
		.replace(/\]/g, ')')
		.replace(/«/g, '"')
		.replace(/»/g, '«')
		.replace(/"/g, '»')
		.trim();
}

function formatLectioAltera (input) {
	var lines, refLine, i, re, result, refs = [];
	input = input.replace(/\[/g, '(').replace(/\]/g, ')');
	if (!(/zweite lesung/i).test(input)) {
		return formatLectio(input);
	}
	lines = input
		.replace('ZWEITE LESUNG', 'Zweite Lesung')
		.replace(/\n+/g, '\n')
		.trim()
		.split(/\n/);
	lines[1] = '!' + lines[1].replace(/ +\(.*/, '').trim() + ': ' + lines[2].replace(/^([^»]+)«$/, '$1');
	lines[1] = lines[1].replace(/^!hl\. +/i, '!').replace(/\s*\.\s*$/, '');
	lines[2] = '';
	lines[3] = '=' + lines[3];
	refLine = lines[lines.length - 1];
	if (refLine.indexOf('1.') === 0) {
		refLine = refLine.replace(/(^|\.\s+)(\d|1\d)\./g, '$1($2) ');
	}
	if (refLine.indexOf('(1)') > -1) {
		if (refLine.charAt(refLine.length - 1) !== '.') {
			refLine += '.';
		}
		lines[lines.length - 1] = '';
		i = 1;
		while (refLine) {
			re = new RegExp('( *\\(' + i + '\\) *(.*?)\\.? *)(?:\\(' + (i + 1) + '\\)|$)');
			result = re.exec(refLine);
			refs.push(result[2].trim());
			refLine = refLine.slice(result[1].length);
			i++;
		}
		refs = refs.map(function (ref) {
			return ref
				.replace(/([a-zö]{2,})\. */g, '$1 ')
				.replace(/(\d)([A-Z])/g, '$1 $2')
				.replace(/^Vgl /i, 'Vgl. ')
				.replace(/ vgl /, ' vgl. ')
				.replace(/^Ebd *$/, 'Ebd.')
				.replace(/\(vet lat \)/i, '(Vet. Lat.)')
				.replace(/, */g, ', ');
		});
	}
	input = lines.filter(function (line) {
		return line;
	}).join('\n\n').trim();
	input = input.replace('¹', '1').replace('²', '2').replace('³', '3')
		.replace('⁴', '4').replace('⁵', '5');
	if (refs.length && input.indexOf('(1)') === -1) {
		input = input.replace(/([^0-9])([1-9]|1\d)([^0-9]|$)/g, '$1($2)$3');
	}
	for (i = 0; i < refs.length; i++) {
		input = input.replace(new RegExp(' *([^\\w ]*) *\\(' + (i + 1) + '\\) *([^\\w»„\\n ]*) *'), '$1$2 <' + refs[i] + '> ');
	}
	return input;
}

function formatLectio (input) {
	var lines = input
		.replace('ERSTE LESUNG', 'Erste Lesung')
		.replace(/\s*\(?Quelle: Vulgata nach Hamp,? Stenzel und Kürzinger\s*\)?/, '\n#TODO Einheitsübersetzung\n')
		.replace(/\n+/g, '\n')
		.split(/\n/);
	lines[1] = '!' + lines[1].replace(/\((.*)\)/, '<$1>');
	lines[2] = '=' + lines[2];
	return lines.join('\n\n').trim();
}

function formatResponsorium (input) {
	return input
		.replace(/Responsorium +(.*)\n+/, 'Responsorium <$1>\n\n')
		.replace(/.*Responsorium\n+/i, 'Responsorium\n\n')
		.replace(/\nR\S{0,2} +/, '\nR ')
		.replace(/\n+V\S{0,2} +/, '\n\nV ')
		.replace(/ *\* */g, '\n')
		.replace(/ [hH]?[aA]llel[uú][ij]a[.!](\n\n|\s*$)/g, '$1')
		.trim();
}

function splitInput (input) {
	if (/responsorium/i.test(input) && !/lectio|erste lesung|zweite lesung/i.test(input)) {
		input = 'Zweite Lesung\n\n' + input;
	}
	return input
		.replace(/\u00a0/g, ' ')
		.replace(/'''/g, '')
		.replace(/ *&lt;br *\/?&gt;\s*/g, '\n')
		.replace(/&quot;/g, '"')
		.split(/(Lectio prior|Lectio altera|Responsorium|ERSTE LESUNG|ZWEITE LESUNG)/i)
		.map(function (part, i, all) {
			if (all.length === 1) {
				return part;
			}
			return i % 2 ? part + all[i + 1] : '';
		}).filter(function (part) {
			return part;
		});
}

function formatInput (parts) {
	if (parts.length === 4) {
		parts[0] = getKey('lectio', 'a') + '\n' + formatLectio(parts[0]);
		parts[1] = getKey('responsorium', 'a') + '\n' + formatResponsorium(parts[1]);
		parts[2] = getKey('lectio', 'b') + '\n' + formatLectioAltera(parts[2]);
		parts[3] = getKey('responsorium', 'b') + '\n' + formatResponsorium(parts[3]);
	} else if (parts.length === 2) {
		parts[0] = getKey('lectio', 'b') + '\n' + formatLectioAltera(parts[0]);
		parts[1] = getKey('responsorium', 'b') + '\n' + formatResponsorium(parts[1]);
	} else if (parts.length === 1) {
		parts[0] = getKey('lectio', 'a') + '\n' + formatBibleDe(parts[0]);
	}
	return formatGeneral(parts.join('\n\n'));
}

function createOutput () {
	var input = document.getElementById('text').value;
	return formatInput(splitInput(input));
}

function init () {
	var output = document.getElementById('output');
	document.getElementById('go').addEventListener('click', function () {
		output.textContent = createOutput();
	});
	document.getElementById('next').addEventListener('click', onNext);
}

init();

})();
