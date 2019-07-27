/*global screenlock, Day, Config, l10n, util, debug, file, getHora, audioManager, waitForPassword*/
/*global Event*/
(function () {
"use strict";

var currentData,
	dom = {},
	popupVisible = {
		settings: false,
		navigation: false,
		audio: false
	},
	scrollPos = {};

function navigate (href, noHistory) {
	var data = href.slice(1).split('|'), lang, scrollElement;
	scrollElement = document.getElementsByTagName('html')[0];
	if (!noHistory) {
		scrollPos[location.search] = scrollElement.scrollTop / scrollElement.scrollHeight;
	}
	if (data[0] === 'none') {
		return;
	}
	if (data[0] === 'back') {
		history.back(); //will trigger popstate and thus call navigate again
		return;
	}
	lang = document.getElementsByTagName('html')[0].lang;
	if (data[0] === 'settings') {
		if (currentData) {
			updateNavigation(currentData.day, currentData.hora, true);
		}
		showSettingsPage();
		lang = ''; //disable TTS
	} else if (data[0].indexOf('catalogus') === 0) {
		if (currentData) {
			updateNavigation(currentData.day, currentData.hora, true);
		}
		getHora(new Day(), data[0], function (html) {
			dom.main.innerHTML = html;
			updateTitle();
			if (!noHistory) {
				document.documentElement.scrollTop = 0;
				document.body.scrollTop = 0;
			}
		});
		showMainPage();
	} else {
		currentData = {
			day: new Day(data[0]),
			hora: data[1] || 'index'
		};
		updateNavigation(currentData.day, currentData.hora);
		getHora(currentData.day, currentData.hora, function (html) {
			dom.main.innerHTML = html;
			updateTitle();
			if (Number(Config.getConfig().get('debug')) === 2) {
				dom.main.innerHTML += debug.getLog();
			}
			if (!noHistory) {
				document.documentElement.scrollTop = 0;
				document.body.scrollTop = 0;
			}
		});
		showMainPage();
	}
	audioManager.setLang(lang);
	if (!noHistory) {
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
		history.pushState(null, '', href);
	} else {
		scrollElement.scrollTop = scrollElement.scrollHeight * (scrollPos[location.search] || 0);
	}
}

function updateTitle () {
	var title;
	title = document.getElementsByClassName('title');
	if (title && title[0] && title[0].dataset && title[0].dataset.title) {
		document.title = title[0].dataset.title;
	}
}

function updateInterface () {
	var el, i, attr;
	document.getElementsByTagName('html')[0].lang = Config.getConfig().get('lang');
	el = document.querySelectorAll('[data-l10n]');
	for (i = 0; i < el.length; i++) {
		attr = el[i].dataset.l10nAttr || 'textContent';
		el[i][attr] = l10n.get(el[i].dataset.l10n);
	}
	updateAdditionalDays();
	audioManager.addData(audioManager.parse(l10n.get('audio-data')));
}

function updateSettings (config) {
	var el, i, val, sub, j;
	updateAdditionalDays();
	el = document.querySelectorAll('[data-key]');
	for (i = 0; i < el.length; i++) {
		val = config.get(el[i].dataset.key);
		switch (el[i].type) {
		case 'select-multiple':
			sub = el[i].getElementsByTagName('option');
			for (j = 0; j < sub.length; j++) {
				sub[j].selected = val.indexOf(sub[j].value) > -1;
			}
			break;
		case 'checkbox':
			el[i].checked = val;
			break;
		default:
			el[i].value = val;
		}
	}
}

function updateAdditionalDays () {
	var i, d, html = [], config = Config.getConfig(),
		days = config.get('additionalDays'),
		extra = config.get('calendarExtra');

	function getFormat (c) {
		switch (c) {
		case 'd': return d.d;
		case 'm': return d.m - 1;
		}
	}

	Day.additionalDays.sort(function (a, b) {
		return ((isNaN(a.m) ? -300 : a.m * 32) + a.d) - ((isNaN(b.m) ? -300 : b.m * 32) + b.d);
	});

	for (i = 0; i < Day.additionalDays.length; i++) {
		d = Day.additionalDays[i];
		l10n.setDynamicName(d.name);
		html.push(
			'<option ' +
			(days.indexOf(d.name) > -1 ? 'selected ' : '') +
			'value="' + d.name + '">' +
			l10n.get(d.name, l10n.get('titulus')) +
			(isNaN(d.m) ? '' : ' ' + util.replaceFormatString(l10n.get('date-format-short'), getFormat)) +
			'</option>'
		);
	}
	dom.additionalDays.innerHTML = html.join('');

	html = Day.calendarExtraEntries.map(function (label) {
		return '<p><label><input type="checkbox" ' + (extra.indexOf(label) > -1 ? 'checked ' : '') +
			'data-calendarextra="' + util.htmlEscape(label) + '"> ' + label + '</label></p>';
	});
	dom.calendarExtraLabel.hidden = !html.length;
	dom.calendarExtraList.innerHTML = html.join('');
}

function makeSelect (date) {
	var alternatives = date.getAlternatives(), html;
	if (!alternatives.length) {
		return;
	}
	alternatives.unshift(date.getName() || '');
	html = '<p><select id="optional-select" data-date="' + date.format() + '">' + alternatives.map(function (name) {
		if (name) {
			l10n.setDynamicName(name);
		}
		return '<option value="' + name + '">' +
			(name ? l10n.get(name, l10n.get('titulus')) : l10n.get('nulla-memoria')) + '</option>';
	}).join('') + '</select></p>';
	return {type: 'raw', html: html};
}

function enableOptionalMemorial (name, date) {
	var config = Config.getConfig(), oldVal, newVal, alternatives = util.clone(date.getAlternatives());

	alternatives.push(date.getName());

	oldVal = config.get('additionalDays');
	newVal = oldVal.filter(function (name) {
		return alternatives.indexOf(name) === -1;
	});
	if (name && name !== 'maria-sabbato') {
		newVal.push(name);
	}

	config.set('additionalDays', newVal);

	if (date.getOrder() === 5) {
		if (name === '') {
			if (date.getType(true) === 'memoria') {
				config.set('commemoratio', false);
			}
		} else {
			config.set('commemoratio', true);
		}
	}

	if (name === 'maria-sabbato') {
		config.set('mariaSabbato', true);
	} else if (name === '' && alternatives.indexOf('maria-sabbato') > -1) {
		config.set('mariaSabbato', false);
	}

	updateCalendar();
	updateSettings(config);
	navigateToUrl();
}

function enableDayGroup (days) {
	var config = Config.getConfig(), auto, current;
	auto = config.get('autoAddedDays');
	current = config.get('additionalDays');
	current = current.filter(function (d) {
		return auto.indexOf(d) === -1;
	});
	auto = [];
	days.forEach(function (d) {
		if (current.indexOf(d) === -1) {
			auto.push(d);
			current.push(d);
		}
	});
	config.set('autoAddedDays', auto);
	config.set('additionalDays', current);
}

function makeLink (date, hora) {
	return '?' + date.format() + '|' + hora;
}

function catSearch (str) {
	document.getElementById('catalogus-input').disabled = true;
	document.getElementById('catalogus-button').disabled = true;
	document.getElementById('catalogus-button').innerHTML = l10n.get('quaerere-progreditur');
	l10n.search(function (result) {
		navigate('?catalogus,' + result.join(','));
	}, str, 10, 'quaerere-nihil', 'quaerere-plurima');
}

function updateNavigation (day, hora, linkCurrent) {
	var today = new Day(), input, isMonth = hora === 'mensis';
	input = document.getElementById('date-input');
	input.value = day.format();
	input.dataset.hora = hora;
	if (isMonth) {
		day = today;
	}
	[
		'index',
		'invitatorium', 'lectionis', 'laudes',
		'tertia', 'tertia-complementaris',
		'sexta', 'sexta-complementaris',
		'nona', 'nona-complementaris',
		'vespera', 'completorium'
	].forEach(function (h) {
		document.getElementById('nav-' + h).href = (hora === h && !linkCurrent) ? '?none' : makeLink(day, h);
	});
	if (isMonth) {
		hora = 'index';
	}
	document.getElementById('nav-prev').href = makeLink(day.prev(), hora);
	document.getElementById('nav-today').href = (!isMonth && !linkCurrent && today.format() === day.format()) ?
		'?none' : makeLink(today, hora);
	document.getElementById('nav-next').href = makeLink(day.next(), hora);
	document.getElementById('nav-month').href = (isMonth && !linkCurrent) ? '?none' : makeLink(day, 'mensis');
}

function updateCalendar (additional) {
	var config = Config.getConfig();
	Day.init(config.get('calendar'), config.get('notes'));
	if (additional) {
		updateAdditionalDays();
	}
}

function showPopup (type) {
	popupVisible[type] = true;
	dom[type + 'Popup'].style.display = '';
}

function hidePopup (type) {
	popupVisible[type] = false;
	dom[type + 'Popup'].style.display = 'none';
}

function togglePopup (type) {
	['settings', 'navigation', 'audio'].forEach(function (popup) {
		if (popupVisible[popup]) {
			hidePopup(popup);
		} else if (popup === type) {
			showPopup(popup);
		}
	});
}

function showSettingsPage () {
	dom.main.hidden = true;
	dom.settings.hidden = false;
	dom.settingsLinkContainer.hidden = true;
	dom.backLinkContainer.hidden = false;
	document.title = l10n.get('liturgia-horarum') + ' – ' + l10n.get('modi'); //TODO – ?
}

function showMainPage () {
	dom.settings.hidden = true;
	dom.main.hidden = false;
	dom.settingsLinkContainer.hidden = false;
	dom.backLinkContainer.hidden = true;
}

function ignoreClick (e) {
	if (e.target.tagName !== 'A') {
		e.stopPropagation();
	}
}

function addToAdditionalDays (newData) {
	var oldData = dom.formAdditionalInput.value, i;
	oldData = oldData.split('\n');
	newData = newData.split('\n');
	for (i = 0; i < newData.length; i++) {
		if (oldData.indexOf(newData[i]) === -1) {
			oldData.push(newData[i]);
		}
	}
	oldData = oldData.filter(function (line) {
		return line;
	}).join('\n');
	if (oldData) {
		oldData += '\n';
	}
	dom.formAdditionalInput.value = oldData;
	dom.formAdditionalInput.dispatchEvent(new Event('change', {bubbles: true}));
}

function globalKeydownHandler (e) {
	//convert Enter on pseudo-links to click
	//close popup on Escape
	//FIXME order of popups
	var el = document.activeElement;
	if ((e.key === 'Enter' || e.which === 13) && el) {
		if (el.id === 'catalogus-input') {
			document.getElementById('catalogus-button').dispatchEvent(new Event('click', {bubbles: true}));
		} else if (el.tabIndex === 0) { //TODO attribute statt property
			el.dispatchEvent(new Event('click', {bubbles: true}));
		}
	} else if (e.key === 'Escape' || e.which === 27) {
		togglePopup('');
	}
}

function globalClickHandler (e) {
	var id, config, i, all, prev;
	if (e.target.tagName === 'A' && !e.target.dataset.nativ) {
		navigate(e.target.dataset.action || e.target.getAttribute('href'));
		e.preventDefault();
	}
	id = e.target.id;
	if (!id && e.target.parentElement) {
		id = e.target.parentElement.id;
	}

	if (id === 'reset') {
		if (window.confirm(l10n.get('titulus-restituere-adfirmare'))) {
			config = Config.getConfig();
			config.reset();
			updateSettings(config);
			updateCalendar();
			l10n.load(config.get('lang'), function () {
				updateInterface();
				navigate('?back');
			});
		}
	}

	if (id === 'select-all') {
		config = Config.getConfig();
		//all current ...
		all = Day.additionalDays.map(function (d) {
			return d.name;
		});
		//... and all previously selected
		prev = config.get('additionalDays');
		for (i = 0; i < prev.length; i++) {
			if (all.indexOf(prev[i]) === -1) {
				all.push(prev[i]);
			}
		}
		config.set('additionalDays', all);
		updateCalendar(true);
	}
	if (id === 'select-none') {
		config = Config.getConfig();
		config.set('additionalDays', []);
		updateCalendar(true);
	}
	if (id === 'select-group-0') {
		enableDayGroup([]);
		updateCalendar(true);
	}
	if (id === 'select-group-1') {
		enableDayGroup(Day.dayGroups[0]);
		updateCalendar(true);
	}
	if (id === 'select-group-2') {
		enableDayGroup(Day.dayGroups[1]);
		updateCalendar(true);
	}
	if (id === 'select-group-3') {
		enableDayGroup(Day.dayGroups[2]);
		updateCalendar(true);
	}
	if (id === 'select-group-4') {
		enableDayGroup(Day.dayGroups[3]);
		updateCalendar(true);
	}

	if (id === 'export-config') {
		file.export(Config.getConfig().export(), 'stundenbuch-config.json');
	}
	if (id === 'import-config') {
		file.import(function (text) {
			config = Config.getConfig();
			if (config.import(text)) {
				updateSettings(config);
				updateCalendar();
				l10n.load(config.get('lang'), function () {
					updateInterface();
					navigate('?back');
				});
			} else {
				window.alert(l10n.get('titulus-restituere-fefellit'));
			}
		}, 'application/json');
	}
	if (id === 'export-icalendar') {
		file.export(file.createIcal(Config.getConfig().get('notes')), 'stundenbuch.ics');
	}
	if (id === 'export-icalendar-1') {
		file.export(file.createIcal(Config.getConfig().get('notes'), true), 'stundenbuch.ics');
	}
	if (id === 'import-icalendar') {
		file.import(function (data) {
			addToAdditionalDays(file.parseIcal(data));
		}, 'text/calendar');
	}
	if (id === 'export-override') {
		file.export(Config.getConfig().get('override'), 'stundenbuch.txt');
	}
	if (id === 'import-override') {
		file.import(function (text) {
			var input = document.getElementById('input-override');
			input.value = text;
			input.dispatchEvent(new Event('change', {bubbles: true}));
		});
	}

	if (id === 'catalogus-button') {
		catSearch(document.getElementById('catalogus-input').value);
	}

	if (id === 'button-settings') {
		togglePopup('settings');
	} else if (id === 'button-navigation') {
		togglePopup('navigation');
	} else if (id === 'button-audio') {
		togglePopup('audio');
	} else {
		togglePopup('');
	}
}

function readSelectMultiple (select, oldVal) {
	var newVal = [], all = [], options, i;
	options = select.getElementsByTagName('option');
	for (i = 0; i < options.length; i++) {
		all.push(options[i].value);
		if (options[i].selected) {
			newVal.push(options[i].value);
		}
	}
	for (i = 0; i < oldVal.length; i++) {
		//keep currently unavailable options
		if (all.indexOf(oldVal[i]) === -1) {
			newVal.push(oldVal[i]);
		}
	}
	return newVal;
}

function globalInputHandler (e) {
	var key = e.target.dataset.key, val, config;
	if (e.type !== (['range', 'date', 'time'].indexOf(e.target.type) > -1 ? 'input' : 'change')) {
		return;
	}
	if (e.target.id === 'date-input') {
		if (popupVisible.navigation) {
			hidePopup('navigation');
		}
		e.target.blur();
		navigate(makeLink(new Day(e.target.value), e.target.dataset.hora));
	}
	if (e.target.id === 'optional-select') {
		enableOptionalMemorial(e.target.value, new Day(e.target.dataset.date));
	}
	if (e.target.dataset.calendarextra) {
		config = Config.getConfig();
		val = config.get('calendarExtra').filter(function (key) {
			return key !== e.target.dataset.calendarextra;
		});
		if (e.target.checked) {
			val.push(e.target.dataset.calendarextra);
		}
		config.set('calendarExtra', val);
		updateCalendar(true);
	}

	if (!key) {
		return;
	}
	config = Config.getConfig();
	switch (e.target.type) {
	case 'select-multiple':
		val = readSelectMultiple(e.target, config.get(key));
		break;
	case 'checkbox':
		val = e.target.checked;
		break;
	default:
		val = e.target.value;
	}
	config.set(key, val);
	if (e.target.dataset.audio) {
		audioManager.onConfigChange(key, val);
	}
	if (e.target.dataset.screenlock) {
		if (val) {
			screenlock.enable();
		} else {
			screenlock.disable();
		}
	}
	if (e.target.dataset.debug) {
		if (Number(val) === 0) {
			debug.enableDisable(false);
		} else {
			debug.enableDisable(true);
			debug.getLog(); //clear log
		}
	}
	if (e.target.dataset.override) {
		l10n.parseOverride(val);
		updateInterface();
	}
	if (e.target.dataset.calendar) {
		updateCalendar(e.target.dataset.calendar > 1);
	}
	if (e.target.dataset.reload) {
		l10n.load(config.get('lang'), function () {
			var scrollElement = document.getElementsByTagName('html')[0];
			scrollPos[location.search] = scrollElement.scrollTop / scrollElement.scrollHeight;
			updateInterface();
			navigateToUrl();
		});
	}
}

function navigateToUrl () {
	navigate(location.search, true);
}

function getLanguageSelect () {
	return l10n.availableLanguages.map(function (entry) {
		return '<option value="' + entry.code + '">' + entry.autonym + '</option>';
	}).join('');
}

function getCalendarSelect () {
	var cal, ret = [];
	for (cal in Day.calendars) {
		if (Day.calendars[cal].labelMsg) {
			ret.push('<option value="' + cal + '" data-l10n="' + Day.calendars[cal].labelMsg + '"></option>');
		} else if (Day.calendars[cal].label) {
			ret.push('<option value="' + cal + '">' + Day.calendars[cal].label + '</option>');
		}
	}
	return ret.join('');
}

function init () {
	var config, el, langSelect;
	dom.main = document.getElementById('main');
	dom.settings = document.getElementById('settings');
	dom.settingsPopup = document.getElementById('popup-settings');
	dom.navigationPopup = document.getElementById('popup-navigation');
	dom.audioPopup = document.getElementById('popup-audio');
	dom.settingsLinkContainer = document.getElementById('settings-link-container');
	dom.backLinkContainer = document.getElementById('back-link-container');
	dom.additionalDays = document.getElementById('additional-days');
	dom.calendarExtraLabel = document.getElementById('calendar-extra-label');
	dom.calendarExtraList = document.getElementById('calendar-extra-list');
	dom.formAdditionalInput = document.getElementById('form-additional-input');

	hidePopup('settings');
	hidePopup('navigation');
	hidePopup('audio');

	getHora.makeLink = makeLink;
	getHora.makeSelect = makeSelect;

	config = new Config({
		papa: '',
		episcopus: '',
		rvMode: 'original',
		flexaAstericus: '†|*|<br>',
		psOratio: false,
		psalmusInvitatorium: 'ps-95',
		invitatoriumLocus: '',
		lectionisNight: false,
		moreHymns: false,
		varyCanticaLaudes: false,
		paterNosterIntro: 0,
		replaceDuplicatePsalms: true,
		noCommons: false,
		memoriaTSN: false,
		varyTSNAntiphon: false,
		removeDuplicateAntiphon: true,
		marianAntiphon: 'completorium',
		modusMaria: 2,
		dayStart: '00:00',
		calendar: 'de',
		calendarExtra: [],
		additionalDays: [],
		autoAddedDays: [],
		mariaSabbato: false,
		commemoratio: false,
		epiphaniasSunday: false,
		ascensionSunday: false,
		corpusSunday: false,
		notes: '',
		override: '',
		lang: 'de',
		lang2: '',
		skin: 'sepia',
		font: 14,
		strophae: false,
		solidus: false,
		verse: false,
		screenLock: false,
		sonus: true,
		notesStyle: 'modern',
		volume: 5,
		audioSpeed: 1,
		debug: 1
	}, ['skin', 'font', 'strophae', 'solidus', 'verse', 'sonus'], 'stundenbuch-config');

	audioManager.init(config);

	if (screenlock.isAvailable()) {
		if (config.get('screenLock')) {
			screenlock.enable();
		}
	} else {
		el = document.getElementById('input-screenlock');
		el.disabled = true;
		el.parentElement.className = 'disabled';
	}
	if (Number(config.get('debug')) === 0) {
		debug.enableDisable(false);
	}

	langSelect = getLanguageSelect();
	document.getElementById('language-select').innerHTML = langSelect;
	document.getElementById('secondary-language-select').innerHTML += langSelect;
	document.getElementById('calendar-select').innerHTML = getCalendarSelect();

	Config.setConfig(config);
	updateCalendar();
	l10n.parseOverride(config.get('override'));
	waitForPassword(
		'stundenbuch-password',
		document.getElementById('main'),
		l10n.availableLanguages.filter(function (entry) {
			return entry.prompt;
		}).map(function (entry) {
			return '<p lang="' + entry.code + '">' + entry.prompt + '</p>';
		}).join(''),
		function (pw) {
			l10n.setPassword(pw);
			l10n.load(config.get('lang'), function () {
				updateInterface();
				updateSettings(config);
				currentData = {
					day: new Day(),
					hora: 'index'
				};
				updateNavigation(currentData.day, currentData.hora);

				document.body.addEventListener('keydown', globalKeydownHandler, false);
				document.body.addEventListener('click', globalClickHandler, false);
				document.body.addEventListener('input', globalInputHandler, false);
				document.body.addEventListener('change', globalInputHandler, false);
				dom.settingsPopup.addEventListener('click', ignoreClick, false);
				dom.navigationPopup.addEventListener('click', ignoreClick, false);
				dom.audioPopup.addEventListener('click', ignoreClick, false);
				if ('scrollRestoration' in window.history) {
					window.history.scrollRestoration = 'manual';
				}
				window.addEventListener('popstate', navigateToUrl, false);

				navigateToUrl();
				document.getElementsByTagName('html')[0].className = '';
			});
		}
	);
}

init();

})();