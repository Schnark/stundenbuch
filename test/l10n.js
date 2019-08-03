/*global l10n, schnarkDiff*/
(function () {
"use strict";

var globalLastWord; //FIXME

function findDuplicates (file, callback) {
	l10n.test(file, function (data) {
		var texts = {}, duplicates = {}, key, result = [];
		for (key in data) {
			if (data.hasOwnProperty(key)) {
				if (texts[data[key]]) {
					if (!duplicates[texts[data[key]]]) {
						duplicates[texts[data[key]]] = [texts[data[key]]];
					}
					duplicates[texts[data[key]]].push(key);
				} else {
					texts[data[key]] = key;
				}
			}
		}
		for (key in duplicates) {
			if (duplicates.hasOwnProperty(key)) {
				result = result.concat(duplicates[key]);
				result.push(data[key]);
				result.push('');
			}
		}
		callback(result);
	});
}

function compareKeys (a, b, callback) {
	l10n.test(a, function (dataA) {
		l10n.test(b, function (dataB) {
			var missingA = [], missingB = [], key;
			for (key in dataA) {
				if (dataA.hasOwnProperty(key) && !dataB.hasOwnProperty(key)) {
					missingB.push(key);
				}
			}
			for (key in dataB) {
				if (dataB.hasOwnProperty(key) && !dataA.hasOwnProperty(key)) {
					missingA.push(key);
				}
			}
			callback(missingA, missingB);
		});
	});
}

function equalKeys (a, b, callback) {
	l10n.test(a, function (dataA) {
		l10n.test(b, function (dataB) {
			var result = {}, key;
			for (key in dataA) {
				if (dataA.hasOwnProperty(key) && dataB.hasOwnProperty(key)) {
					result[key] = [dataA[key], dataB[key]];
				}
			}
			callback(result);
		});
	});
}

//jscs:disable maximumLineLength
function getReBibelstelle () {
	var praefix = '[Vv]gl\\.',
		buch = '([12] )?[A-Z][a-zö]+',
		kapitel = '\\d+( \\(\\d+( [AB])?\\))?',
		vers = '\\d+([a-z]|ff)?',
		versbereich = '(' + vers + '(–' + vers + ')?|\\d+[a-z]–[a-z])',
		verse = versbereich + '(\\.' + versbereich + ')*',
		kapitelverse = kapitel + '(, ' + verse + ')?',
		kapitelbereich = kapitelverse + '(–' + kapitelverse + ')?',
		kapitelsammlung = kapitelbereich + '(; ' + kapitelbereich + ')*',
		suffix = '(par|\\((LXX|Vulg\\.|Vg\\.|Vet\\. Lat\\.)\\))',
		sonstiges = '(Credo|Gloria|Kyro-paideia|Tedeum|[Ee]bd\\.|([A-Z][a-z]{6}|Lumen Gentium|Paul VI|Leo der Große|Irenäus|Brief an |Trid\\. Sess\\.|Konzil von Trient|Hans von Campenhausen|W. Nauck|AAS|PL|PG|Joh\\. Damascenus|Ps\\.-Modestus)[^;]*)',
		stelle = '((' + praefix + ' )?' + buch + ' ' + kapitelsammlung + '( ' + suffix + ')?|(' + praefix + ' )?' + sonstiges + ')';
	return stelle + '(; ' + stelle + ')*';
}

function getReBibleref () {
	var praefix = '[Ss]ee',
		buch = '([12] )?[A-Z][a-z]+',
		kapitel = '\\d+( \\(\\d+( [AB])?\\))?',
		vers = '\\d+([a-z]|ff)?',
		versbereich = '(' + vers + '(–' + vers + ')?|\\d+[a-z]–[a-z])',
		verse = versbereich + '(, ' + versbereich + ')*',
		kapitelverse = kapitel + '(:' + verse + ')?',
		kapitelbereich = kapitelverse + '(–' + kapitelverse + ')?',
		kapitelsammlung = kapitelbereich + '(; ' + kapitelbereich + ')*',
		suffix = '(par|\\((LXX|Vulg\\.|Vg\\.|Vet\\. Lat\\.)\\))',
		sonstiges = '(Saint [A-Z][a-z]+|Arnobius|Cassian|Cassiodorus|Hesychius|Origen|Eusebius of Caesarea|from an author of the second century)',
		stelle = '((' + praefix + ' )?' + buch + ' ' + kapitelsammlung + '( ' + suffix + ')?|(' + praefix + ' )?' + sonstiges + ')';
	return stelle + '(; ' + stelle + ')*';
}
//jscs:enable maximumLineLength

function checkAccentsWord (word, shouldHaveAccents) {
	globalLastWord = word;
	var a = word.replace(/[^áéíóúýÁÉÍÓÚǽ]+/g, '').length,
		v = word
			.replace(/(^|[aeiouyæœáéíóúýǽ])([ií])([aeiouyæœáéíóúýǽ])/gi, '$1j$2')
			.replace(/([aeqáé])(?:[uú])/gi, '$1w')
			.replace(/ng(?:[uú])([aeiouyæœáéíóúýǽ])/gi, 'ngw$1')
			.replace(/s(?:[uú])([aeáé])/gi, 'sw$1')
			.replace(/[^aeiouyæœAEIOUYÆŒáéíóúýÁÉÍÓÚǽ]+/g, '').length;
	if (a >= 2) {
		return false;
	}
	if (a === 1 && !shouldHaveAccents) {
		return false;
	}
	if (a === 1 && v <= 1) { //FIXME <= 2
		return false;
	}
	if (
		a === 0 && v >= 3 && shouldHaveAccents &&
		word.charAt(0).toLowerCase() === word.charAt(0) && //FIXME
		word.indexOf('œ') === -1 //FIXME
	) {
		return false;
	}
	return true;
}

function checkAccentsLine (line, shouldHaveAccents) {
	line = line.replace(/<[^<>]+>/g, '').replace(/[@~][a-z0-9\-,]+/g, '');
	return line.split(/[^a-zA-ZæÆœŒáéíóúýÁÉÍÓÚǽ]+/).every(function (word) {
		return !word || checkAccentsWord(word, shouldHaveAccents);
	});
}

function checkAccents (text) {
	var lines = text.split('\n');
	return lines.every(function (line, i) {
		return !line ||
				checkAccentsLine(
					line,
					!(i === 0 && lines.length > 1 && !lines[1]) &&
					line.charAt(0) !== '=' &&
					(text.indexOf('=') !== -1 || line.charAt(0) !== '!')
				);
	});
}

function checkFormat (file, callback) {
	//jscs:disable maximumLineLength
	var re = {
		'': [
			[/[^a-z0-9\-]/, /./, false, 'Schlüssel mit Sonderzeichen'],
			[/./, /./, true, 'Leerer Eintrag'],
			[/./, / {2}| \n|\n |\n\n\n|^\s|\s$/, false, 'Mehrfacher Leerraum'],
			[/./, /^[^_]*(__[^_\n]+__[^_]*)*$/, true, 'Unterstreichungen'],
			[/./, /^[^<>]*(<[^<>]+>[^<>]*)*$/, true, 'Spitze Klammern'],
			[/^(?!date-format-short)./, /^[^()]*(\([^()]+\)[^()]*)*$/, true, 'Klammern'],
			[/./, /^[^=]+(\n\n=[^=\n]{3,110}\n\n[^=]+)*$/, true, 'Überschrift'],
			[/./, /\.\.\./, false, 'Falsche Auslassungspunkte'],
			[/./, /\d-\d/, false, 'Falscher Bis-Strich'],
			[/^(?!responsorium-)./, /[^a-zäöüß\n]-\W/, false, 'Falscher Gedankenstrich'],
			[/./, /\s[.,;:?]/, false, 'Leerzeichen vor Satzzeichen'],
			[/./, /\s’[^tT]/, false, 'Leerzeichen vor Apostroph'],
			[/./, / !/, false, 'Leerzeichen vor Satzzeichen (erg.)'],
			[/./, /^(?!~).*,\)?[^–”\n )]/, false, 'Komma ohne folgendes Leerzeichen'],
			[/./, /;\)?[^–”\n )]/, false, 'Semikolon ohne folgendes Leerzeichen'],
			[/./, /(?:[^\n]!|\?)\w/, false, 'Ausrufezeichen/Fragezeichen ohne folgendes Leerzeichen'],
			[/./, /:\)?[^–\d\n )]/, false, 'Doppelpunkt ohne folgendes Leerzeichen'],
			[/^(?!lectio-lectionis-)./, / \//, false, 'Schrägstrich']
			//[/./, /\n\d+(?:[^0-9a-z ]|[^0-9 ]{2,})/, false, 'Versnummer']
		],
		':de': [
			[/./, /[^0-9 ]–[^0-9 \n]/, false, 'Gedankenstrich ohne Leerzeichen'],
			[/./, /^[^»«›‹]*(»[^»«]+«[^»«]*)*$/, true, 'Anführungszeichen'],
			[/./, new RegExp('^[^<>]*(<' + getReBibelstelle() + '>[^<>]*)*$'), true, 'Bibelstellen']
		],
		':la': [
			[/./, / –|– /, false, 'Gedankenstrich mit Leerzeichen'],
			[/./, /^[^«»‹›]*(«[^«»]+»[^«»]*)*$/, true, 'Anführungszeichen']
		],
		':en': [
			[/./, /[^0-9 ]–[^0-9 \n]/, false, 'Gedankenstrich ohne Leerzeichen'],
			[/./, /^[^“”]*(“[^“”]+”[^“”]*)*$/, true, 'Anführungszeichen'], //“double” ‘single’
			[/./, new RegExp('^[^<>]*(<' + getReBibleref() + '>[^<>]*)*$'), true, 'Bibelstellen']
		],
		'de': [
			[/./, /^[a-zA-ZäöüÄÖÜßÁáàçéèîłñú0-9() \n<>’\/\-.:,;?!…–»«_@%*+{}|]+$/, true, 'Illegales Zeichen (1)'],
			[/(?!-introductio).{12}$|^.{1,11}$/, /[áçèîłú]/, false, 'Illegales Zeichen (2)'],
			[/^(?!date-format|dominica|hebdomada|modus-)/, /[%*+{}|]/, false, 'Illegales Zeichen (3)'],
			[/^antiphona-/, /\n/, false, 'Zeilenumbruch in Antiphon'],
			[/^hymnus-/, /^Hymnus\n\n|^@hymnus-[a-z0-9\-]+$/, true, 'Hymnus ohne Titel'],
			[/^responsorium-(?!substitutum-)/, /^Responsorium\n\nR .+\n.(.+) - R\n\nV .+\n.\1$|^@responsorium-[a-z0-9\-]+$/, true, 'Responsorium im falschen Format'],
			[/^versus-(?!lectionis-)/, /^Responsorium\n\n.+\n.+$/, true, 'Versikel im falschen Format'],
			[/^versus-lectionis-/, /^Versikel\n\n.+\n.+$|^@versus-[a-z0-9\-]+$/, true, 'Versikel im falschen Format'],
			[/^preces-laudes-/, /^Bitten\n\n|^@preces-laudes-[a-z0-9\-]+$/, true, 'Preces im falschen Format'],
			[/^preces-vespera-/, /^Fürbitten\n\n|^@preces-vespera-[a-z0-9\-]+$/, true, 'Preces im falschen Format'],
			[/^oratio-/, /^Oration\n\n.+ @[a-z0-9\-]+$|^@oratio-[a-z0-9\-]+$/, true, 'Oration im falschen Format'],
			[/-introductio$/, /^(!.*\n\n)*!.*$/, true, 'Einleitung im falschen Format']
		],
		'biblia-de': [
			[/./, /^[a-zA-ZäöüÄÖÜßáëíó0-9() \n<>’\-.:,;?!…–»«_@]+$/, true, 'Illegales Zeichen'],
			[/./, /^@|^(Psalm \d+( [IVX]+( \([A-Z][a-z]+\))?)?|Canticum|Lesung) <([12] )?[A-Z][a-zäöü]+[^>]+>\n\n/, true, 'Fehlerhafte Überschrift']
		],
		'lectionis-de': [
			[/./, /^[a-zA-ZäöüÄÖÜßÁáéëïñó0-9() \n<>’\/\-.:,;?!…–»«›‹_@~=]+$/, true, 'Illegales Zeichen'],
			[/^responsorium-/, /^Responsorium\n\nR .+\n.(.+)\n\nV .+\n.\1$|^@responsorium-[a-z0-9\-]+$/, true, 'Responsorium im falschen Format'],
			[/^lectio-lectionis-.*-a(-alt\d?)?$/, /^Erste Lesung\n\n(~lectio-lectionis-[a-z0-9\-]+a-alt\d?,responsorium-lectionis-[a-z0-9\-]+ Alternativ[^\n]+\n\n)*![^\n]+<[^\n]+>\n\n|^@lectio-lectionis-[a-z0-9\-]+-a(-alt2)?$/, true, 'Lesung im falschen Format (1)'],
			[/^lectio-lectionis-.*-b(-alt\d?)?$/, /^Zweite Lesung\n\n(~lectio-lectionis-[a-z0-9\-]+b-alt\d?,responsorium-lectionis-[a-z0-9\-]+ Alternativ[^\n]+\n\n)*![^\n]+\n\n(=[^\n]+\n\n)?|^@lectio-lectionis-[a-z0-9\-]+-b$/, true, 'Lesung im falschen Format (2)']
		],
		'la': [
			[/./, /^[a-zA-ZæÆœŒáéíóúýÁÉÍÓÚǽçèöõü0-9() \n<>’\/\-.:,;?!…–»«_@%*+{}|]+$/, true, 'Illegales Zeichen (1)'],
			[/(?!-introductio).{12}$|^.{1,11}$/, /[çèö]/, false, 'Illegales Zeichen (2)'],
			[/^(?!date-format|dominica|hebdomada|modus-|te-deum$)/, /[%*+{}|]/, false, 'Illegales Zeichen (3)'],
			[/^antiphona-/, /\n/, false, 'Zeilenumbruch in Antiphon'],
			[/^hymnus-/, /^Hymnus\n\n|^@hymnus-[a-z0-9\-]+$/, true, 'Hymnus ohne Titel'],
			[/^responsorium-(?!substitutum-)/, /^Responsorium\n\nR .+\n.(.+) - R\n\nV .+\n.\1$|^@responsorium-[a-z0-9\-]+$/, true, 'Responsorium im falschen Format'],
			[/^versus-(?!lectionis-)/, /^Responsorium\n\n.+\n.+$|^@versus-[a-z0-9\-]+$/, true, 'Versikel im falschen Format'],
			[/^versus-lectionis-/, /^Versus\n\n.+\n.+$|^@versus-[a-z0-9\-]+$/, true, 'Versikel im falschen Format'],
			[/^preces-/, /^Preces\n\n|^@preces-[a-z0-9\-]+$/, true, 'Preces im falschen Format'],
			[/^oratio-/, /^Oratio\n\n.+ @[a-z0-9\-]+$|^@oratio-[a-z0-9\-]+$/, true, 'Oration im falschen Format'],
			[/-introductio$/, /^(!.*\n\n)*!.*$/, true, 'Einleitung im falschen Format']
		],
		'biblia-la': [
			[/./, /^[a-zA-ZæÆœŒáéíóúýÁÉÍÓÚǽ0-9() \n<>’\/\-.:,;?!…–»«›‹_@]+$/, true, 'Illegales Zeichen'],
			[/./, /^@[a-z0-9\-]+$|^(Psalmus \d+( [AB])?( [IVX]+( \([A-Z][a-z]+\))?)?|Canticum|Lectio) <([12] )?[A-Z][a-z]+[^>]+>\n\n/, true, 'Fehlerhafte Überschrift']
		],
		'lectionis-la': [
			[/./, /^[a-zA-ZæÆœŒáéíóúýÁÉÍÓÚǽàçèêõ0-9() \n<>’\/\-.:,;?!…–»«›‹_@~=]+$/, true, 'Illegales Zeichen'],
			[/^responsorium-/, /^Responsorium(?: <[^<>]+>)?\n\nR .+\n.(.+)\n\nV .+\n.\1$|^@responsorium-[a-z0-9\-]+$/, true, 'Responsorium im falschen Format'],
			[/^lectio-lectionis-.*-a$/, /^Lectio prior\n\n(~lectio-lectionis-[a-z0-9\-]+a-alt\d?,responsorium-lectionis-[a-z0-9\-]+ Vel[^\n]+\n\n)*![^\n]+\n\n|^@lectio-lectionis-[a-z0-9\-]+-a(-alt2)?$/, true, 'Lesung im falschen Format (1)'],
			[/^lectio-lectionis-.*-b$/, /^Lectio altera\n\n(~lectio-lectionis-[a-z0-9\-]+b-alt\d?,responsorium-lectionis-[a-z0-9\-]+ Vel[^\n]+\n\n)*![^\n]+\n\n(=[^\n]+\n\n)?|^@lectio-lectionis-[a-z0-9\-]+-b$/, true, 'Lesung im falschen Format (2)']
		],
		'en': [
			[/./, /^[a-zA-Z0-9() \n<>’\/\-.:,;?!…–“”_@%*+{}|]+$/, true, 'Illegales Zeichen (1)'],
			[/^(?!date-format|dominica|hebdomada|modus-|te-deum$)/, /[%*+{}|]/, false, 'Illegales Zeichen (2)'],
			[/^antiphona-/, /\n/, false, 'Zeilenumbruch in Antiphon'],
			[/^hymnus-/, /^Hymn\n\n|^@hymnus-[a-z0-9\-]+$/, true, 'Hymnus ohne Titel'],
			[/^responsorium-(?!substitutum-)/, /^Responsory\n\nR .+\n.+ - R\n\nV .+\n.+$|^@responsorium-[a-z0-9\-]+$/, true, 'Responsorium im falschen Format'],
			[/^versus-(?!lectionis-)/, /^Responsory\n\n.+\n.+$|^@versus-[a-z0-9\-]+$/, true, 'Versikel im falschen Format'],
			[/^versus-lectionis-/, /^Verse\n\n.+\n.+$|^@versus-[a-z0-9\-]+$/, true, 'Versikel im falschen Format'],
			[/^preces-/, /^Intercessions\n\n|^@preces-[a-z0-9\-]+$/, true, 'Preces im falschen Format'],
			[/^oratio-/, /^Concluding Prayer\n\n.+ @[a-z0-9\-]+$|^@oratio-[a-z0-9\-]+$/, true, 'Oration im falschen Format'],
			[/-introductio$/, /^(!.*\n\n)*!.*$/, true, 'Einleitung im falschen Format']
		],
		'biblia-en': [
			[/./, /^[a-zA-Z0-9() \n<>\/\-.:,;?!…–“”‘’_@]+$/, true, 'Illegales Zeichen'],
			[/./, /^@[a-z0-9\-]+$|^(Psalm \d+( [AB])?( [IVX]+( \([A-Z][a-z]+\))?)?|Canticle|Reading)(?: <([12] )?[A-Z][a-z]+[^>]+>)?\n\n/, true, 'Fehlerhafte Überschrift']
		],
		'lectionis-en': [
			[/./, /^[a-zA-Z0-9() \n<>\/\-.:,;?!…–“”‘’_@]+$/, true, 'Illegales Zeichen'],
			[/^responsorium-/, /^Responsory(?: <[^<>]+>)?\n\nR .+\n.(.+)\n\nV .+\n.\1$|^@responsorium-[a-z0-9\-]+$/, true, 'Responsorium im falschen Format'],
			[/^lectio-lectionis-.*-a$/, /^First Reading\n\n!|^@lectio-lectionis-[a-z0-9\-]+-a$/, true, 'Lesung im falschen Format (1)'],
			[/^lectio-lectionis-.*-b$/, /^Second Reading\n\n!|^@lectio-lectionis-[a-z0-9\-]+-b$/, true, 'Lesung im falschen Format (2)']
		]
	};
	//jscs:enable maximumLineLength

	l10n.test(file, function (data) {
		var result = {}, key, lang;

		function add (key, msg) {
			if (!result[key]) {
				result[key] = [];
			}
			result[key].push(msg);
		}

		function checkOne (key, value, entry) {
			if (entry[0].test(key) && entry[1].test(value) !== entry[2]) {
				return entry[3];
			}
		}

		function checkSuit (key, value, entries) {
			var i, msg;
			for (i = 0; i < entries.length; i++) {
				msg = checkOne(key, value, entries[i]);
				if (msg) {
					add(key, msg);
				}
			}
		}

		function checkSuits (key, value) {
			checkSuit(key, value, re['']);
			if (re[':' + lang]) {
				checkSuit(key, value, re[':' + lang]);
			}
			if (re[file]) {
				checkSuit(key, value, re[file]);
			}
			if (lang === 'la') {
				if (!checkAccents(value)) {
					add(key, 'Akzente: ' + globalLastWord);
				}
			}
		}

		lang = file.replace(/\.txt$/, '').replace(/^.*-/, '');

		for (key in data) {
			if (data.hasOwnProperty(key)) {
				checkSuits(key, data[key].replace(/\n+$/, ''));
			}
		}

		callback(result);
	});
}

function formatDuplicates (file, result) {
	var i;
	for (i = 0; i < result.length; i++) {
		if (result[i]) {
			if (i && result[i - 1]) {
				result[i - 1] = '<code>[' + result[i - 1] + ']</code><br>';
			}
			result[i] = result[i].replace(/</g, '&lt;');
		}
	}
	return '<h2>Doppelte Schlüssel in ' + file + '</h2><p>' + result.map(function (entry) {
		return entry || '<hr>';
	}).join('') + '</p>';
}

function formatKeys (lang, list) {
	return '<h2>Fehlende Schlüssel in ' + lang + '</h2><ul>' + list.map(function (key) {
		return '<li><code>[' + key + ']</code></li>';
	}).join('') + '</ul>';
}

function formatCheckFormat (file, result) {
	return '<h2>Schlüssel mit Daten im falschen Format in ' + file + '</h2><ul>' + Object.keys(result).map(function (key) {
		return '<li><code>[' + key + ']</code>: ' + result[key].join(', ') + '</li>';
	}).join('') + '</ul>';
}

function convertFormat (data, key) {
	function formatLectio (lectio) {
		return lectio
			.replace(/\n\n\d+\S* /g, '\n')
			.replace(/\n\d+\S* /g, ' ')
			.replace(/\n\n/g, '\n')
			.replace(/[»«]/g, '[amp;quot;')
			.replace(/…/g, '...')
			.replace(/–/g, '-')
			.replace(/\n=/g, '\n')
			.replace(/(\n![^\n]+)<([^>]+)>/g, '$1($2)')
			.replace(/ <[^>]+>/g, '')
			.replace(/ \/ /g, ' ')
			.replace(/__([^_]+)__/g, function (all, em) {
				return em.split('').join(' ').replace(/ {2,}/g, ' ');
			})
			.replace('Erste Lesung', 'ERSTE LESUNG')
			.replace('Zweite Lesung', 'ZWEITE LESUNG');
	}
	function formatResponsorium (responsorium) {
		return responsorium
			.replace(/\n/g, ' * ')
			.replace(/–/g, '-')
			.replace(/[»«]/g, '[amp;quot;')
			.replace(/ \* {2}\* /g, '\n')
			.replace('Responsorium', 'RESPONSORIUM');
	}
	return [
		formatLectio(data['lectio-lectionis-' + key + '-a'] || ''),
		formatResponsorium(data['responsorium-lectionis-' + key + '-a'] || ''),
		formatLectio(data['lectio-lectionis-' + key + '-b'] || ''),
		formatResponsorium(data['responsorium-lectionis-' + key + '-b'] || '')
	].join('');
}

function convertRange (base, year, start, end, callback) {
	l10n.test(year ? 'lectionis-de' : 'lectionis-la', function (data) {
		var i, output = [];
		for (i = start; i <= end; i++) {
			output.push(convertFormat(data, base + i + year));
		}
		callback(output.join('\n\n'));
	});
}

function runDuplicateTest (file, output) {
	findDuplicates(file, function (result) {
		output.innerHTML = formatDuplicates(file, result);
	});
}

function runCompareTest (a, b, output) {
	compareKeys(a, b, function (list1, list2) {
		output.innerHTML = formatKeys(a, list1) + formatKeys(b, list2);
	});
}

function runDiffTest (a, b, output) {
	equalKeys(a, b, function (data) {
		var html = [], key;
		for (key in data) {
			if (data.hasOwnProperty(key)) {
				html.push('<p><code>[' + key + ']</code><br>');
				html.push(schnarkDiff.htmlDiff(data[key][0], data[key][1]));
				html.push('</p>');
			}
		}
		output.innerHTML = html.join('');
	});
}

function runFormatTest (file, output) {
	checkFormat(file, function (result) {
		output.innerHTML = formatCheckFormat(file, result);
	});
}

function runConvert (data, output) {
	data = /^([a-z]+)(-?\d+)(i*)-(\d+)$/.exec(data) || ['', 'pa', '1', 'i', '2'];
	convertRange(data[1], data[3], Number(data[2]), Number(data[4]), function (result) {
		output.innerHTML = '<pre>' + result.replace(/</g, '&lt;') + '</pre>';
	});
}

function runPrefix (file, prefix, output) {
	l10n.test(file, function (data) {
		var list = [], key;
		for (key in data) {
			if (key.indexOf(prefix) === 0) {
				list.push(key);
			}
		}
		list.sort(function (a, b) {
			a = data[a];
			b = data[b];
			return a === b ? 0 : (a < b ? -1 : 1);
		});
		output.innerHTML = list.map(function (key) {
			return '<p><code>[' + key + ']</code><br>' + data[key] + '</p>';
		}).join('');
	});
}

function updateInputs (mode) {
	var inputs = document.getElementsByClassName('hide'), i;
	for (i = 0; i < inputs.length; i++) {
		inputs[i].style.display = inputs[i].classList.contains(mode) ? '' : 'none';
	}
}

function onModeChange () {
	updateInputs(document.getElementById('mode').value);
}

function run () {
	switch (document.getElementById('mode').value) {
	case 'compare':
		runCompareTest(
			document.getElementById('file1').value,
			document.getElementById('file2').value,
			document.getElementById('output')
		);
		break;
	case 'diff':
		runDiffTest(
			document.getElementById('file1').value,
			document.getElementById('file2').value,
			document.getElementById('output')
		);
		break;
	case 'duplicate':
		runDuplicateTest(
			document.getElementById('file').value,
			document.getElementById('output')
		);
		break;
	case 'format':
		runFormatTest(
			document.getElementById('file').value,
			document.getElementById('output')
		);
		break;
	case 'convert':
		runConvert(
			document.getElementById('data').value,
			document.getElementById('output')
		);
		break;
	case 'prefix':
		runPrefix(
			document.getElementById('file').value,
			document.getElementById('prefix').value,
			document.getElementById('output')
		);
	}
}

function init () {
	document.getElementById('diff-style').textContent = schnarkDiff.getCSS();
	document.getElementById('mode').onchange = onModeChange;
	onModeChange();
	document.getElementById('run').onclick = run;
}

init();

})();
