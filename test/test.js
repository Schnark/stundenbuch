/*global Day, Config, l10n, getHora, util, schnarkDiff*/
/*global console*/
(function () {
"use strict";

var dateInput,
	proxy = 'https://lit-beach-8985.herokuapp.com/?url=',
	appPath = '../../../Texte/große%20Texte/Glaube/Stundenbuch/stundenbuch.stundenbuch.571/assets/',
/* This also requires some modifications of the code of the app:
In stundenbuch.js add the following code:
In the function androidClass add at the beginning

function getUrlParam (key) {
	var re = new RegExp('^[^#]*[&?]' + key + '=([^&#]*)'),
		m = re.exec(location.href);

	if (m) {
		return decodeURIComponent(m[1].replace(/\+/g, '%20'));
	}
	return null;
}
var lang = getUrlParam('lang');
if (lang=='la')lang='lat';

also change

"Date","3/10 2016"
to
"Date",getUrlParam('date')||""

"Antiphonale","true"
to
"Antiphonale",lang?"false":"true"

"lang",""
to
"lang",lang||""

"DiurnalDual","true"
to
"DiurnalDual",lang?"false":"true"

and add
"Psalmoration","false"
before the final "",""

At the very end add

if (window.parent!==window){window.onload=function(){window.parent.postMessage(document.body.innerHTML,'*');};}

You also may add

this.showpreferences=function(){alert(document.cookie)};
this.showdatedialog=function(){
var a=prompt("Datum:",new Date(getCookie("Now")));
if(a){setCookie("Now",new Date(a),60);location.reload(false)}
}

after the function androidClass, that is, before
if(!isAndroid())
*/
	localPath = 'l10n-source/cache/', //actually doesn't belong there,
	//but that way I have to remove just one folder before publishing
	local = location.href.slice(0, 13) === 'file:///home/' ? {
		'https://www.stundengebet.de/jetzt-beten/': 'stb.html'
	} : {};

function addToCache (url, html) {
	var cache;
	try {
		cache = JSON.parse(sessionStorage.getItem('stb-cache') || '{}');
		cache[url] = html;
		sessionStorage.setItem('stb-cache', JSON.stringify(cache));
	} catch (e) {
	}
}

function getFromCache (url) {
	try {
		return JSON.parse(sessionStorage.getItem('stb-cache') || '{}')[url];
	} catch (e) {
	}
}

function getXHR (url, useProxy, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		var text = xhr.responseText;
		if (useProxy) {
			try {
				text = JSON.parse(text).error;
			} catch (e) {
			}
		}
		callback(text || '');
	};
	xhr.onerror = function () {
		callback('');
	};
	xhr.open('GET', useProxy ? proxy + encodeURIComponent(url) : url);
	if (!useProxy) {
		xhr.responseType = 'text';
	}
	xhr.send();
}

function getWithCache (url, callback) {
	var html = getFromCache(url), useProxy = true;
	if (html) {
		callback(html);
		return;
	}

	if (local[url]) {
		useProxy = false;
		url = localPath + local[url];
	}
	getXHR(url, useProxy, function (html) {
		addToCache(url, html);
		callback(html);
	});
}

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
		['App', 'index.html?d=' + date.format() + '&h=' + hora],
		['katholisch.de', getUrl('de', hora, date)],
		['stundengebet.de', getUrl('de-x-combined')],
		['vulgata.org', getUrl('de-x-unspecific')],
		['ibreviary.org', getUrl('en-x-unspecific')],
		['breviarium.info', getUrl('la', hora, date)],
		['almudi.org', getUrl('la-x-unspecific')],
		['universalis.com', getUrl('mul', hora, date)],
		['Android-App', getUrl('mul-x-app', hora, date)],
		['diff', 'test-diff.html']
	].map(function (entry) {
		return '<a href="' + entry[1] + '" target="_blank" rel="noopener">' + entry[0] + '</a>';
	}).join(' – ');
}

function canCompare (lang, hora) {
	return (
		(lang === 'de' || lang === 'mul') &&
		['laudes', 'tertia', 'sexta', 'nona', 'vespera', 'completorium'].indexOf(hora) > -1
	) || (
		(lang === 'la' || lang === 'de-x-combined') && hora !== 'vigilia'
	) || (lang === 'de-x-app' || lang === 'la-x-app');
}

function getConfig (lang, hora, extra, compare) {
	var config = {},
		notes = {
			de: [
				'50|e'
				//'3|12|franciscus-xavier|1|pastor'
			],
			la: [
				'23|7|birgitta|1|religiosus,mulier',
				'9|8|teresia-benedicta|1|martyr,virgo'
			]
		};
	notes['de-x-combined'] = notes.de;
	config.rvMode = 'original';
	config.flexaAsteriscus = '+|*|<br>';
	config.psalmusInvitatorium = 'ps-95';
	config.invitatoriumLocus = '';
	config.calendar = 'de-DE';
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
	} else if (lang === 'de-x-combined' && compare) {
		config.rvMode = 'original';
		config.moreHymns = true;
		config.flexaAsteriscus = '†|*|<br>';
		config.varyCanticaLaudes = true;
		config.paterNosterIntro = 1;
		config.memoriaTSN = true;
		config.bugCompat = true;
		//config.marianAntiphon = 'completorium';
	} else if ((lang === 'de-x-app' || lang === 'la-x-app') && compare) {
		config.papa = 'Franziskus';
		config.lectionisNight = true;
		config.rvMode = hora === 'lectionis' ? 'original' : 'single';
		config.removeDuplicateAntiphon = true;
		config.flexaAsteriscus = '†|*|<br>';
		//config.paterNosterIntro = hora === 'laudes' ? 1 : 2;
		config.marianAntiphon = hora;
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
		.replace(/&nbsp;/g, ' ')
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
		/**/.replace(/<h2>Zweite Lesung[\s\S]*?<h2>/, function (lectio) {
			var cites = [];
			lectio = lectio.replace(/([.,;] ?)?<cite>(.*?)<\/cite>/g, function (all, punct, cite) {
				var n = cites.length + 1;
				cites.push(n + ' ' + cite.replace(/^\(|\.?\)$/g, '') + '. ');
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
	if (lang === 'de-x-combined') {
		return normalizeDeCombinedHtml(html, easter);
	}
	if (lang === 'de-x-app' || lang === 'la-x-app') {
		return normalizeAppHtml(html);
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
	//jscs:disable maximumLineLength
	var fixes = [
		['Amen ', 'Amen.'],
		['zu Grunde gehen', 'zugrunde gehen'], //nach neuer RS geht beides
		['Kassiodor', 'Cassiodor'],
		['Herr, eile mir zu helfen. Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit * und in Ewigkeit.', 'Herr, eile mir zu helfen. Ehre sei dem Vater und dem Sohn und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit.'],
		['Ewigkeit. ℣ Singet Lob', 'Ewigkeit. ℟ Amen. ℣ Singet Lob'],
		['Herrn. ℣ Singet Lob', 'Herrn. ℟ Amen. ℣ Singet Lob'],
		['Psalm Psalm 95 Ps 95', 'Psalm 95 Ps 95 (94)'],
		['Joh. ', 'Joh '],
		['(vgl. ', '(Vgl. '],
		['Vgl ', 'Vgl. '],
		['(Halleluja). Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit * und in Ewigkeit. Amen.', '(Halleluja). Halleluja. Ehre sei dem Vater und dem Sohn und dem Heiligen Geist. * (℟ Halleluja.) Wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen. ℟ Halleluja (Halleluja).'],
		['ihn loben und rühmen in Ewigkeit! Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit * und in Ewigkeit. Amen.', 'ihn loben und rühmen in Ewigkeit!'],
		[' not tut', ' Not tut'], //Neue Rechtschreiung (Preces Laudes 3. Woche Dienstag)
		['Der Herr thront für ewig; *', 'Der Herr aber thront für ewig; *'], //Psalm 9 I
		['Kein Mensch mehr verbreite Schrecken im Land!', 'Kein Mensch mehr verbreite Schrecken im Land.'], //Psalm 10 II
		['Mein Gott, eile mir zu Hilfe!', 'Mein Gott, eil mir zu Hilfe!'], //Psalm 71
		['und hatten doch mein Tun gesehen.«', 'und hatten doch mein Tun gesehen.'], //Psalm 95
		['Vierzig Jahre war mir dies Geschlecht zuwider †', 'Vierzig Jahre war mir dies Geschlecht zuwider, †'], //Psalm 95
		['Da wurde Jesus von Furcht und Angst ergriffen.', 'Da ergriff Jesus Furcht und Angst.'], //Einleitung Ps 55
		['Der Messias, König und Priester', 'Einsetzung des priesterlichen Königs'], //Einleitung Ps 110
		['Dank für Gottes Rettung und Heil', 'Dank für Rettung und Heil'], //Einleitung Ps 118 (TSN)
		['Dies ist der Stein, der von euch Bauleuten verworfen wurde', 'Er ist der Stein, der von euch Bauleuten verworfen wurde'], //Einleitung Ps 118 (TSN)
		['himmlichen', 'himmlischen'], //Einleitung Ps 122
		['unermeßbarer', 'unermessbarer'], //Te Deum
		['führt dem Vater seinen verlorenen Sohn', 'führt dem Vater seinen verlornen Sohn'], //Hymnus Lesehore So
		['Siegesfreude füllt unsere Seele ganz', 'Siegesfreude füllt unsre Seele ganz'], //Hymnus Lesehore So
		['verworrenes Chaos dieser Welt', 'verworrnes Chaos dieser Welt'], //Hymnus Laudes Mi
		['du lenkst mit starker Hand,', 'du lenkst mit starker Hand'], //Hymnus Sext (Fastenzeit)
		['Dir höchster Gott, ', 'Dir, höchster Gott, '], //Hymnus Lesehore Fastenzeit
		['niederfallen vor Gott, vor dem Herrn, unserm Schöpfer!', 'niederfallen vor Gott, vor dem Herrn, unserem Schöpfer!'], //Invitatorium-Antiphon Mittwoch 1. Woche
		['Danket dem Herrn; denn seine Huld währt ewig!', 'Danket dem Herrn, denn seine Huld währt ewig!'], //Invitatorium-Antiphon Freitag 1. Woche
		['Sie verteilen unter sich meine Kleider und werfen', 'Sie verteilten unter sich meine Kleider und warfen'], //Antiphon zu Psalm 22, Freitag 3. Woche TSN
		['Herr, lenke unsere Schritte auf den Weg des Friedens.', 'Herr, lenke unsre Schritte auf den Weg des Friedens.'], //Benedictus-Antiphon Samstag 2. Woche
		['Verwirf mich nicht vor deinem Angesicht', 'Verwirf mich nicht von deinem Angesicht'], //Versikel Terz Montag 2. Woche
		['℣ Reinige mich von verborgener Schuld', '℣ Reinige mich vor verborgener Schuld'], //Vesikel Sext Samstag 1. Woche
		['℣ Und sie hielten fest', '℣ Sie hielten fest'], //Versikel Sext Apostel
		['Stehe unserem Papst N. und allen Bischöfen bei;', 'Steh unserem Papst N. und allen Bischöfen bei;'], //Fürbitten Sonntag 1. Woche
		['Stehe den Sterbenden bei und lass sie dein Heil schauen.', 'Steh den Sterbenden bei; und lass sie dein Heil schauen.'], //Fürbitten Montag 1. Woche
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
	//jscs:enable maximumLineLength
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

function normalizeDeCombinedHtml (html, easter) {
	//jscs:disable maximumLineLength
	var div;
	html = html
		.replace(/<p class="format_pre\w*Ant(?:iphon)?"><span class="hl">([^<>]+)<\/span><\/p> <p class="format_center"><span class="hl">---<\/span>(?:<br>)?<\/p>/g, 'Ant.: $1')
		.replace(/<p class="format_pre\w*Ant(?:iphon)?"><span class="hl">([^<>]*)<\/span>(?:<br>)?<\/p>( (?:<p class="format_subh">|<h2 class="format_h2">P)[\s\S]*?)(<p class="format_none">)/g, '$2 Ant.: $1$3')
		.replace(/<p class="format_pre\w*Ant(?:iphon)?"><span class="hl">([^<>]+)<\/span>(?:<br>)?<\/p>/g, 'Ant.: $1')
		.replace(/(?:FÜRBITTEN|BITTEN)[\s\S]*Vater unser/, function (preces) {
			return preces.replace(/³/, '')
				//.replace(/³<\/span> <span id="HL\d+">[^<]*</g, '<')
				.replace(/\(R [^<]*</g, '<');
		})
		.replace(/<br><span class="hl">- /g, '')
		.replace('<p class="format_preOra">', 'Oration<p>')
		.replace(/</g, ' <')
		.replace(/\\n/g, ' ');
	div = document.createElement('div');
	div.innerHTML = html;
	return fixDe(div.textContent
		.replace(/(\d\)?,)(\d)/g, '$1 $2')
		.replace(/(\d[a-g]?)-(\d?[a-g]?)/g, '$1–$2')
		//.replace(/²\s+Lehre mich Erkenntnis und rechtes Urteil\.\s+³\s+Ich vertraue auf deine Gebote\./, '') //solange es falsch ist, besser ganz weg
		.replace('SCHULDBEKENNTNIS', 'Schuldbekenntnis (Stille zur Gewissenserforschung)')
		.replace('An dieser Stelle wird eine Gewissenserforschung empfohlen.', '')
		.replace(' - [alle schlagen an die Brust]', ',')
		.replace('Vergebungsbitte', '')
		.replace('HYMNUS', 'Hymnus')
		.replace('PSALMODIE', '')
		.replace(/ERSTE LESUNG[\s\S]*ZWEITE LESUNG/, function (lectio) {
			return lectio
				.replace(/á/g, 'a')
				.replace(/é/g, 'e')
				.replace(/í/g, 'i')
				.replace(/ó/g, 'o')
				.replace(/ú/g, 'u')
				.replace(/ý/g, 'y')
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
		.replace(/Vater unser\.\s+\(Kyrie, eleison.\s+Christe, eleison.\s+Kyrie, eleison.\)/, '')
		.replace('Vater unser im Himmel', 'Vaterunser Vater unser im Himmel')
		.replace(/Vater unser\.\s+Vaterunser Vater unser/, 'Lasst uns beten, wie der Herr uns gelehrt hat: Vaterunser Vater unser')
		.replace(/Bösen\.\s+³\s+Herr, erbarme dich deines Volkes\.\s+Oration/, 'Bösen. Oration')
		//.replace(/Vater unser\.\s+³\s+Herr, erbarme dich deines Volkes\./, 'Lasst uns beten, wie der Herr uns gelehrt hat: Vaterunser Vater unser im Himmel, geheiligt werde dein Name. Dein Reich komme. Dein Wille geschehe, wie im Himmel so auf Erden. Unser tägliches Brot gib uns heute. Und vergib uns unsere Schuld, wie auch wir vergeben unsern Schuldigern. Und führe uns nicht in Versuchung, sondern erlöse uns von dem Bösen.')
		.replace(/Wie im Anfang so auch jetzt und alle Zeit/g, 'Wie im Anfang, so auch jetzt und alle Zeit')
		.replace(/MARIANISCHE ANTIPHON[\s\S]*/, '') //solange es alle sind, besser ganz weg
		.replace(/[«»]/g, function (c) {
			return c === '»' ? '«' : '»';
		})
		.replace(/R Halleluja/g, '³ Halleluja')
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
		.replace(/\[/g, '(')
		.replace(/\]/g, ')')
		.replace(/\bdaß /g, 'dass ')
		.replace(/\b([Ll])aß /g, '$1ass ')
		.replace('Damit mein Mund dein Lob verkünde. Ehre sei dem Vater und dem Sohn * und dem Heiligen Geist. Wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen. Halleluja. Psalm', 'Damit mein Mund dein Lob verkünde.')
		.replace('(mit der Laudes oder der Lesehore fortfahren, die Eröffnung entfällt dort, es geht direkt mit dem Hymnus weiter) ', '')
		.replace('Te Deum (Der Hymnus Te Deum trifft nur an den Sonntagen außerhalb der Fastenzeit, an den Tagen der Oster- und Weihnachtsoktav und an Hochfesten und Festen … nicht aber an Gedenktagen und Wochentagen. vgl. AES 68) ', '')
		.replace('℣ Singet Lob und Preis.', html.indexOf('ZWEITE LESUNG') > -1 ? '℟ Amen. \u2123 Singet Lob und Preis.' : '℣ Singet Lob und Preis.')
		.replace('Eine ruhige Nacht und ein gutes Ende', '℟ Amen. Segen Eine ruhige Nacht und ein gutes Ende')
		.replace('℣ Der Herr segne uns. Er bewahre uns vor Unheil und führe uns zum ewigen Leben.', '℟ Amen. Segen Der Herr segne uns, er bewahre uns vor Unheil und führe uns zum ewigen Leben.'));
	//jscs:enable maximumLineLength
}

function normalizeAppHtml (html) {
	//jscs:disable maximumLineLength
	var div;
	html = html
		.replace(/[\s\S]*<\/style>/, '')
		.replace(/(<!-- a|<!-- \/content -->)[\s\S]*/, '')
		.replace(/<p style="line-height: 0.8;" class="NoLineHight"><span style="color:red; font-size:80%; line-height:125%;">[^<]*<\/span><\/p>/g, '')
		.replace(/<span style="color:red; font-size:80%;">[^<]*<\/span>/g, '')
		.replace(/<div name="subtitle"[^>]*>(.*?)<\/div>/g, '$1')
		.replace(/<div [^>]*style="display:none">[\s\S]*?<\/div>/g, '')
		.replace(/<font style="color:#FF3030">Ant.[^<]*<\/font>([^<]*)<\/i><\/p>((?:<\/div><div id="mag1">)?<h3.*?)<font style="font-family:serif;font-size:180%;color:#3255DD">/g, '</i></p>$2 Ant.: $1 <font>')
		.replace(/<font style="color:#FF3030">Ant.[^<]*<\/font>/g, 'Ant.: ')
		.replace(/<font style="font-family:liturgy;color:#FF3030">F<\/font>/g, '')
		.replace(/<font style="font-family:liturgy;font-size:150%;color:#FF3030">A/g, '<font>\u211f')
		.replace(/<font style="font-family:liturgy;font-size:150%;color:#FF3030">B/g, '<font>\u2123')
		.replace(/<p style="line-height: 140%;">– /g, '<p style="line-height: 140%;"> ')
		.replace(/>(?:Bitten|Fürbitten|Preces).*/, function (preces) {
			return preces
				.replace(/<p style="line-height: 140%;"><font>℟&nbsp;<\/font>([^<]*)</, '<p>$1<')
				.replace(/<p style="line-height: 140%;"><font>℟&nbsp;<\/font>[^<]*</g, '<p><');
		})
		.replace(/(<\/?p|<br>)/g, ' $1');

	div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent
		.replace(/\s+/g, ' ')
		.replace(/\(1\/\d\)/g, '')
		.replace(/\(I\/(?:III?|I?V|VII?)\)/g, '')
		.replace(/Aperi, Dómine, \[\+\].*?\[-\]/, '')
		.replace('ERSTE LESUNG', 'Erste Lesung')
		.replace('ZWEITE LESUNG', 'Zweite Lesung')
		.replace('LECTIO PRIOR', 'Lectio prior')
		.replace('LECTIO ALTERA', 'Lectio altera')
		.replace('Vater Unser (dt./lat.)', 'Vaterunser')
		.replace('(Bitten in besonderen Anliegen.)', 'Hier können Bitten in besonderen Anliegen eingefügt werden.')
		.replace('(Fürbitten in besonderen Anliegen.)', 'Hier können Fürbitten in besonderen Anliegen eingefügt werden.')
		.replace('Lasset uns beten.', '')
		.replace('Orémus.', '')
		.replace('Segen (dt./lat.)', '')
		.replace('(dt./lat.)', '')
		.replace('Laudes Vesper', '')
		.replace('(Preces in singularibus necessitatibus.)', '')
		.replace('Benedictio ℣', 'Conclusio ℣')
		.replace(/„/g, '»')
		.replace(/“/g, '«')
		.replace(/\s+/g, ' ');
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
	case 'de-x-combined':
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
	case 'mul-x-app':
	case 'de-x-app':
	case 'la-x-app':
		lang = lang.slice(0, -6);
		if (lang !== 'mul') {
			lang = '&lang=' + lang;
		} else {
			lang = '';
		}
		hora = {
			invitatorium: 'invitatorium',
			lectionis: 'lesehore',
			vigilia: 'vigil',
			laudes: 'laudes',
			tertia: 'terz',
			sexta: 'sext',
			nona: 'non',
			vespera: 'vesper',
			completorium: 'komplet'
		}[hora] || 'index';
		return appPath + hora + '.html?date=' + date.format() + lang;
	}
}

function getLocalHtml (lang, hora, date, callback) {
	l10n.load(lang === 'mul' ? 'la' : lang, function () {
		callback(getHora(date, hora));
	});
}

function getWebHtml (lang, hora, date, callback) {
	if (lang === 'de-x-combined') {
		getCombinedHtml(hora, date, callback);
		return;
	}
	if (lang.slice(-6) === '-x-app') {
		getAppHtml(getUrl(lang, hora, date), callback);
		return;
	}
	getWithCache(getUrl(lang, hora, date), callback);
}

function getCombinedHtml (hora, date, callback) {
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

	getWithCache('https://www.stundengebet.de/jetzt-beten/', function (html) {
		var doc, start;
		try {
			doc = (new DOMParser()).parseFromString(html, 'text/html'); //don't know why responseType = 'document' doesn't work
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
	});
}

function getAppHtml (url, callback) {
	var iframe = document.createElement('iframe');

	function onMessage (e) {
		if (e.source === iframe.contentWindow) {
			window.removeEventListener('message', onMessage);
			document.body.removeChild(iframe);
			callback(e.data);
		}
	}

	iframe.style.height = '1px';
	iframe.style.width = '1px';
	window.addEventListener('message', onMessage);
	iframe.src = url;
	document.body.appendChild(iframe);
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
	var params;
	getHora.makeLink = function (date, hora) {
		return '?lang=' + params.lang +
			'&hora=' + hora +
			'&date=' + date.format() +
			'&extra=' + params.extra +
			'&compare=' + (params.compare || '');
	};
	params = util.getUrlParams();
	if (['de', 'de-x-combined', 'de-x-app', 'en', 'la', 'la-x-app', 'mul'].indexOf(params.lang) === -1) {
		params.lang = 'de';
	}
	if (
		['index', 'invitatorium', 'lectionis', 'vigilia', 'laudes',
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
