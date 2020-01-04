/*global l10n: true, Day, Config, util, debug, xtea*/
l10n =
(function () {
"use strict";

var password = '',
	textStore,
	cache = {}, lru = [], maxLru = 3,
	override = {keys: {}, vals: {}},
	dynamicReplaceData = {},
	currentNames = {},
	currentLang;

function ucFirst (str) {
	return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

/*
NOTE This only parses "normal" language codes, neither private ones,
nor grandfathered codes (which will either be rejected or misinterpreted).
*/
function parseLangCode (lang) {
	var variant = '(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3})',
		extension = '[a-wyz0-9](?:-[a-z0-9]{2,8})+',
		re = new RegExp(
			'^' +
			'([a-z]{2,8}|[a-z]{2,3}(?:-[a-z]{3}){1,3})' + //lang (e.g. de, en) + langExt
			'(?:-([a-z]{4}))?' + //script (e.g. Latn)
			'(?:-([a-z]{2}|\\d{3}))?' + //region (e.g. DE)
			'(?:-(' + variant + '(?:-' + variant + ')*))?' + //variants (e.g. 1996)
			'(?:-(' + extension + '(?:-' + extension + ')*))?' + //extensions (e.g. u-nu-thai)
			'(?:-(x(?:-[a-z0-9]{1,8})+))?' + //private (e.g. x-foo)
			'$'
		),
		result, extensions, i, currentLetter;
	result = re.exec(lang.toLowerCase());
	if (!result) {
		return false;
	}
	extensions = ((result[5] || '') + '-' + (result[6] || '')).split('-');
	result = {
		lang: '',
		langExt: result[1].split('-'),
		script: ucFirst(result[2] || ''),
		region: (result[3] || '').toUpperCase(),
		variants: (result[4] || '').split('-'),
		extensions: {}
	};
	result.lang = result.langExt.shift();
	for (i = 0; i < extensions.length; i++) {
		if (extensions[i].length === 1 && currentLetter !== 'x') {
			currentLetter = extensions[i];
			result.extensions[currentLetter] = [];
		} else if (extensions[i]) {
			result.extensions[currentLetter].push(extensions[i]);
		}
	}
	return result;
}

function selectLangCode (list, lang) {
	list = list.filter(function (code) {
		return lang.toLowerCase().indexOf(code.toLowerCase()) === 0 && (
			code.length === 0 || code.length === lang.length || lang.charAt(code.length) === '-'
		);
	});
	list.sort(function (a, b) {
		return b.length - a.length;
	});
	return list[0];
}

function parseFile (text, allowDuplicates, lang) {
	var lines = text.split('\n'), i, line, current;
	for (i = 0; i < lines.length; i++) {
		line = lines[i];
		if (line.charAt(0) === '#') {
			continue;
		}
		if (line.charAt(0) === '[' && line.charAt(line.length - 1) === ']') {
			current = line.slice(1, -1);
			if (lang && current.indexOf(':') > -1) {
				current = current.split(':');
				if (selectLangCode([current[1]], lang)) {
					current = current[0];
					if (!(current in textStore)) {
						throw new Error('Override without default: ' + current);
					}
					textStore[current] = '';
				} else {
					current = '';
				}
				continue;
			}
			if (!allowDuplicates && current in textStore) {
				throw new Error('Duplicate: ' + current);
			}
			textStore[current] = '';
			continue;
		}
		if (current) {
			textStore[current] += line + '\n';
		}
	}
}

function deToCh (text) {
	return text
		.replace(/ß/g, 'ss')
		.replace(/[«»]/g, function (quote) {
			return quote === '«' ? '»' : '«';
		})
		.replace(/[‹›]/g, function (quote) {
			return quote === '‹' ? '›' : '‹';
		});
}

function removeAccents (text) {
	return text
		.replace(/Á/g, 'A')
		.replace(/É/g, 'E')
		.replace(/Í/g, 'I')
		.replace(/Ó/g, 'O')
		.replace(/Ú/g, 'U')
		.replace(/Ý/g, 'Y')
		.replace(/Ǽ/g, 'Æ')
		.replace(/á/g, 'a')
		.replace(/é/g, 'e')
		.replace(/í/g, 'i')
		.replace(/ó/g, 'o')
		.replace(/ú/g, 'u')
		.replace(/ý/g, 'y')
		.replace(/ǽ/g, 'æ');
}

function getFileInfo (langData) {
	var lang, availLang = ['de', 'en', 'la'], additional = [], transforms = [];
	lang = langData.lang;
	if (availLang.indexOf(lang) === -1) {
		lang = availLang[0];
	}
	if (lang === 'de') {
		if (langData.region === 'CH') {
			transforms.push(deToCh);
		}
	} else if (lang === 'la') {
		if (langData.extensions && langData.extensions.x && langData.extensions.x.indexOf('noaccent') > -1) {
			transforms.push(removeAccents);
		}
	}
	return {
		main: lang,
		additional: additional,
		transforms: transforms
	};
}

function applyTransforms (text, transform) {
	var i;
	for (i = 0; i < transform.length; i++) {
		text = transform[i](text);
	}
	return text;
}

function getRawFile (name, type, callback) {
	var xhr;
	xhr = new XMLHttpRequest();
	xhr.open('GET', name);
	xhr.responseType = type;
	xhr.onload = function () {
		callback(xhr.response);
	};
	xhr.send();
}

function getFile (name, callback) {
	if (password) {
		getRawFile('l10n/' + name + '.xtea', 'arraybuffer', function (data) {
			var text = '';
			try {
				text = xtea.decrypt(new Uint8Array(data), password);
			} catch (e) {
			}
			callback(text);
		});
	} else {
		getRawFile('l10n-source/combined/' + name + '.txt', 'text', callback);
	}
}

function load (lang, callback) {
	var langData, i, todo, files;

	function onDone (noStore) {
		if (!noStore) {
			cache[lang] = textStore;
		}
		debug.timerEnd('Loading ' + lang);
		callback();
	}

	function processFile (text, allowDuplicates) {
		text = applyTransforms(text, langData.transforms);
		parseFile(text, allowDuplicates, lang);
	}

	function onGotFile (text) {
		processFile(text, true);
		todo--;
		if (!todo) {
			onDone();
		}
	}

	debug.timerStart();

	i = lru.indexOf(lang);
	if (i !== -1) {
		lru.splice(i, 1);
		lru.push(lang);
		textStore = cache[lang];
		currentLang = lang;
		setTimeout(function () {
			onDone(true);
		}, 0);
		return;
	}
	lru.push(lang);
	if (lru.length > maxLru) {
		delete cache[lru.shift()];
	}

	textStore = {};
	currentLang = lang;

	langData = parseLangCode(lang) || {};
	langData = getFileInfo(langData);
	if (password === 'raw') {
		files = langData.additional;
		if (langData.main === 'de') {
			files.unshift('regional-de');
		}
		files.unshift(
			langData.main,
			'interface-' + langData.main,
			'biblia-' + langData.main,
			'lectionis-' + langData.main,
			'catalogus-' + langData.main,
			'audio-' + langData.main
		);
		todo = files.length;
		for (i = 0; i < files.length; i++) {
			getRawFile('l10n-source/' + files[i] + '.txt', 'text', onGotFile);
		}
		return;
	}
	if (password === 'none') {
		onDone();
		return;
	}
	getFile(langData.main, function (text) {
		processFile(text);
		todo = langData.additional.length;
		if (todo) {
			for (i = 0; i < langData.additional.length; i++) {
				getFile(langData.additional[i], onGotFile);
			}
		} else {
			onDone();
		}
	});
}

function parseOverride (text) {
	var backup;
	backup = textStore;
	textStore = {};
	parseFile(text, true);
	override = {
		keys: {},
		vals: textStore
	};
	textStore = backup;
	Object.keys(override.vals).forEach(function (name) {
		var pos = name.indexOf(':'), lang, key;
		if (pos === -1) {
			key = name;
			lang = '';
		} else {
			key = name.slice(0, pos);
			lang = name.slice(pos + 1);
		}
		if (!override.keys[key]) {
			override.keys[key] = [];
		}
		override.keys[key].push(lang);
	});
}

function applyGrammerDe (name, form) {
	if (form === 'gen') {
		return name
			.replace('Papst ', 'Papstes ')
			.replace('Bischof ', 'Bischofs ')
			.replace('Pfarrer ', 'Pfarrers ')
			.replace('König ', 'Königs ')
			.replace('Bruder ', 'Bruders ');
	}
	return name;
}

//TODO nicht auf deutsche Namen(-sbestandteile): von, Callo, Romero
function applyGrammerLa (name, form) {
	switch (form) {
	case 'voc':
		return name.replace(/us( |$)/g, 'e$1');
	case 'gen': return name
		.replace(/on?( |$)/g, 'onis$1').replace(/ns( |$)/g, 'ntis$1')
		.replace(/us( |$)/g, 'i$1').replace(/a( |$)/g, 'æ$1')
		.replace(/as( |$)/g, 'æ$1').replace(/es( |$)/g, 'is$1')
		.replace(/és( |$)/g, 'étis$1');
	case 'dat': return name
		.replace(/on?( |$)/g, 'oni$1').replace(/ns( |$)/g, 'nti$1')
		.replace(/us( |$)/g, 'o$1').replace(/a( |$)/g, 'æ$1')
		.replace(/as( |$)/g, 'æ$1').replace(/es( |$)/g, 'i$1')
		.replace(/és( |$)/g, 'éti$1');
	case 'acc': return name
		.replace(/on?( |$)/g, 'onem$1').replace(/ns( |$)/g, 'ntem$1')
		.replace(/us( |$)/g, 'um$1').replace(/a( |$)/g, 'am$1')
		.replace(/as( |$)/g, 'am$1').replace(/es( |$)/g, 'em$1')
		.replace(/és( |$)/g, 'étem$1');
	case 'abl': return name
		.replace(/on?( |$)/g, 'one$1').replace(/ns( |$)/g, 'nte$1')
		.replace(/us( |$)/g, 'o$1').replace(/a( |$)/g, 'a$1')
		.replace(/as( |$)/g, 'a$1').replace(/es( |$)/g, 'e$1')
		.replace(/és( |$)/g, 'éte$1');
	default: return name;
	}
}

function applyGrammer (name, form, grammer) {
	switch (grammer) {
	case 'de': return applyGrammerDe(name, form);
	case 'la': return applyGrammerLa(name, form);
	default: return name;
	}
}

function removeHead (name) {
	return get(name).replace(/^.+\n+/, '');
}

function getName (type) {
	var names = currentNames[type] || {};
	return Config.getConfig().get(type) || names[selectLangCode(Object.keys(names), currentLang)] || get('nomen');
}

function dynamicReplace (name) {
	var parts;
	switch (name) {
	case 'antiphona': return '{antiphona}' + dynamicReplaceData.antiphona;
	case 'commemoratio-lectio': return removeHead(dynamicReplaceData.commemoratioLectio);
	case 'commemoratio-antiphona': return get(dynamicReplaceData.commemoratioAntiphona);
	case 'commemoratio-oratio1':
		setDynamicData('commemoratioOratio', true);
		return removeHead(dynamicReplaceData.commemoratioOratio1).replace(/,$/, '.');
	case 'commemoratio-oratio2': return removeHead(dynamicReplaceData.commemoratioOratio2);
	}
	if (['per-christum', 'per-christum-1', 'qui-vivit', 'qui-vivis', 'qui-vivis-1'].indexOf(name) > -1) {
		if (dynamicReplaceData.commemoratioOratio) {
			setDynamicData('commemoratioOratio', false);
			return '';
		}
		if (dynamicReplaceData.horaTSN) {
			return Config.getConfig().get('bugCompat') ? get(name) : get(name + '-brevis');
		}
	}
	parts = /^(papa|episcopus|nomen)(?:-(voc|gen|dat|acc|abl))?$/.exec(name);
	if (parts) {
		return applyGrammer(
			parts[1] === 'nomen' ? dynamicReplaceData.nomen || get('nomen') : getName(parts[1]),
			parts[2] || '',
			get('grammatica')
		);
	}
}

function setDynamicData (key, val) {
	dynamicReplaceData[key] = val;
}

function formatSunday (sunday) {
	var result = /^[a-c](\d+)(-[aqp])?$/.exec(sunday);
	return util.replaceFormatString(get('dominica' + (result[2] || '')), function (c) {
		return c === 'n' && Number(result[1]);
	});
}

function getTitle (name) {
	var fallback = Day.nameFallback[name] || [],
		fallbackName = fallback[0] || '',
		fallbackType = fallback[1] || '';
	fallbackName = fallbackName.replace(/\+$/, get('titulus-et-socii'));
	setDynamicData('nomen', get(name + '-nomen', fallbackName));
	return get(name, get('titulus' + fallbackType));
}

function getRaw (name, fallback) {
	var lang;
	if (override.keys[name]) {
		lang = selectLangCode(override.keys[name], currentLang);
		if (lang !== undefined) {
			if (lang) {
				name = lang + ':' + name;
			}
			return override.vals[name];
		}
	}
	if (!(name in textStore)) {
		if (fallback !== undefined) {
			return fallback;
		}
		return '[' + name + ']';
	}
	return textStore[name];
}

function get (name, fallback) {
	return getRaw(name, fallback).replace(/@([a-z0-9\-]+)/g, function (all, include) {
		var text;
		text = dynamicReplace(include);
		if (text !== undefined) {
			return text;
		}
		if (include === name) {
			throw new Error('Circular dependency: ' + name);
		}
		return get(include);
	}).trim();
}

function has (name) {
	return name in textStore;
}

function setNames (type, names) {
	currentNames[type] = names;
}

function getNormalisationFunction (search) {
	var allFunctions = [
		function (str) {
			return str.toLowerCase();
		},
		function (str) {
			return str.replace(/[ÀÁÂÃÄÅĀĂĄǍǞǠǺȀȂȦȺḀẠẢẤẦẨẪẬẮẰẲẴẶ]/g, 'A')
				.replace(/[àáâãäåāăąǎǟǡǻȁȃȧⱥḁạảấầẩẫậắằẳẵặẚ]/g, 'a')
				.replace(/[ÆǢǼ]/g, 'Ae').replace(/[æǣǽ]/g, 'ae')
				.replace(/[ƁƂɃḂḄḆ]/g, 'B').replace(/[ƀƃḃḅḇ]/g, 'b')
				.replace(/[ÇĆĈĊČƇȻḈ]/g, 'C').replace(/[çćĉċčƈȼḉ]/g, 'c')
				.replace(/[ÐĎĐƉƊƋḊḌḎḐḒ]/g, 'D').replace(/[ðďđƌȡḋḍḏḑḓ]/g, 'd')
				.replace(/ȸ/g, 'db')
				.replace(/[ǄǅǱǲ]/g, 'Dz').replace(/[ǆǳ]/g, 'dz')
				.replace(/[ÈÉÊËĒĔĖĘĚƎƏƐȄȆȨɆḔḖḘḚḜẸẺẼẾỀỂỄỆ]/g, 'E')
				.replace(/[èéêëēĕėęěǝȅȇȩɇḕḗḙḛḝẹẻẽếềểễệə]/g, 'e')
				.replace(/[ƑḞ]/g, 'F').replace(/[ƒḟ]/g, 'f')
				.replace(/[ĜĞĠĢƓƔǤǦǴḠ]/g, 'G').replace(/[ĝğġģǥǧǵḡ]/g, 'g')
				.replace(/[ĤĦȞⱧⱵḢḤḦḨḪ]/g, 'H').replace(/[ĥħȟⱨⱶḣḥḧḩḫẖ]/g, 'h')
				.replace(/Ƕ/g, 'Hv').replace(/ƕ/g, 'hv')
				.replace(/[ÌÍÎÏĨĪĬĮİƖƗǏȈȊḬḮỈỊ]/g, 'I')
				.replace(/[ìíîïĩīĭįıǐȉȋḭḯỉị]/g, 'i')
				.replace(/Ĳ/g, 'Ij').replace(/ĳ/g, 'ij')
				.replace(/[ĴǰɈ]/g, 'J').replace(/[ĵȷɉ]/g, 'j')
				.replace(/[ĶƘǨⱩḰḲḴ]/g, 'K').replace(/[ķĸƙǩⱪḱḳḵ]/g, 'k')
				.replace(/[ĹĻĽĿŁȽⱠⱢḶḸḺḼ]/g, 'L').replace(/[ĺļľŀłƚƛȴⱡḷḹḻḽ]/g, 'l')
				.replace(/[Ǉǈ]/g, 'Lj').replace(/ǉ/g, 'lg')
				.replace(/[ḾṀṂ]/g, 'M').replace(/[ḿṁṃ]/g, 'm')
				.replace(/[ÑŃŅŇŊƝǸȠṄṆṈṊ]/g, 'N').replace(/[ñńņňŉŋƞǹȵṅṇṉṋ]/g, 'n')
				.replace(/[Ǌǋ]/g, 'Nj').replace(/ǌ/g, 'nj')
				.replace(/[ÒÓÔÕÖØŌŎŐƆƟƠǑǪǬǾȌȎȪȬȮȰṌṎṐṒỌỎỐỒỔỖỘỚỜỞỠỢ]/g, 'O')
				.replace(/[òóôõöøōŏőơǒǫǭǿȍȏȫȭȯȱṍṏṑṓọỏốồổỗộớờởỡợ]/g, 'o')
				.replace(/Œ/g, 'Oe').replace(/œ/g, 'oe')
				.replace(/Ƣ/g, 'Oi').replace(/ƣ/g, 'oi')
				.replace(/[ƤⱣṔṖ]/g, 'P').replace(/[ƥṕṗ]/g, 'p')
				.replace(/Ɋ/g, 'Q').replace(/ɋ/g, 'q')
				.replace(/ȹ/g, 'qp')
				.replace(/[ŔŖŘȐȒɌⱤṘṚṜṞ]/g, 'R').replace(/[ŕŗřȑȓɍṙṛṝṟ]/g, 'r')
				.replace(/[ŚŜŞŠƩȘṠṢṤṦṨ]/g, 'S').replace(/[śŝşšſșȿṡṣṥṧṩẛ]/g, 's')
				.replace(/ß/g, 'ss')
				.replace(/[ŢŤŦƬƮȚȾṪṬṮṰ]/g, 'T').replace(/[ţťŧƫƭțȶⱦṫṭṯṱẗ]/g, 't')
				.replace(/Þ/g, 'Th').replace(/þ/g, 'th')
				.replace(/[ÙÚÛÜŨŪŬŮŰŲƯǓǕǗǙǛȔȖɄṲṴṶṸṺỤỦỨỪỬỮỰ]/g, 'U')
				.replace(/[ùúûüũūŭůűųưǔǖǘǚǜȕȗṳṵṷṹṻụủứừửữự]/g, 'u')
				.replace(/[ƲṼṾ]/g, 'V').replace(/[ⱴṽṿ]/g, 'v')
				.replace(/[ŴǷẀẂẄẆẈ]/g, 'W').replace(/[ŵƿẁẃẅẇẉẘ]/g, 'w')
				.replace(/[ẊẌ]/g, 'X').replace(/[ẋẍ]/g, 'x')
				.replace(/[ÝŸŶƳȲɎẎỲỴỶỸ]/g, 'Y').replace(/[ýÿŷƴȳɏẏỳỵỷỹẙ]/g, 'y')
				.replace(/[ŹŻŽƵȤⱫẐẒẔ]/g, 'Z').replace(/[źżžƶȥɀⱬẑẓẕ]/g, 'z');
		},
		function (str) {
			return str.replace(/[0-9]/g, '');
		},
		function (str) {
			return str.replace(/[\-’]/g, '');
		},
		function (str) {
			return str.replace(/[()<>\/.:,;?!…–“”‘’»«›‹_%*+{}|~=]/g, ' ');
		},
		function (str) {
			return str.replace(/@[a-z0-9\-]*/g, '');
		}
	];
	allFunctions = allFunctions.filter(function (f) {
		return f(search) === search;
	});
	return function (text) {
		var i;
		for (i = 0; i < allFunctions.length; i++) {
			text = allFunctions[i](text);
		}
		return text.replace(/\s+/g, ' ');
	};
}

function asyncLoop (array, work, end) {
	var i = 0;

	function doPart () {
		var start = new Date(), done = false;
		while (!done) {
			done = work(array[i]);
			i++;
			if (i === array.length) {
				done = true;
			}
			if (new Date() - start > 500) {
				break;
			}
		}
		if (!done) {
			setTimeout(doPart, 10);
		} else {
			end();
		}
	}

	doPart();
}

function getKeys () {
	return Object.keys(textStore);
}

function search (callback, str, max, missing, more) {
	var normalize, ret = [];
	if (max && more) {
		max++;
	}
	normalize = getNormalisationFunction(str);
	asyncLoop(getKeys(), function (key) {
		if (normalize(textStore[key]).indexOf(str) > -1) {
			ret.push(key);
			return max && ret.length === max;
		}
	}, function () {
		if (missing && ret.length === 0) {
			ret.push(missing);
		}
		if (more && ret.length === max) {
			ret[max - 1] = more;
		}
		callback(ret);
	});
}

function setPassword (pw) {
	password = pw;
}

function test (file, callback) {
	textStore = {};
	getRawFile('l10n-source/' + file + '.txt', 'text', function (text) {
		parseFile(text);
		callback(textStore);
	});
}

function clearStorage (force) {
	cache = {};
	lru = [];
	if (force) {
		textStore = {};
	}
}

return {
	load: load,
	parseOverride: parseOverride,
	get: get,
	has: has,
	setDynamicData: setDynamicData,
	formatSunday: formatSunday,
	getTitle: getTitle,
	setNames: setNames,
	search: search,
	setPassword: setPassword,
	clearStorage: clearStorage,
	test: test,
	getKeys: getKeys,
	availableLanguages: [
		{code: 'de', autonym: 'Deutsch', prompt: 'Bitte Passwort eingeben:'},
		{code: 'de-AT', autonym: 'Deutsch (Österreich)'},
		{code: 'de-CH', autonym: 'Deutsch (Schweiz)'},
		{code: 'en', autonym: 'English', prompt: 'Please enter password:'},
		{code: 'la', autonym: 'Latina', prompt: 'Da tesseram, quæsumus:'},
		{code: 'la-x-noaccent', autonym: 'Latina (sine accentibus)'}
	]
};

})();