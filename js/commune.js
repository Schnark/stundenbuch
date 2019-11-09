/*global Day, Config, l10n, util, debug*/
(function () {
"use strict";

function getPowerSet (set) {
	var first;
	if (set.length === 0) {
		return [''];
	}
	first = set.shift();
	set = getPowerSet(set);
	return set.map(function (el) {
		return first + (el ? '-' : '') + el;
	}).concat(set);
}

function getKeys (element, hora, name) {
	var keys = [];
	if (element === 'hymnus' && Config.getConfig().get('moreHymns') && Day.useHymnusLectionis[name] === hora) {
		hora = 'lectionis';
	}
	if (hora === 'vespera0') {
		keys.push(element + '-vespera-' + name + '-v');
		hora = 'vespera';
	}
	keys.push(element + '-' + hora + '-' + name);
	keys.push(element + '-' + name);
	if (element === 'antiphona') {
		keys = keys.map(function (key) {
			return key.replace('-laudes-', '-benedictus-').replace('-vespera-', '-magnificat-');
		});
	}
	return keys;
}

function getKeysMultiple (element, hora, main, additional) {
	var keys = [], i;
	if (!main && additional.length === 0) {
		return [];
	}
	additional = getPowerSet(additional);
	for (i = 0; i < additional.length; i++) {
		keys = keys.concat(getKeys(element, hora, main + (main && additional[i] ? '-' : '') + additional[i]));
	}
	return keys;
}

Day.useHymnusLectionis = {
	'cathedra-petri': 'laudes',
	'ioseph': 'laudes',
	'annuntiatio': 'laudes',
	//'exaltatio-crucis': 'vespera',
	'maria-immaculata': 'laudes',

	'ecclesia': 'vespera0',
	'doctor': 'laudes'
};

Day.communeFallback = {
	evangelista: 'apostolus2',
	apostolus2: 'apostolus',
	papa: 'episcopus',
	episcopus: 'pastor',
	fundator: 'pastor',
	missionarius: 'pastor',
	doctor: 'pastor',
	abbas: 'religiosus',
	religiosus: '',
	educator: '',
	misericordia: ''
};

Day.cantica = {
	'cantica-vespera-ecclesia-v': ['ps-147-i', 'ps-147-ii', 'apc-19'],
	'cantica-vespera-ecclesia-varianta-quadragesimae-v': ['ps-147-i', 'ps-147-ii', 'col-1'],
	'cantica-lectionis-ecclesia': ['ps-24', 'ps-84', 'ps-87'],
	'cantica-laudes-ecclesia': ['ps-63', 'dn-3-iii', 'ps-149'],
	'cantica-vespera-ecclesia': ['ps-46', 'ps-122', 'apc-19'],
	'cantica-vespera-ecclesia-varianta-quadragesimae': ['ps-46', 'ps-122', 'apc-15'],

	'cantica-lectionis-defunctus': ['ps-40-i', 'ps-40-ii', 'ps-42'],
	'cantica-laudes-defunctus': ['ps-51', 'is-38', 'ps-146'],
	'cantica-tertia-defunctus': ['ps-70', 'ps-85', 'ps-86-completorium'],
	'cantica-sexta-defunctus': ['ps-70', 'ps-85', 'ps-86-completorium'],
	'cantica-nona-defunctus': ['ps-70', 'ps-85', 'ps-86-completorium'],
	'cantica-vespera-defunctus': ['ps-121', 'ps-130-vespera', 'phil-2'],

	'cantica-vespera-maria-v': ['ps-113', 'ps-147-ii', 'eph-1'],
	'cantica-lectionis-maria': ['ps-24', 'ps-46', 'ps-87'],
	'cantica-laudes-maria': ['ps-118', 'dn-3-ii', 'ps-150'],
	'cantica-vespera-maria': ['ps-122', 'ps-127', 'eph-1'],

	'cantica-vespera-apostolus-v': ['ps-117', 'ps-147-ii', 'eph-1'],
	'cantica-lectionis-apostolus': ['ps-19-i', 'ps-64', 'ps-97'],
	'cantica-laudes-apostolus': ['ps-93', 'dn-3-iii', 'ps-148'],
	'cantica-vespera-apostolus': ['ps-116-ii', 'ps-126', 'eph-1'],

	'cantica-vespera-virgo-v': ['ps-113', 'ps-147-ii', 'eph-1'],
	'cantica-lectionis-virgo': ['ps-19-i', 'ps-45-i', 'ps-45-ii'],
	'cantica-laudes-virgo': ['ps-63', 'dn-3-iii', 'ps-149'],
	'cantica-vespera-virgo': ['ps-122', 'ps-127', 'eph-1'],

	'cantica-vespera-martyr-v': ['ps-118-i', 'ps-118-ii', '1-pt-2'],
	'cantica-lectionis-martyr-plures': ['ps-2', 'ps-33-i', 'ps-33-ii'],
	'cantica-lectionis-martyr': ['ps-2', 'ps-11', 'ps-17'],
	'cantica-laudes-martyr': ['ps-63', 'dn-3-iii', 'ps-149'],
	'cantica-vespera-martyr': ['ps-116-i', 'ps-116-ii', 'apc-4-5'],

	'cantica-vespera-pastor-v': ['ps-113', 'ps-146', 'eph-1'],
	'cantica-lectionis-pastor': ['ps-21', 'ps-92-i', 'ps-92-ii'],
	'cantica-laudes-pastor': ['ps-118', 'dn-3-ii', 'ps-150'],
	'cantica-vespera-pastor': ['ps-15', 'ps-112', 'apc-15'],

	'cantica-vespera-mulier-v': ['ps-113', 'ps-147-ii', 'eph-1'],
	'cantica-lectionis-mulier': ['ps-19-i', 'ps-45-i', 'ps-45-ii'],
	//'cantica-laudes-mulier': ['ps-63', 'dn-3-iii', 'ps-149'],
	'cantica-laudes-mulier': ['ps-93', 'dn-3-iii', 'ps-148'],
	'cantica-vespera-mulier': ['ps-122', 'ps-127', 'eph-1'],

	'cantica-vespera-vir-v': ['ps-113', 'ps-146', 'eph-1'],
	'cantica-lectionis-vir': ['ps-21', 'ps-92-i', 'ps-92-ii'],
	'cantica-laudes-vir': ['ps-118', 'dn-3-ii', 'ps-150'],
	'cantica-vespera-vir': ['ps-15', 'ps-112', 'apc-15']
};

Day.lectio = {
	'lectio-vespera-ecclesia-v': 'eph-2-19-22',
	'lectio-laudes-ecclesia': 'is-56-7',
	'lectio-tertia-ecclesia': '1-cor-3-16-17',
	'lectio-sexta-ecclesia': '2-cor-6-16',
	'lectio-nona-ecclesia': 'ier-7-2-7',
	'lectio-vespera-ecclesia': 'apc-21-2-27',

	'lectio-laudes-defunctus': '1-th-4-14',
	'lectio-tertia-defunctus': 'iob-19-25-26',
	'lectio-sexta-defunctus': 'sap-1-13-14-15',
	'lectio-nona-defunctus': 'is-25-8',
	'lectio-vespera-defunctus': '1-cor-15-55-57',

	'lectio-laudes-maria': 'is-61-10',
	'lectio-tertia-maria': 'so-3-14-15',
	'lectio-sexta-maria': 'za-9-9',
	'lectio-nona-maria': 'idt-13-18-19',
	'lectio-vespera-maria': 'gal-4-4-5',

	'lectio-laudes-apostolus2': '1-cor-15-1-4',
	'lectio-tertia-apostolus2': 'rm-1-16-17',
	'lectio-sexta-apostolus2': '1-th-2-2-4',
	'lectio-nona-apostolus2': '2-tim-1-8-9',
	'lectio-vespera-apostolus2': 'col-1-3-6',

	'lectio-vespera-apostolus-v': 'act-2-42-45',
	'lectio-laudes-apostolus': 'eph-2-19-22',
	'lectio-tertia-apostolus': '2-cor-5-19-20',
	'lectio-sexta-apostolus': 'act-5-12-14',
	'lectio-nona-apostolus': 'act-5-41-42',
	'lectio-vespera-apostolus': 'eph-4-11-13',

	'lectio-laudes-virgo': 'ct-8-7',
	'lectio-tertia-virgo': 'sap-8-21',
	'lectio-sexta-virgo': '1-cor-7-25',
	'lectio-nona-virgo': 'apc-19-6-7',
	'lectio-vespera-virgo': '1-cor-7-32-34',

	'lectio-vespera-martyr-v': 'rm-8-35-39',
	'lectio-vespera-martyr-varianta-paschale-v': 'apc-3-10-12',
	'lectio-laudes-martyr': '2-cor-1-3-5',
	'lectio-laudes-martyr-varianta-paschale': '1-io-5-3-5',
	'lectio-tertia-martyr': '1-pt-5-10-11',
	'lectio-sexta-martyr-plures': 'hbr-11-33',
	'lectio-sexta-martyr': 'iac-1-12',
	'lectio-nona-martyr': 'sap-3-1-3',
	'lectio-vespera-martyr': '1-pt-4-13-14',
	'lectio-vespera-martyr-varianta-paschale': 'apc-7-14-17',
/*tertia, sexta, nona: varianta-paschale:
Lectio <Ap 2, 10–11>

Nihil horum tímeas, quæ passúrus es. Ecce missúrus est Diábolus ex vobis in cárcerem, ut tentémini, et habébitis tribulatiónem diébus decem. Esto fidélis usque ad mortem, et dabo tibi corónam vitæ.

Lectio <Ap 3, 21>

Qui vícerit, dabo ei sedére mecum in throno meo, sicut et ego vici et sedi cum Patre meo in throno eius.

Lectio <Ap 19, 7.9>

Gaudeámus et exsultémus et demus glóriam Deo, quia venérunt núptiæ Agni. Beáti, qui ad cenam nuptiárum Agni vocáti sunt!
*/

	'lectio-laudes-doctor': 'sap-7-13-14',
	'lectio-vespera-doctor': 'iac-3-17-18',

	'lectio-laudes-pastor': 'hbr-13-7-9',
	'lectio-tertia-pastor': '1-tim-4-16',
	'lectio-sexta-pastor': '1-tim-1-12',
	'lectio-nona-pastor': '1-tim-3-13',
	'lectio-vespera-pastor': '1-pt-5-1-4',

	'lectio-vespera-mulier-v': 'phil-3-7-8',
	'lectio-laudes-mulier': 'rm-12-1-2',
	'lectio-tertia-mulier': 'gal-6-7b-8',
	'lectio-sexta-mulier': '1-cor-9-26-27',
	'lectio-nona-mulier': 'phil-4-8-9',
	'lectio-vespera-mulier': 'rm-8-28-30',

	'lectio-vespera-vir-v': 'phil-3-7-8',
	'lectio-laudes-vir': 'rm-12-1-2',
	'lectio-tertia-vir': 'gal-6-7b-8',
	'lectio-sexta-vir': '1-cor-9-26-27',
	'lectio-nona-vir': 'phil-4-8-9',
	'lectio-vespera-vir': 'rm-8-28-30'
};

Day.getSource = function (data, element, hora) {
	if (data.texts[element] && data.texts[element][hora]) {
		return data.texts[element][hora];
	}
	if (data.commune === 'ordinarium') {
		return 'o';
	}
	if (data.commune === 'defunctus') {
		return 'p';
	}
	if (element === 'hymnus' && ['tertia', 'sexta', 'nona'].indexOf(hora) > -1) {
		return 'o';
	}
	if (data.rank === 0) {
		return 'p';
	}
	if (element === 'cantica' && ['tertia', 'sexta', 'nona'].indexOf(hora) > -1) {
		return 'o'; //TODO Herrenfest Sonntag: Psalmen der ersten Woche
	}
	if (data.rank === 1) {
		return 'p';
	}
	if (['tertia', 'sexta', 'nona'].indexOf(hora) > -1 && Config.getConfig().get('memoriaTSN')) {
		return 'p';
	}
	if (element === 'oratio' && Config.getConfig().get('bugCompat')) {
		return 'p';
	}
	if (element === 'cantica' || element === 'versus' || ['tertia', 'sexta', 'nona'].indexOf(hora) > -1) {
		return 'o';
	}
	if (data.rank === 2) {
		return 'p';
	}
	if (element === 'oratio' || (element === 'lectio' && hora === 'lectionis')) { //TODO || hora === 'invitatorium' ?
		return 'p';
	}
	return 'o';
};

Day.getCantica = function (keys, hora, cantica) {
	var i, oneAntiphona;

	function modify (key, nr, prefix) {
		return (prefix ? 'antiphona-' : '') +
			(key.replace(/^cantica-/, '') + (oneAntiphona ? '' : '-' + nr)).replace(/-v-(\d)$/, '-$1-v');
	}

	function addAntiphona (canticum, j) {
		return canticum + '|!' + modify(keys[i], j + 1);
	}

	oneAntiphona = ['tertia', 'sexta', 'nona'].indexOf(hora) > -1;

	if (!cantica) {
		if (oneAntiphona && keys.indexOf('cantica-defunctus') === -1) {
			cantica = ['*', '*', '*'];
		} else if (
			hora === 'laudes' &&
			keys.indexOf('cantica-defunctus') === -1 &&
			!Config.getConfig().get('varyCanticaLaudes')
		) {
			cantica = ['ps-63', 'dn-3-iii', 'ps-149'];
		} else {
			for (i = 0; i < keys.length; i++) {
				if (Day.cantica[keys[i]]) {
					debug.log('Use ' + keys[i] + ' from [' + keys.join(', ') + '].');
					cantica = Day.cantica[keys[i]];
					break;
				}
			}
			if (
				!cantica &&
				hora === 'laudes' &&
				keys.indexOf('cantica-defunctus') === -1
			) {
				cantica = ['ps-63', 'dn-3-iii', 'ps-149'];
			}
		}
	}
	if (!cantica) {
		debug.log('Use none from [' + keys.join(', ') + '].');
		return;
	}

	for (i = 0; i < keys.length; i++) {
		if (l10n.has(modify(keys[i], 1, true))) {
			debug.log('Use ' + keys[i] + ' from [' + keys.join(', ') + '].');
			return cantica.map(addAntiphona);
		}
	}
	debug.log('Use none from [' + keys.join(', ') + '] as antiphona.');
};

Day.getLectioLectionis = function (keys, both) {
	var i, first, second, commemoratio, noregular;
	if (both === 'commemoratio') {
		both = false;
		commemoratio = true;
	}
	for (i = 0; i < keys.length; i++) {
		if (!first && both && l10n.has(keys[i] + '-a')) {
			first = keys[i].replace('lectio-lectionis-', '');
			debug.log('Use ' + keys[i] + '-a from [' + keys.join(', ') + '].');
		}
		if (!second && l10n.has(keys[i] + '-b')) {
			second = keys[i].replace('lectio-lectionis-', '');
			debug.log('Use ' + keys[i] + '-b from [' + keys.join(', ') + '].');
		}
	}
	if (!first && !second) {
		debug.log('Use none from [' + keys.join(', ') + '].');
		return;
	}
	noregular = ['natalis', 'stephanus', 'ioannes-apostolus', 'innocentes', 'maria-genetrix',
		'epiphanias', 'baptismate'].indexOf(keys[0].replace('lectio-lectionis-', '')) > -1;
	if (first) {
		return [
			first + '-a', second + '-b',
			noregular ? false : undefined
		];
	}
	if (commemoratio) {
		return [second + '-b', true];
	}
	return second + '-b';
};

Day.getText = function (data, element, hora, part) {
	var source, keys = [], key, cantica, commune, i, antiphona;

	function getModifiers () {
		var modifiers = util.clone(data.modifier);
		if (part && !Config.getConfig().get('bugCompat')) {
			modifiers.push('varianta-' + part);
		}
		return modifiers;
	}

	if (!data) {
		return;
	}
	if (element === 'maria') {
		return (data.texts && data.texts.maria) || '';
	}
	source = Day.getSource(data, element, hora);
	if (Array.isArray(source)) {
		cantica = source;
		source = 'p';
	}
	switch (source) {
	case 'o':
		return;
	case 'p':
		keys = getKeys(element, hora, data.name);
		/*falls through*/
	case 'c':
		if (data.rank === 2 && data.commune !== 'defunctus' && (
			(element === 'lectio' && hora === 'lectionis') ||
			(
				element !== 'oratio' && Config.getConfig().get('noCommons') &&
				!(data.texts && data.texts.cantica) //special memorial, keep common texts
			)
		)) {
			break;
		}
		commune = util.clone(data.commune);
		do {
			keys = keys.concat(getKeysMultiple(element, hora, commune, getModifiers()));
			commune = Day.communeFallback[commune];
		} while (commune !== undefined);
		break;
	default:
		return source; //should only happen for 'lectio'
	}
	if (element === 'cantica') {
		return Day.getCantica(keys, hora, cantica);
	}
	if (element === 'lectio') {
		if (hora === 'lectionis') {
			return Day.getLectioLectionis(keys,
				data.rank === 3 ? 'commemoratio' : (data.commune === 'defunctus' || data.rank < 2));
		}
		for (i = 0; i < keys.length; i++) {
			if (Day.lectio[keys[i]]) {
				debug.log('Use ' + keys[i] + ' from [' + keys.join(', ') + '].');
				return Day.lectio[keys[i]];
			}
		}
	}
	if (element === 'oratio' && data.rank === 3 && ['laudes', 'vespera'].indexOf(hora) > -1) {
		for (i = 0; i < keys.length; i++) {
			if (l10n.has(keys[i].replace(/^oratio-/, 'antiphona-'))) {
				debug.log('Use ' + keys[i] + ' from [' + keys.join(', ') + '] (antiphona).');
				antiphona = keys[i].replace(/^oratio-/, 'antiphona-');
				break;
			}
		}
		if (!antiphona) {
			for (i = 0; i < keys.length; i++) {
				key = keys[i]
					.replace(/^oratio-laudes-/, 'antiphona-benedictus-')
					.replace(/^oratio-vespera-/, 'antiphona-magnificat-');
				if (key !== keys[i] && l10n.has(key)) {
					debug.log('Use ' + key + ' from [' + keys.join(', ') + '] (antiphona).');
					antiphona = key;
					break;
				}
			}
		}
		if (!antiphona) {
			debug.log('Use none from [' + keys.join(', ') + '].');
			return;
		}
		for (i = 0; i < keys.length; i++) {
			if (l10n.has(keys[i])) {
				debug.log('Use ' + keys[i] + ' from [' + keys.join(', ') + '].');
				return [antiphona, keys[i].replace(/^oratio-/, '')];
			}
		}
	}
	for (i = 0; i < keys.length; i++) {
		if (l10n.has(keys[i])) {
			debug.log('Use ' + keys[i] + ' from [' + keys.join(', ') + '].');
			return keys[i].replace(/^(?:antiphona-)?[^\-]+-/, '');
		}
	}
	debug.log('Use none from [' + keys.join(', ') + '].');
};

Day.specialDays = {};

Day.additionalDays = [];

Day.nameFallback = {};

Day.addSpecialDay = function (d, m, name, rank, types, data, local) {
	var key, val, typeOfDay = ['sollemnitas', 'festum', 'memoria', 'memoria-1'][rank] || '';
	if (rank < 3 || name === undefined) {
		Day.additionalDays = Day.additionalDays.filter(function (entry) {
			return !(entry.d === d && entry.m === m);
		});
	}
	if (name) {
		if (typeof data === 'string') {
			if (!Day.nameFallback[name]) {
				Day.nameFallback[name] = data.replace(/[<>"&]/g, ' '); //could be provided by the user
			}
			data = {};
		} else if (data && data.nameFallback) {
			Day.nameFallback[name] = data.nameFallback;
		}
	}
	if (rank === 3) {
		Day.additionalDays.push({
			d: d,
			m: m,
			name: name
		});
		if ((Config.getConfig().get('additionalDays') || []).indexOf(name) > -1) {
			rank = 2;
		} else {
			return;
		}
	}
	if (!Array.isArray(types)) {
		types = types ? [types] : [];
	}
	if (m === 'easter') {
		key = 'easter/' + d;
		val = {
			order: rank <= 1 ? (local ? 1.5 : 0) : (rank === 2 ? 6 : 4) //FIXME
		};
	} else if (m === 'sunday') {
		key = 'sunday/' + d;
		val = {
			order: rank === 0 ? 1 : (types.indexOf('dominus') > -1 ? 2 : 3),
			eve: true
		};
	} else {
		key = String(m) + '/' + String(d);
		val = {
			order: rank === 0 ?
				//to make sure Christmas eve takes precedence over 4th sunday of advent
				(types.indexOf('dominus') > -1 ? -1 : 1 + (local ? 0.5 : 0)) :
				(types.indexOf('dominus') > -1 ? 2 : rank === 2 ? 6 : 4)
		};
	}
	if (name === undefined) {
		delete Day.specialDays[key];
		return;
	}
	if (
		rank === 0 ||
		(rank === 1 && types.indexOf('dominus') > -1 && Config.getConfig().get('bugCompat'))
	) {
		val.eve = true;
		val.completorium = true;
	}
	val.name = name;
	val.rank = rank;
	val.tedeum = rank < 2;
	val.type = typeOfDay;
	switch (types[0]) {
	case 'ordinarium': break;
	case 'maria': val.color = 'blue'; break;
	case 'defunctus': val.color = 'black'; break;
	default: val.color = types.indexOf('martyr') > -1 ? 'red' : 'white';
	}
	if (types[0] === 'defunctus' && rank < 2) {
		val.tedeum = false;
		val.completorium = true;
		val.type = '';
	}
	if (types[0] === 'ecclesia' && Config.getConfig().get('dedicationExtern') && types.indexOf('extra') === -1) {
		types.push('extra');
	}
	val.commune = types.shift() || '';
	val.modifier = types;
	val.texts = {};
	util.merge(val, data || {});
	if (Day.specialDays[key] && Day.specialDays[key].move) {
		val.move = Day.specialDays[key].move;
	}
	Day.specialDays[key] = val;
};

Day.addSpecialDays = function (days, extend) {
	var i;
	if (!extend) {
		Day.specialDays = {};
		Day.additionalDays = [];
	}
	for (i = 0; i < days.length; i++) {
		Day.addSpecialDay.apply(this, days[i], extend); //FIXME extend zu grob
	}
};

Day.getSpecialDataByMove = function (special, day) {
	var move;
	if (special && special.move) {
		move = special.move(day);
		if (move) {
			special = Day.specialDays[move];
		} else if (!special.name) {
			special = false;
		}
	}
	return special;
};

Day.getMariaSabbato = function (variant) {
	return {
		name: 'maria-sabbato',
		rank: 2,
		order: 6,
		color: 'blue',
		type: 'memoria-1',
		commune: 'maria',
		modifier: [],
		texts: {
			//TODO vary other elements, too
			lectio: {
				lectionis: 'maria-sabbato-' + (variant % 4)
			}
		}
	};
};

Day.getSpecialData = function (day, order, data) {
	var keys,
		special,
		i,
		result = {
			omittedNames: {},
			alternativeNames: [],
			notes: []
		};

	keys = [data.m + '/' + data.w, data.m + '/' + data.d, 'sunday/' + data.s, 'easter/' + data.e];

	Day.additionalDays.filter(function (d) {
		return keys.indexOf(d.m + '/' + d.d) > -1;
	}, this).forEach(function (d) {
		result.alternativeNames.push(d.name);
	}, this);

	for (i = 0; i < keys.length; i++) {
		special = Day.getSpecialDataByMove(Day.specialDays[keys[i]], day);
		if (!special) {
			continue;
		}
		if (special.rank === 2 && order === 5) {
			if (result.alternativeNames.indexOf(special.name) === -1) {
				result.alternativeNames.push(special.name);
			}
			if (Config.getConfig().get('commemoratio')) {
				special = util.clone(special);
				special.rank = 3;
				special.originalType = special.type;
				special.type = 'commemoratio';
				special.order = 5;
				delete special.color;
			}
		}
		if (special.order <= order) {
			if (result.special && result.alternativeNames.indexOf(result.special.name) === -1) {
				result.omittedNames[result.special.name] = result.special.type;
			}
			result.special = special;
			order = result.special.order;
		} else if (special.rank !== 2 || order !== 5) {
			result.omittedNames[special.name] = special.type;
		}
	}
	if (result.special && ['memoria-1', 'commemoratio'].indexOf(result.special.type) > -1) {
		result.alternativeNames.splice(result.alternativeNames.indexOf(result.special.name), 1);
		result.alternativeNames.unshift('');
	} else if (result.special || order < 5) {
		for (i = 0; i < result.alternativeNames.length; i++) {
			result.omittedNames[result.alternativeNames[i]] = 'memoria-1'; //TODO oder 'memoria' ?
		}
		result.alternativeNames = [];
	}
	if (data.maria && order >= 6 && (!result.special || result.special.type === 'memoria-1')) {
	//TODO nicht, wenn anderer Mariengedenktag
		if (!result.special && Config.getConfig().get('mariaSabbato')) {
			result.special = Day.getMariaSabbato(data.maria - 1);
			result.alternativeNames.unshift('');
		} else {
			result.alternativeNames.push('maria-sabbato');
		}
	}

	for (i = 0; i < keys.length; i++) {
		if (Day.notes[keys[i]]) {
			result.notes = Day.notes[keys[i]].concat(result.notes);
		}
	}

	return result;
};

})();
