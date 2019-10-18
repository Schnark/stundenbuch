/*global Day, Config, l10n, getHora, schnarkDiff*/
(function () {
"use strict";

var dateInput,
	proxy = 'https://lit-beach-8985.herokuapp.com/?url=';

function escapeRe (str) {
	return str.replace(/([\\{}()|.?*+\-\^$\[\]])/g, '\\$1');
}

function onPrev () {
	dateInput.value = (new Day(dateInput.value)).prev().format();
}

function onNext () {
	dateInput.value = (new Day(dateInput.value)).next().format();
}

function updateExtra (extra) {
	var extraInput = document.getElementById('extra'),
		extraButton;
	if (extraInput.value !== extra.join('|')) {
		extraButton = document.getElementById('extra-button');
		extraButton.onclick = function () {
			extraInput.value = extra.join('|');
		};
		extraButton.disabled = false;
	}
	if (extra.length) {
		window.parent.postMessage(extra, '*');
	}
}

function show (html) {
	var re = /(\[[^\[\]]*\])| (N\.) /g,
		result, todos = [];
	while ((result = re.exec(html))) {
		if (todos.indexOf(result[1] || result[2]) === -1) {
			todos.push(result[1] || result[2]);
		}
	}
	document.getElementById('main').innerHTML = '<ul>' + todos.map(function (todo) {
		return '<li>' + todo.replace(/</g, '&lt;') + '</li>';
	}).join('') + '</ul>' + html;
	l10n.clearStorage(true);
	window.parent.postMessage('done', '*');
}

function showLinks (hora, date) {
	document.getElementById('links').innerHTML = [
		['App', 'index.html?' + date.format() + '|' + hora],
		['katholisch.de', getUrl('de', hora, date)],
		['stundengebet.de', getUrl('de-x-unspecific-2')],
		['vulgata.org', getUrl('de-x-unspecific')],
		['ibreviary.org', getUrl('en-x-unspecific')],
		['breviarium.info', getUrl('la', hora, date)],
		['almudi.org', getUrl('la-x-unspecific')],
		['universalis.com', getUrl('mul', hora, date)],
		['diff', 'test-diff.html']
	].map(function (entry) {
		return '<a href="' + entry[1] + '" target="_blank" rel="noopener">' + entry[0] + '</a>';
	}).join(' – ');
}

function canCompare (lang, hora) {
	return (
		(lang === 'de' || lang === 'mul') &&
		['laudes', 'tertia', 'sexta', 'nona', 'vespera', 'completorium'].indexOf(hora) > -1
	) || lang === 'de-x-local' || lang === 'la';
}

function getConfig (lang, hora, extra, compare) {
	var config = {},
		notes = {
			de: [
				'50|e'
			],
			la: [
				'23|7|birgitta|1|religiosus,mulier',
				'9|8|teresia-benedicta|1|martyr,virgo'
			]
		};
	notes['de-x-local'] = notes.de;
	config.rvMode = 'original';
	config.flexaAsteriscus = '+|*|<br>';
	config.psalmusInvitatorium = 'ps-95';
	config.invitatoriumLocus = '';
	config.calendar = 'de';
	config.additionalDays = extra;
	config.commemoratio = !!extra.length;
	config.notes = '';
	config.papa = 'N.';
	config.episcopus = 'N.';
	config.modusMaria = 2;
	if (compare && notes[lang]) {
		config.notes = notes[lang].join('\n');
	}
	if (lang === 'de' && compare) {
		config.moreHymns = true;
		config.varyCanticaLaudes = true;
		config.paterNosterIntro = 2;
		config.memoriaTSN = true;
		config.bugCompat = true;
	} else if (lang === 'de-x-local' && compare) {
		config.rvMode = hora === 'lectionis' ? 'original' : 'expand';
		config.moreHymns = true;
		config.flexaAsteriscus = '†|*|<br>';
		config.varyCanticaLaudes = true;
		config.memoriaTSN = true;
		config.bugCompat = true;
		config.marianAntiphon = 'completorium';
	} else if (lang === 'la' && compare) {
		config.rvMode = hora === 'lectionis' ? 'original' : 'expand';
		config.flexaAsteriscus = '†|*|<br>';
		config.removeDuplicateAntiphon = true;
		config.calendar = '';
	} else {
		config.papa = 'Franziskus';
		config.episcopus = 'Stephan';
		config.psOratio = true;
		config.marianAntiphon = 'completorium';
	}

	return new Config(config);
}

function normalizeLocalHtml (html) {
	return html
		.replace(/<sup.*?<\/sup>/g, '')
		.replace(/<span class="solidus"> \/<\/span>/g, '')
		.replace(/<\/?span[^>]*>/g, '')
		/*.replace(/<h2>Lectio[\s\S]*?<h2>/, function (lectio) {
			return lectio.replace(/<sup.*?<\/sup>/g, '');
		})*/
		.replace(/<h2>.*?<\/h2>/g, function (headline) {
			return headline
				.replace(/<cite>\(/g, '')
				.replace(/\)<\/cite>/g, '');
		})
		.replace(/<em>([^<]*)<\/em>/g, function (all, em) {
			return em.split('').join(' ');
		})
		/*/.replace(/<h2>Zweite Lesung[\s\S]*?<h2>/, function (lectio) {
			var cites = [];
			lectio = lectio.replace(/([.,] ?)?<cite>(.*?)<\/cite>/g, function (all, punct, cite) {
				var n = cites.length + 1;
				cites.push(n + ' ' + cite.replace(/^\(|\)$/g, '') + '. ');
				return ' (' + n + ')' + (punct || '');
			});
			return lectio.replace(/<h2>$/, cites.join('') + '<h2>');
		})/**/
		.replace(/℟ Halleluja\./g, '(℟ Halleluja.)')
		.replace(/Halleluja\.<br>\(℟ Halleluja\.\)/g, '℟ Halleluja (Halleluja).')
		.replace('<h2>Versus</h2>', '')
		.replace('<h2>Versikel</h2>', '')
		.replace('<h2>Abschluss</h2>', '')
		.replace(/Enfallende Bahnlesung, die mit anderen der laufenden Woche verbunden werden kann[\s\S]*/, '')
		.replace(/Lectio continua omissa ad componere cum aliis in eadem hebdomada[\s\S]*/, '')
		.replace(/Áperi, Dómine, os meum[\s\S]*?tuæ\./, '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ');
}

function normalizeWebHtml (html, lang, easter) {
	if (lang === 'de') {
		return normalizeDeWebHtml(html, easter);
	}
	if (lang === 'de-x-local') {
		return normalizeDeLocalWebHtml(html, easter);
	}
	if (lang === 'la') {
		return normalizeLaWebHtml(html);
	}
	if (lang === 'mul') {
		return normalizeMulWebHtml(html);
	}
	return normalizeLocalHtml(html);
}

function fixDe (text) {
	var fixes = [
		['Amen ', 'Amen.'],
		['Ewigkeit. ℣ Singet Lob', 'Ewigkeit. ℟ Amen. ℣ Singet Lob'],
		['Herrn. ℣ Singet Lob', 'Herrn. ℟ Amen. ℣ Singet Lob'],
		['(vgl. ', '(Vgl. '],
		['Mein Gott, eile mir zu Hilfe!', 'Mein Gott, eil mir zu Hilfe!'], //Psalm 71
		['und hatten doch mein Tun gesehen.«', 'und hatten doch mein Tun gesehen.'], //Psalm 95
		['Vierzig Jahre war mir dies Geschlecht zuwider †', 'Vierzig Jahre war mir dies Geschlecht zuwider, †'], //Psalm 95
		['Der Messias, König und Priester', 'Einsetzung des priesterlichen Königs'], //Einleitung Ps 110
		['Dank für Gottes Rettung und Heil', 'Dank für Rettung und Heil'], //Einleitung Ps 118 (TSN)
		['Dies ist der Stein, der von euch Bauleuten verworfen wurde', 'Er ist der Stein, der von euch Bauleuten verworfen wurde'], //Einleitung Ps 118 (TSN)
		['himmlichen', 'himmlischen'], //Einleitung Ps 122
		['unermeßbarer', 'unermessbarer'], //Te Deum
		['führt dem Vater seinen verlorenen Sohn', 'führt dem Vater seinen verlornen Sohn'], //Hymnus Lesehore So
		['Siegesfreude füllt unsere Seele ganz', 'Siegesfreude füllt unsre Seele ganz'], //Hymnus Lesehore So
		['Danket dem Herrn; denn seine Huld währt ewig!', 'Danket dem Herrn, denn seine Huld währt ewig!'], //Invitatorium-Antiphon Freitag 3. Woche
		['Sie verteilen unter sich meine Kleider und werfen', 'Sie verteilten unter sich meine Kleider und warfen'], //Antiphon zu Psalm 22, Freitag 3. Woche TSN
		['Herr, lenke unsere Schritte auf den Weg des Friedens.', 'Herr, lenke unsre Schritte auf den Weg des Friedens.'], //Benedictus-Antiphon Samstag 2. Woche
		['Verwirf mich nicht vor deinem Angesicht', 'Verwirf mich nicht von deinem Angesicht'], //Versikel Terz Montag 2. Woche
		['℣ Und sie hielten fest', '℣ Sie hielten fest'], //Versikel Sext Apostel
		['unsere Stadt (unsere Gemeinde)', 'unsere Stadt'], //Fürbitten Mittwoch 2. Woche
		['Klugkeit', 'Klugheit'], //Fürbitten Dienstag 3. Woche
		['und jeder die Fähigkeit entfaltet', 'und jeder die Fähigkeiten entfaltet'], //Oration Terz Montag 2. Woche
		['bitten auch wir dich im Namen Jesu', 'bitten wir dich im Namen Jesu'], //Oration Non Montag 2. Woche
		['Herr Jesus Christus, um die neunte Stunde', 'Herr Jesus, um die neunte Stunde'], //Oration Non Freitag 2. Woche
		['Mutter der Barmherzigkeit,', 'Mutter der Barmherzigkeit;'], //Salve Regina
		['uns’re', 'unsre'], //Salve Regina
		['Hoffnung, sei gegrüßt.', 'Hoffnung, sei gegrüßt!'], //Salve Regina
		['verbannte Kinder Evas,', 'verbannte Kinder Evas;'], //Salve Regina
		['. O gütige, o milde, o süße Jungfrau Maria.', '! O gütige, o milde, o süße Jungfrau Maria!'] //Salve Regina
	], i;
	for (i = 0; i < fixes.length; i++) {
		text = text.replace(new RegExp(escapeRe(fixes[i][0]), 'g'), fixes[i][1]);
	}
	return text;
}

function normalizeDeWebHtml (html, easter) {
	//jscs:disable maximumLineLength
	var div;
	html = html
		.replace(/[\s\S]*<div class="stundenbuch-output">/, '')
		.replace(/<\/body>[\s\S]*/, '')
		.replace(/<div class="footer-wraper">[\s\S]*/, '')
		.replace(/>V</g, '>\u2123 <')
		.replace(/>R</g, '>\u211f <')
		.replace(/>\d+[a-f]?</g, '><')
		.replace(/(\d\)?,)(\d)/g, '$1 $2')
		.replace(/(\d[a-g]?)-(\d?[a-g]?)/g, '$1–$2')
		.replace('Herr, eile, mir zu helfen', 'Herr, eile mir zu helfen')
		.replace('SCHULDBEKENNTNIS', 'Schuldbekenntnis (Stille zur Gewissenserforschung)')
		.replace('An dieser Stelle wird eine Gewissenserforschung empfohlen.', '')
		.replace(' - [alle schlagen an die Brust]', ',')
		.replace('VERGEBUNGSBITTE', '')
		.replace('HYMNUS', ' Hymnus')
		.replace('PSALMODIE', '')
		.replace(/Psalm (\d+)/g, 'Psalm $1 Ps $1')
		.replace('KURZLESUNG', 'Lesung')
		.replace('RESPONSORIUM', 'Responsorium')
		.replace(/R (.*?) - R <br\/>V (.*?) - R/, '\u211f $1 – \u211f<br> \u2123 $2 – \u211f')
		.replace(/>[^<>]*Antiphon<\/h4><div class="output">([^<]*)([\s\S]*?)(<h[^>]*>.*?<\/h[^>]*>|NUNC DIMITTIS Lk 2, 29–32|<span style='margin-left:120px;font-weight:bold'>III?<\/span>)(<[pi][^>]*>[^<]*<[^>]*>)?(<p[^>]*>[^<]*<[^>]*>)?/g, '</h4> $3 $4 $5 Ant.: $1')
		.replace(/(Magnificat|Benedictus)-Antiphon/, 'Ant.:')
		.replace(/Antiphon/g, 'Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit * und in Ewigkeit. Amen. Ant.:')
		.replace('NUNC DIMITTIS', 'Nunc Dimittis')
		.replace('F&Uuml;RBITTEN', html.indexOf('Benedictus') > -1 ? 'Bitten' : 'Fürbitten')
		.replace(/<br\/>- /g, '<br>')
		.replace('<br/>Vater unser. <br/>', '')
		.replace('&Uuml;BERLEITUNG ZUM VATER UNSER', '')
		//.replace('Herr, erbarme dich <span class=\'red\'>(</span>unser<span class=\'red\'>)</span>. Christus, erbarme dich <span class=\'red\'>(</span>unser<span class=\'red\'>)</span>. Herr, erbarme dich <span class=\'red\'>(</span>unser<span class=\'red\'>)</span>.', '')
		.replace('VATER UNSER', 'Vaterunser')
		.replace('Geheiligt werde dein Name', 'geheiligt werde dein Name')
		.replace('Unmittelbar anschlie&szlig;end an die letzte Bitte des Vaterunsers:', '')
		.replace(/Wenn ein Priester [\s\S]+ lautet der Schlusssegen:/, 'Segen')
		.replace('ABSCHLUSS', '')
		//.replace(/<br\/>\(R [^)]+\)/g, ' ')
		.replace(/<br\/>/g, ' ')
		.replace(/[«»]/g, function (c) {
			return c === '»' ? '«' : '»';
		})
		.replace(/\s-\s/g, ' – ')
		.replace(/\s-,/g, ' –,')
		.replace(/\.\.\./g, ' …');
	div = document.createElement('div');
	div.innerHTML = html;
	return fixDe(div.textContent
		.replace(/\s+/g, ' ')
		.replace(/[´`']/g, '’')
		.replace(/"(\S.*?\S)"/g, '»$1«')
		.replace(/«(\S.*?\S)»/g, '»$1«')
		.replace(/\(O(?:sterzeit)?: Halleluja\.?\)/g, easter ? 'Halleluja.' : '')
		.replace('Geist, * ihn loben und rühmen in Ewigkeit! Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit * und in Ewigkeit. Amen.', 'Geist, * ihn loben und rühmen in Ewigkeit!')
		.replace('Ehre sei dem Vater. Wie im Anfang.', 'Ehre sei dem Vater und dem Sohn und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.')
		.replace(/R Halleluja/g, '\u211f Halleluja')
		.replace('℟ Halleluja (Halleluja). Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit * und in Ewigkeit. Amen.', '℟ Halleluja (Halleluja). Halleluja. Ehre sei dem Vater und dem Sohn und dem Heiligen Geist. * (℟ Halleluja.) Wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen. ℟ Halleluja (Halleluja).')
		.replace(/\b[RV] /g, ''));
	//jscs:enable maximumLineLength
}

function normalizeDeLocalWebHtml (html, easter) { //FIXME
	//jscs:disable maximumLineLength
	var div;
	html = html
		.replace(/[\s\S]*<body[^<>]+>/, '')
		.replace(/<\/body>[\s\S]*/, '')
		.replace('<h2>Psalm</h2>', '')
		.replace(/<span class="rub2"(?: id="ant")?>(?:\d\. Ant\.|Antiphon)<\/span> <span id="HL\d+">([^<]+)<\/span>(\s*<\/p>\s*<p class="rub2 center[\s\S]*?)(<span id="HL|<span >\()/g, '$2 Ant. $1 $3')
		.replace(/(\d\. )?Ant\./g, 'Ant.:')
		.replace(/(?:FÜRBITTEN|BITTEN)[\s\S]*Vater unser/, function (preces) {
			return preces.replace(/³/, '')
				.replace(/³<\/span> <span id="HL\d+">[^<]*</g, '<')
				.replace(/\(R [^<]*</g, '<');
		})
		.replace(/<br\/> +–/g, '')
		.replace(/<div id="lat"[\s\S]*?<\/div>/, '')
		.replace(/</g, ' <');
	div = document.createElement('div');
	div.innerHTML = html;
	return fixDe(div.textContent
		.replace(/Antiphon:?/g, 'Ant.:')
		.replace(/(\d\)?,)(\d)/g, '$1 $2')
		.replace(/(\d[a-g]?)-(\d?[a-g]?)/g, '$1–$2')
		.replace('SCHULDBEKENNTNIS', 'Schuldbekenntnis (Stille zur Gewissenserforschung)')
		.replace('An dieser Stelle wird eine Gewissenserforschung empfohlen.', '')
		.replace(' - [alle schlagen an die Brust]', ',')
		.replace('Vergebungsbitte', '')
		.replace('HYMNUS', 'Hymnus')
		.replace('PSALMODIE', '')
		.replace(/ERSTE LESUNG[\s\S]*ZWEITE LESUNG/, function (lectio) {
			return lectio.replace(/á/g, 'a')
				.replace(/é/g, 'e')
				.replace(/í/g, 'i')
				.replace(/ó/g, 'o')
				.replace(/ú/g, 'u')
				.replace(/Á/g, 'A')
				.replace(/É/g, 'E')
				.replace(/Í/g, 'I');
		})
		.replace(/Ps (\d+)/g, 'Psalm $1 Ps $1')
		.replace(/ZWEITE LESUNG[\s\S]*/, function (lectio) {
			return lectio.replace(/Psalm (\d+) Ps \1/g, 'Ps $1');
		})
		.replace('KURZLESUNG', 'Lesung')
		.replace('ERSTE LESUNG', 'Erste Lesung')
		.replace('ZWEITE LESUNG', 'Zweite Lesung')
		.replace(/(RESPONSORIUM[\s\S]*?)\*\s*([^*]*?)(Ehre sei dem Vater und dem Sohn)/, function (all, $1, $2, $3) {
			return $1 + '³ ' + $2.slice(0, 1).toUpperCase() + $2.slice(1) + '² ' + $3;
		})
		.replace(/RESPONSORIUM/g, 'Responsorium')
		.replace('BENEDICTUS', 'Benedictus Lk 1, 68–79 Der Messias und sein Vorläufer')
		.replace('MAGNIFICAT', 'Magnificat Lk 1, 46–55 Mein Geist jubelt über Gott')
		.replace('NUNC DIMITTIS', 'Nunc Dimittis Lk 2, 29–32 Christus, Licht der Völker und Herrlichkeit Israels')
		.replace('TE DEUM', 'Te Deum')
		.replace('(Rette dein Volk, o Herr,', 'Der letzte Teil kann entfallen. Rette dein Volk, o Herr,')
		.replace('In Ewigkeit werde ich nicht zuschanden.)', 'In Ewigkeit werde ich nicht zuschanden.')
		.replace('FÜRBITTEN', 'Fürbitten')
		.replace('BITTEN', 'Bitten')
		.replace('(Fürbitten in besonderen Anliegen)', 'Hier können Fürbitten in besonderen Anliegen eingefügt werden.')
		.replace('(Bitten in besonderen Anliegen)', 'Hier können Bitten in besonderen Anliegen eingefügt werden.')
		.replace(/\(Kyrie, eleison.\s+Christe, eleison.\s+Kyrie, eleison.\)/, '')
		.replace('Vater unser im Himmel', 'Vaterunser Vater unser im Himmel')
		.replace(/Wie im Anfang so auch jetzt und alle Zeit/g, 'Wie im Anfang, so auch jetzt und alle Zeit')
		.replace('(mit den Laudes oder der Lesehore fortfahren, die Erföffnung entfällt dort, es geht direkt mit dem Hymnus weiter)', '')
		.replace('MARIANISCHE ANTIPHON', '')
		.replace(/[«»]/g, function (c) {
			return c === '»' ? '«' : '»';
		})
		.replace(/\s-\s/g, ' – ')
		.replace(/\s-,/g, ' –,')
		.replace(/\.\.\./g, ' …')
		.replace(/[´`']/g, '’')
		.replace(/"(\S.*?\S)"/g, '»$1«')
		.replace(/«(\S.*?\S)»/g, '»$1«')
		.replace(/²/g, '\u2123')
		.replace(/³/g, '\u211f')
		.replace(/\( ℟/g, '(℟')
		.replace(/\(O(?:sterzeit)?: Halleluja\.?\)/g, easter ? 'Halleluja.' : '')
		.replace(/\s+/g, ' ')
		.replace('℣ Singet Lob und Preis.', html.indexOf('ZWEITE LESUNG') > -1 ? '℟ Amen. \u2123 Singet Lob und Preis.' : '℣ Singet Lob und Preis.')
		.replace('Eine ruhige Nacht und ein gutes Ende', '℟ Amen. Segen Eine ruhige Nacht und ein gutes Ende')
		.replace('℣ Der Herr segne uns. Er bewahre uns vor Unheil und führe uns zum ewigen Leben.', '℟ Amen. Segen Der Herr segne uns, er bewahre uns vor Unheil und führe uns zum ewigen Leben.'));
	//jscs:enable maximumLineLength
}

function normalizeLaWebHtml (html, easter) {
	//jscs:disable maximumLineLength
	var div;
	html = html
		.replace(/[\s\S]*ze serveru http:\/\/breviar.op.cz<\/p>/, '')
		.replace(/<p class=pouzetisk style='margin:40 0 -20 10 px; text-align:center; font-size:12px; '>BREVIARIUM ROMANUM<\/p>[\s\S]*/, '')
		.replace(/'#FF0000'/g, '"#FF0000"')
		.replace(/<font color="#FF0000">\s*†?<\/font>/g, '')
		.replace(/<p>\s*<\/p>\s*/g, '')
		.replace(/<\/b>\s*<\/b>/g, '</b>')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/ –</g, '<')
		.replace(/.(<\/i> \([^()]+\))/g, '$1 .')
		.replace(/<p><font color="#FF0000"><font size=-1>&nbsp;&nbsp;&nbsp; Invitatorium locum suum habet[\s\S]*?eius loco dicitur psalmus 94 \(95\)<\/a>. <\/font><\/font>/, '')
		.replace(/<font color="#FF0000"><font size=-1>Quando sequens psalmus adhibitus est ad Invitatorium, loco eius dicitur <a href="\/obsah\/z95.htm" class="red">psalmus 94 ?\(95\)<\/a>.<\/font><\/font>/, '')
		.replace(/<p><font size=-1><font color="#FF0000">Sequens canticum dicitur cum <\/font><font color="#000000">Allelúia<\/font><font color="#FF0000">\s+prouti hic notatur, quando cum cantu profertur; in recitatione vero sufficit ut Allelúia dicatur in initio et fine uniuscuiusque strophæ.<\/font><\/font>/, '')
		.replace('<p><span class="red">(In fine huius cantici non dicitur </span> «Glória Patri»<span class="red">.)</span>', '')
		.replace('<p><b>&nbsp;&nbsp;&nbsp;Allelúia.</b>\n<br><font color="#FF0000"><sup>1</sup></font>', '<p><font color="#FF0000"><sup>1</sup></font><b>&nbsp;&nbsp;&nbsp;Allelúia.</b>\n<br>')
		.replace(/<font color="#FF0000">A[^<>]*nt\.[^<>]*<\/font>(?:<\/b> *<b>)?([^<>]+(?:<font color="#FF0000">\(T\.P\. <\/font>Allelúia\.<font color="#FF0000">\)<\/font>)?)(<\/b>\s*(?:<\/?p>\s*)*<center>[\s\S]*?)(<font color="#FF0000">(?:<sup>|R\.))/g, '$2 Ant.: $1 $3')
		.replace(/<\/b>(&nbsp;|\s|<p>|<br>)*<sup>\d+<\/sup>(?:&nbsp;|\s|<p>)*\[[\s\S]*?\]/g, '$1')
		.replace(/<sup.*?<\/sup>/g, '')
		.replace(/<font color="#FF0000">Ant\.\s*[123]?\s*<\/font>/g, 'Ant.: ')
		.replace(/(<font color="#FF0000">\*<\/font> )([a-z])/g, function (all, ast, letter) {
			return ast + letter.toUpperCase();
		})
		.replace(/<font color="#FF0000">V.<\/font>/g, '\u2123 ')
		.replace(/<font color="#FF0000">R.<\/font>/g, '\u211f ')
		.replace(/<br><font size=-1>[\s\S]*?<\/font>/, '')
		.replace(/Noctu vel summo mane:[\s\S]*Diurno tempore:/, '')
		.replace('HYMNUS', 'Hymnus')
		.replace('HYMNUS', 'Te Deum')
		.replace('PSALMODIA', '')
		.replace('LECTIO BREVIS', 'Lectio')
		.replace('LECTIO PRIOR', 'Lectio prior')
		.replace('LECTIO ALTERA', 'Lectio altera')
		.replace('RESPONSORIUM BREVE', 'Responsorium')
		.replace(/RESPONSORIUM/g, 'Responsorium')
		.replace('BENEDICTUS', 'Benedictus')
		.replace('Ad Benedictus, ant.', 'Ant.:')
		.replace('MAGNIFICAT', 'Magnificat')
		.replace('Ad Magnificat, ant.', 'Ant.:')
		.replace('CANTICUM EVANGELICUM', 'Nunc Dimittis')
		.replace('PRECES', 'Preces')
		.replace(/<br><b><font color="#ff0000">—<\/font>/gi, '<br><b>')
		.replace('<p class=pouzetisk><b>Pater noster.....</b></p>', '')
		.replace('Sanctus,* Sanctus,* Sanctus*', 'Sanctus, * Sanctus, * Sanctus *')
		.replace('<font color="#FF0000">* Hæc ultima pars hymni ad libitum omitti potest.</font>', '')
		.replace('<font color="#FF0000">*</font> Salvum fac ', 'Hæc ultima pars hymni ad libitum omitti potest. Salvum fac ')
		.replace('ORATIO', 'Oratio')
		.replace(/<p><font color="#FF0000"><font size=-1>&nbsp;&nbsp;&nbsp; Deinde, si præest [\s\S]*Absente sacerdote vel diacono, et in recitatione a solo, sic concluditur:<\/font><\/font>/, 'Benedictio')
		.replace(/<hr class="red">\s*<p align="center" class="redsmall">\s*<font color="#FF0000">\s*Vel:\s*<br>\(Psalmus sequens in psalterio currente adhibitur feria VI hebd\. I atque feria VI hebd\. III\)<\/font>[\s\S]*/, '')
		.replace('Deinde, saltem in celebratione communi, additur acclamatio:', 'Conclusio')
		.replace(/<br>/g, ' ');
	div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent
		.replace(/\s+/g, ' ')
		.replace(/\d+ \[[^\[\]]+\] */g, '')
		.replace(/\(R\. Allelúia\.\)/g, '℟ Allelúia.')
		.replace(/℟ Allelúia \(allelúia\)\./g, 'Allelúia. ℟ Allelúia.')
		.replace(/Allelúia\. Allelúia\. Allelúia\./g, 'Allelúia, allelúia, allelúia.')
		.replace(/Aleluja, aleluja, aleluja\./g, 'Allelúia, allelúia, allelúia.')
		.replace(/\(T\.P\. Allelúia\.?\)/g, easter ? 'Allelúia.' : '')
		.replace(/Glória Patri,? et Fílio,? (\* )?[eE]t Spirítui Sancto[.,] [sS]icut erat in princípio,? et nunc et semper,? (\* )?[eE]t in sǽcula sæculórum\./g, 'Glória Patri, et Fílio, $1et Spirítui Sancto. Sicut erat in princípio, et nunc et semper, $2et in sǽcula sæculórum.')
		.replace(/℣ Glória Patri et Fílio \* [eE]t Spirítui Sancto\./g, '℣ Glória Patri, et Fílio, et Spirítui Sancto.')
		.replace('℟ Allelúia. Glória Patri, et Fílio, * et Spirítui Sancto. Sicut erat in princípio, et nunc et semper, * et in sǽcula sæculórum. Amen.', '℟ Allelúia. Allelúia. Glória Patri, et Fílio, * ℟ Allelúia. et Spirítui Sancto. Allelúia. ℟ Allelúia. Allelúia. Sicut erat in princípio, et nunc et semper, * ℟ Allelúia. et in sǽcula sæculórum. Amen. Allelúia. ℟ Allelúia.')
		.replace('Postea laudabiliter fit conscientiæ discussio, quæ in celebratione communi inseri potest in actum pænitentialem, iuxta formulas in Missa adhibitas', 'Confiteor (Breva pausa silentii ad conscientiæ discussionem) Confíteor Deo omnipoténti et vobis, fratres, quia peccávi nimis cogitatióne, verbo, ópere et omissióne: mea culpa, mea culpa, mea máxima culpa. Ídeo precor beátam Maríam semper Vírginem, omnes Ángelos et Sanctos, et vos, fratres, oráre pro me ad Dóminum Deum nostrum. Misereátur nostri omnípotens Deus et, dimíssis peccátis nostris, perdúcat nos ad vitam ætérnam. Amen')
		.replace(/Si Officium lectionis dicitur immediate ante aliam Horam,\s+tunc initio prædicti Officii præponi potest hymnus huic Horæ congruus;.*/, '')
		.replace('Deinde dicitur una ex sequentibus antiphonis finalibus ad B. Mariam Virginem. vel Antiphonæ dominicanæ traditionales.', '')
		.replace('Pater noster', 'Pater Noster Pater noster')
		.replace('Oratio Orémus:', 'Oratio')
		.replace('CONCLUSIVA Orémus:', '')
		.replace('Amen. Noctem quiétam', '℟ Amen. Benedictio Noctem quiétam')
		.replace('sæculórum. Benedictio', 'sæculórum. ℟ Amen. Benedictio')
		.replace('Conclusio Benedicámus Dómino. ℟ Deo grátias. ', '℟ Amen. Conclusio ℣ Benedicámus Dómino. ℟ Deo grátias. ')
		.replace(/Psalmus (\d+)/g, 'Psalmus $1 Ps $1')
		.replace(/(\d[bc]?)-(\d)/g, '$1–$2')
		.replace(/(\d[a-d]?\.)\s+(\d)/g, '$1$2')
		.replace(/\s*—\s*/g, '–')
		.replace(/“(\S[^“”„"]*?\S)”/g, '‹$1›')
		.replace(/„/g, '«')
		.replace(/“/g, '»')
		.replace(/"(\S.*?\S)"/g, '«$1»')
		.replace(/ ?\.\.\./g, ' …')
		.replace(/\s+/g, ' ');
	//jscs:enable maximumLineLength
}

function normalizeMulWebHtml (html) {
	var div;
	html = html
		.replace(/[\s\S]*<h1>/, '<h1>')
		.replace(/The psalms and canticles here are our own translation[\s\S]*/, '')
		.replace(/<td valign="top" class="parallelR">[\s\S]*?<\/td>/g, '');
	div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent
		.replace(/\s+/g, ' ');
}

function getUrl (lang, hora, date) {
	switch (lang) {
	case 'de':
		hora = {
			laudes: 'laudes',
			tertia: 'terz',
			sexta: 'sext',
			nona: 'non',
			vespera: 'vesper',
			completorium: 'komplet'
		}[hora];
		hora = hora ? 'type=' + hora + '&' : '';
		date = 'date=' + date.format('%d.%M.%y');
		return 'http://stundenbuch.katholisch.de/stundenbuch.php?' + hora + date;
	case 'de-x-unspecific':
		return 'http://vulgata.info/index.php?title=Kategorie:Stundenbuch';
	case 'de-x-unspecific-2':
		return 'https://www.stundengebet.de/jetzt-beten/';
	case 'en-x-unspecific':
		return 'http://www.ibreviary.org/en/tools/ibreviary-web.html';
	case 'la':
		hora = {
			invitatorium: 'a=1',
			lectionis: 'a=2',
			laudes: 'a=3',
			tertia: 'a=4',
			'tertia-complementaris': 'a=4&dopln=1',
			sexta: 'a=5',
			'sexta-complementaris': 'a=5&dopln=1',
			nona: 'a=6',
			'nona-complementaris': 'a=6&dopln=1',
			vespera: 'a=7',
			completorium: 'a=8'
		}[hora] || '';
		return 'http://breviarium.info/?' + hora + '&datum=' + date.format();
	case 'la-x-unspecific':
		return 'https://www.almudi.org/Portals/0/docs/Breviario/fuentes/breviario.html';
	case 'mul':
		hora = {
			invitatorium: 'i-lauds',
			lectionis: 'readings',
			laudes: 'lauds',
			tertia: 'terce',
			sexta: 'sext',
			nona: 'none',
			vespera: 'vespers',
			completorium: 'compline'
		}[hora] || 'today';
		return 'http://www.universalis.com/L/' + date.format('%y%0M%0d') + '/' + hora + '.htm';
	}
}

function getLocalHtml (lang, hora, date, callback) {
	l10n.load(lang === 'mul' ? 'la' : lang, function () {
		callback(getHora(date, hora));
	});
}

function getWebHtml (lang, hora, date, callback) {
	if (lang === 'de-x-local') {
		getFileHtml('stb.html', hora, date, callback); //was: 'stundenbuch.json'
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var text = xhr.responseText;
		try {
			text = JSON.parse(text).error;
		} catch (e) {
		}
		callback(text || '');
	};
	xhr.onerror = function () {
		callback('');
	};
	xhr.open('GET', proxy + encodeURIComponent(getUrl(lang, hora, date)));
	xhr.send();
}

//download stundenbuch.json from https://www.stundengebet.de/kalender.html (see console, convert file to proper JSON formatting)
//old one, delete if it doesn't come back
/*function getFileHtml (file, hora, date, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var days, i, text;
		try {
			days = xhr.response[-1].BREVIER[0].TAG;
			for (i = 0; i < days.length; i++) {
				if (days[i].DATUM.value === date.format()) {
					break;
				}
			}
			text = days[i][{
				invitatorium: 'INVITATORIUM',
				lectionis: 'LESEHORE',
				laudes: 'LAUDES',
				tertia: 'TERZ',
				sexta: 'SEXT',
				nona: 'NON',
				vespera: 'VESPER',
				completorium: 'KOMPLET'
			}[hora]].value;
		} catch (e) {
		}
		callback(text || '');
	};
	xhr.onerror = function () {
		callback('');
	};
	xhr.open('GET', file);
	xhr.responseType = 'json';
	xhr.send();
}*/

function getFileHtml (file, hora, date, callback) {
	function getStartDay (doc) {
		var d, date;
		date = new Date();
		d = Number((/(\d+)\./.exec(doc.querySelectorAll('.carousel-item .date')[0].textContent))[1]);
		if (d > date.getDate()) {
			date.setMonth(date.getMonth() - 1);
		}
		return new Day(date.getFullYear(), date.getMonth(), d);
	}
	function extractHTML (doc, d, h) {
		return doc.querySelectorAll('.gebet-entry .carousel-item')[d].querySelectorAll('.item-' + h)[0].innerHTML;
	}

	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var doc, start, html;
		try {
			doc = (new DOMParser()).parseFromString(xhr.response, 'text/html');
			start = getStartDay(doc);
			html = extractHTML(doc, date.diffTo(start), {
				invitatorium: 'invitatorium',
				lectionis: 'lesehore',
				laudes: 'laudes',
				tertia: 'terz',
				sexta: 'sext',
				nona: 'non',
				vespera: 'vesper',
				completorium: 'komplet'
			}[hora]);
		} catch (e) {
			console.warn(e);
		}
		callback(html || '');
	};
	xhr.onerror = function () {
		callback('');
	};
	xhr.open('GET', file);
	xhr.responseType = 'text'; //don't know why 'document' doesn't work
	xhr.send();
}

function getDiffHtml (lang, hora, date, callback) {
	getLocalHtml(lang, hora, date, function (local) {
		getWebHtml(lang, hora, date, function (web) {
			callback('<p>' + schnarkDiff.htmlDiff(
				normalizeWebHtml(web, lang, date.getPart() === 3),
				normalizeLocalHtml(local)
			) + '</p>');
		});
	});
}

function init (lang, hora, date, extra, compare) {
	var config;
	dateInput = document.getElementById('date');
	document.getElementById('prev').onclick = onPrev;
	document.getElementById('next').onclick = onNext;
	document.getElementById('reload').onclick = function () {
		location.reload();
	};

	if (!canCompare(lang, hora)) {
		compare = false;
	}
	config = getConfig(
		lang,
		hora,
		extra.split('|').filter(function (name) {
			return name;
		}),
		compare
	);
	Config.setConfig(config);
	Day.init(config.get('calendar'), config.get('notes'));
	date = new Day(date);
	if (compare) {
		document.getElementById('diff-style').textContent = schnarkDiff.getCSS();
	}

	document.getElementById('lang').value = lang;
	document.getElementById('hora').value = hora;
	dateInput.value = date.format();
	document.getElementById('extra').value = extra;
	document.getElementById('compare').checked = compare;

	updateExtra(date.getAlternatives().filter(function (name) {
		return name;
	}));

	showLinks(hora, date);
	if (compare) {
		getDiffHtml(lang, hora, date, show);
	} else {
		getLocalHtml(lang, hora, date, show);
	}
}

function run () {
	var params = {};
	getHora.makeLink = function (date, hora) {
		return '?lang=' + params.lang +
			'&hora=' + hora +
			'&date=' + date.format() +
			'&extra=' + params.extra +
			'&compare=' + (params.compare || '');
	};
	location.search.slice(1)
		.split('&')
		.forEach(function (str) {
			var pos = str.indexOf('=');
			if (pos !== -1) {
				params[decodeURIComponent(str.slice(0, pos))] = decodeURIComponent(str.slice(pos + 1));
			}
		});
	if (['de', 'de-x-local', 'en', 'la', 'mul'].indexOf(params.lang) === -1) {
		params.lang = 'de';
	}
	if (
		['index', 'invitatorium', 'lectionis', 'laudes',
			'tertia', 'tertia-complementaris',
			'sexta', 'sexta-complementaris',
			'nona', 'nona-complementaris',
			'vespera', 'completorium'].indexOf(params.hora) === -1
	) {
		params.hora = 'index';
	}
	params.extra = params.extra || '';
	if (params.hide) {
		document.getElementsByTagName('form')[0].style.display = 'none';
	}
	init(params.lang, params.hora, params.date, params.extra, !!params.compare);
}

run();

})();
