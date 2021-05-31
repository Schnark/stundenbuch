/*global getHora: true, formatSequence, l10n, util, Day, Config*/
getHora =
(function () {
"use strict";

function getHymnusLectionis (date, config) {
	var hymn = date.getText('hymnus', 'lectionis');
	if (!hymn) {
		switch (date.getPart()) {
		case 0:
			hymn = 'lectionis-' + date.getDayInSequence(Number(l10n.get('modus-hymnus-lectionis'))) +
				(config.get('lectionisNight') ? '-nox' : '');
			break;
		case 1:
			if (config.get('bugCompat') && [0, 4, 5].indexOf(date.getSubPart()) > -1) {
				hymn = 'lectionis-' + date.getDayInSequence(14);
				break;
			}
			switch (date.getSubPart()) {
			case 0:
				hymn = 'lectionis-adventus';
				break;
			case 1:
			case 2:
				hymn = 'lectionis-adventus-1';
				break;
			case 3:
			case 4:
				hymn = 'lectionis-nativitatis';
				break;
			case 5:
				hymn = 'lectionis-nativitatis-1';
				break;
			}
			break;
		case 2:
			hymn = date.getSubPart() >= 2 ?
				'lectionis-quadragesimae-2' :
				'lectionis-quadragesimae' + (!config.get('bugCompat') && date.isSunday() ? '-1' : '');
			break;
		case 3: hymn = date.getSubPart() > 1 ? 'lectionis-paschale-1' : 'lectionis-paschale';
		}
	}
	return 'hymnus-' + hymn;
}

function getHymnusLaudes (date, config) {
	var hymn = date.getText('hymnus', 'laudes');
	if (!hymn) {
		switch (date.getPart()) {
		case 0:
			hymn = 'laudes-' + date.getDayInSequence(
				config.get('moreHymns') ? 28 : Number(l10n.get('modus-hymnus-laudes', '14'))
			);
			break;
		case 1:
			hymn = date.getSubPart() < 3 ?
				'laudes-adventus' + (date.getSubPart() > 0 ? '-1' : '') :
				'laudes-nativitatis' + (date.getSubPart() === 5 ? '-1' : '');
			break;
		case 2:
			hymn = date.getSubPart() >= 2 ? 'laudes-quadragesimae-2' : 'laudes-quadragesimae' + (date.isSunday() ? '-1' : '');
			break;
		case 3: hymn = date.getSubPart() > 1 ? 'laudes-paschale-1' : 'laudes-paschale';
		}
	}
	return 'hymnus-' + hymn;
}

function getHymnusTertiaSextaNona (date, type, complementaris) {
	var hymn;
	type = ['tertia', 'sexta', 'nona'][type];
	hymn = date.getText('hymnus', type);
	if (!hymn) {
		switch (l10n.get('modus-hymnus-tsn')) {
		case '1+anp': //TODO optional 2+anp
			if (date.getPart() === 1) {
				if (date.getSubPart() <= 2) {
					hymn = type + '-adventus';
				} else {
					hymn = type + '-nativitatis';
				}
			} else if (date.getPart() === 3) {
				hymn = type + '-paschale';
			} else {
				hymn = type;
			}
			break;
		case '2+qp':
			if (date.getPart() === 1) {
				hymn = type + '-' + [0, 1, 1, 0, 0, 1][date.getSubPart()];
			} else if (date.getPart() === 2) {
				hymn = type + '-quadragesimae';
			} else if (date.getPart() === 3) {
				hymn = type + '-paschale';
			} else {
				hymn = type + '-' + (1 - Math.floor((date.getDayInSequence() % 14) / 7));
			}
			break;
		case '14+3':
			if (date.getPart() === 1) {
				if (date.getSubPart() <= 2) {
					hymn = 'tsn-adventus';
				} else {
					hymn = 'tsn-nativitatis';
				}
			} else if (date.getPart() === 2) {
				hymn = 'tsn-quadragesimae' + (date.getSubPart() >= 2 ? '-1' : '');
			} else if (date.getPart() === 3) {
				hymn = 'tsn-paschale';
			} else {
				hymn = complementaris ? type : 'tsn-' + date.getDayInSequence(14);
			}
			break;
		default:
			hymn = type;
		}
	}
	return 'hymnus-' + hymn;
}

function getHymnusVespera (date, config) {
	var hymn = date.getText('hymnus', 'vespera');
	if (!hymn) {
		switch (date.getPart()) {
		case 0:
			hymn = date.getDayInSequence(config.get('moreHymns') ? 28 : 14); //TODO 14 nach modus?
			if (!config.get('moreHymns') && hymn === 13) {
				hymn = 27;
			}
			hymn = 'vespera-' + hymn;
			break;
		case 1:
			hymn = date.getSubPart() < 3 ?
				'vespera-adventus' + (date.getSubPart() > 0 ? '-1' : '') :
				'vespera-nativitatis' + (date.getSubPart() === 5 ? '-1' : '');
			break;
		case 2:
			hymn = date.getSubPart() >= 2 ? 'vespera-quadragesimae-2' :
				'vespera-quadragesimae' + (date.isSunday() ? '-1' : '');
			break;
		case 3: hymn = date.getSubPart() > 1 ? 'vespera-paschale-1' : 'vespera-paschale';
		}
	}
	return 'hymnus-' + hymn;
}

function getHymnusCompletorium (date, day) {
	switch (l10n.get('modus-hymnus-completorium')) {
	case '7': return 'hymnus-completorium-' + day;
	case '2+p':
		if (date.getPart() === 1) {
			return 'hymnus-completorium-' + [0, 1, 1, 0, 0, 1][date.getSubPart()];
		}
		if (date.getPart() === 3) {
			return 'hymnus-completorium-paschale';
		}
		return 'hymnus-completorium-' + Math.floor(((date.getDayInSequence() + 1) % 14) / 7);
	default:
		return 'hymnus-completorium';
	}
}

function getCanticaLectionis (date) {
	var canticum = [
		['ps-1', 'ps-2', 'ps-3'],
		['ps-6', 'ps-9-i', 'ps-9-ii'],
		['ps-10-i', 'ps-10-ii', 'ps-12'],
		['ps-18-i', 'ps-18-ii', 'ps-18-iii'],
		['ps-18-iv', 'ps-18-v', 'ps-18-vi'],
		['ps-35-i', 'ps-35-ii', 'ps-35-iii'],
		['ps-131-lectionis', 'ps-132-i-lectionis', 'ps-132-ii-lectionis'],
		['ps-104-i', 'ps-104-ii', 'ps-104-iii'],
		['ps-31-i-lectionis', 'ps-31-ii-lectionis', 'ps-31-iii-lectionis'],
		['ps-37-i', 'ps-37-ii', 'ps-37-iii'],
		['ps-39-i', 'ps-39-ii', 'ps-52'],
		['ps-44-i|v0', 'ps-44-ii|v0', 'ps-44-iii|v0'],
		['ps-38-i', 'ps-38-ii', 'ps-38-iii'],
		['ps-136-i-lectionis', 'ps-136-ii-lectionis', 'ps-136-iii-lectionis'],
		['ps-145-i-lectionis', 'ps-145-ii-lectionis', 'ps-145-iii-lectionis'],
		['ps-50-i|v0', 'ps-50-ii|v0', 'ps-50-iii|v0'],
		['ps-68-i', 'ps-68-ii', 'ps-68-iii'],
		['ps-89-i', 'ps-89-ii', 'ps-89-iii'],
		['ps-89-iv', 'ps-89-v', 'ps-90-lectionis'],
		['ps-69-i', 'ps-69-ii', 'ps-69-iii'],
		['ps-107-i', 'ps-107-ii', 'ps-107-iii'],
		['ps-24-lectionis', 'ps-66-i', 'ps-66-ii'],
		['ps-73-i', 'ps-73-ii', 'ps-73-iii'],
		['ps-102-i', 'ps-102-ii', 'ps-102-iii'],
		['ps-103-i', 'ps-103-ii', 'ps-103-iii'],
		['ps-44-i|v1', 'ps-44-ii|v1', 'ps-44-iii|v1'],
		['ps-55-i-lectionis', 'ps-55-ii-lectionis', 'ps-55-iii-lectionis'],
		['ps-50-i|v1', 'ps-50-ii|v1', 'ps-50-iii|v1']
	], canticumN = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
		['', '', ''],
		['ps-46|n', 'ps-72-i|n', 'ps-72-ii|n'],
		['ps-85|n', 'ps-89-i|n', 'ps-89-ii|n'],
		['ps-96|n', 'ps-97|n', 'ps-98|n']
	],
	canticumP = [
		['', '', ''],
		['ps-1|p', 'ps-2|p', 'ps-3|p'],
		['ps-24-lectionis|p', 'ps-66-i|p', 'ps-66-ii|p'],
		['ps-104-i|p', 'ps-104-ii|p', 'ps-104-iii|p'],
		['ps-118-i|p', 'ps-118-ii|p', 'ps-118-iii|p'],
		['ps-136-i-lectionis|p', 'ps-136-ii-lectionis|p', 'ps-136-iii-lectionis|p'],
		['ps-145-i-lectionis|p', 'ps-145-ii-lectionis|p', 'ps-145-iii-lectionis|p'],
		['ps-1|p', 'ps-2|p', 'ps-3|p']
	], cantica;
	cantica = date.getText('cantica', 'lectionis');
	if (!cantica) {
		cantica = canticum[date.getDayInSequence()];
		if (date.getPart() !== 0) {
			cantica[0] = cantica[0]
				.replace('ps-131-lectionis', 'ps-105-i')
				.replace('ps-136-i-lectionis', 'ps-106-i')
				.replace('ps-55-i-lectionis', 'ps-78-i')
				.replace('ps-50-i|v1', 'ps-78-iv');
			cantica[1] = cantica[1]
				.replace('ps-132-i-lectionis', 'ps-105-ii')
				.replace('ps-136-ii-lectionis', 'ps-106-ii')
				.replace('ps-55-ii-lectionis', 'ps-78-ii')
				.replace('ps-50-ii|v1', 'ps-78-v');
			cantica[2] = cantica[2]
				.replace('ps-132-ii-lectionis', 'ps-105-iii')
				.replace('ps-136-iii-lectionis', 'ps-106-iii')
				.replace('ps-55-iii-lectionis', 'ps-78-iii')
				.replace('ps-50-iii|v1', 'ps-78-vi');

		}
		switch (date.getPart()) {
		case 1:
			if (date.getSubPart() === 3) {
				cantica = canticumN[date.getDayInChristmasSequence()];
			}
			if (date.getSubPart() < 3 && date.isSunday()) {
				cantica = cantica.map(function (s) {
					return s.replace(/\|.*$/g, '') + '|a';
				});
			}
			break;
		case 2:
			if (date.isSunday()) {
				cantica = cantica.map(function (s) {
					return s.replace(/\|.*$/g, '') + '|q';
				});
			}
			break;
		case 3:
			if (date.getSubPart() === 0) {
				cantica = canticumP[date.getDayInSequence(-1)];
			} else if (date.isSunday()) {
				cantica = cantica.map(function (s) {
					return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'p';
				});
			}
			break;
		}
	}
	return cantica;
}

function getCanticaLaudes (date) {
	var canticum = [
		['ps-63', 'dn-3-iii|v0', 'ps-149'],
		['ps-5', '1-par-29', 'ps-29'],
		['ps-24', 'tb-13-i', 'ps-33'],
		['ps-36', 'idt-16', 'ps-47'],
		['ps-57', 'ier-31', 'ps-48'],
		['ps-51|v0', 'is-45', 'ps-100|v0'],
		['ps-119-xix|v0', 'ex-15', 'ps-117|v0'],
		['ps-118|v0', 'dn-3-ii|v0', 'ps-150|v0'],
		['ps-42', 'sir-36', 'ps-19-i'],
		['ps-43', 'is-38', 'ps-65'],
		['ps-77', '1-sm-2', 'ps-97'],
		['ps-80', 'is-12', 'ps-81'],
		['ps-51|v1', 'hab-3', 'ps-147-ii|v0'],
		['ps-92|v0', 'dt-32', 'ps-8|v0'],
		['ps-93', 'dn-3-iii|v1', 'ps-148'],
		['ps-84', 'is-2', 'ps-96'],
		['ps-85', 'is-26', 'ps-67-laudes'],
		['ps-86-laudes', 'is-33', 'ps-98'],
		['ps-87', 'is-40', 'ps-99'],
		['ps-51|v2', 'ier-14', 'ps-100|v1'],
		['ps-119-xix|v1', 'sap-9', 'ps-117|v1'],
		['ps-118|v1', 'dn-3-ii|v1', 'ps-150|v1'],
		['ps-90', 'is-42', 'ps-135-i-laudes'],
		['ps-101', 'dn-3-i', 'ps-144-i-laudes'],
		['ps-108', 'is-61-62', 'ps-146'],
		['ps-143-laudes', 'is-66', 'ps-147-i'],
		['ps-51|v3', 'tb-13-ii', 'ps-147-ii|v1'],
		['ps-92|v1', 'ez-36', 'ps-8|v1']
	], cantica;
	cantica = date.getText('cantica', 'laudes');
	if (!cantica) {
		cantica = canticum[date.getDayInSequence()];
		switch (date.getPart()) {
		case 1:
			switch (date.getSubPart()) {
			case 0:
				if (date.isSunday()) {
					cantica = cantica.map(function (s) {
						return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'a';
					});
				}
				break;
			case 1:
				if (date.isSunday()) {
					cantica = cantica.map(function (s) {
						return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'a';
					});
				} else {
					cantica = cantica.map(function (s, i) {
						return s.replace(/\|.*$/g, '') + '|!adventus-' + date.getDay() + '-' + (i + 1);
					});
				}
				break;
			case 2: //TODO Ps 92/Ez 36/Ps 8 ???
				cantica = cantica.map(function (s, i) {
					return s.replace(/\|.*$/g, '') + '|!adventus-24-' + (i + 1);
				});
				break;
			case 3:
				cantica = canticum[0].map(function (s) {
					return s.replace(/\|.*$/g, '') + '|nativitatis';
				});
				break;
			case 4: case 5:
				/*if (Config.getConfig().get('bugCompat')) {
					cantica = canticum[date.getDayInSequence() + 7];
				}*/
				if (date.isSunday()) {
					cantica = cantica.map(function (s) {
						return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'n';
					});
				}
			}
			break;
		case 2:
			if (date.getDayInSequence(-1) === -4 && !Config.getConfig().get('bugCompat')) {
				cantica = canticum[19];
			}
			if (date.isSunday() || date.getSubPart() >= 2) {
				cantica = cantica.map(function (s) {
					return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'q';
				});
			}
			break;
		case 3:
			if (date.getSubPart() === 0) {
				cantica = canticum[0].map(function (s) {
					return s.replace(/\|.*$/g, '') + '|paschale';
				});
			} else {
				cantica = cantica.map(function (s) {
					if (s.indexOf('|') === -1) {
						s += '|v';
					}
					return s + 'p';
				});
			}
			break;
		}
	}
	return cantica;
}

function getCanticaTertiaSextaNona (date, hora, complementaris, config) {
	var canticum = [
			['ps-118-i|v0', 'ps-118-ii|v0', 'ps-118-iii|v0'],
			['ps-19-ii', 'ps-7-i', 'ps-7-ii'],
			['ps-119-i', 'ps-13', 'ps-14'],
			['ps-119-ii', 'ps-17-i', 'ps-17-ii'],
			['ps-119-iii', 'ps-25-i', 'ps-25-ii'],
			['ps-119-iv', 'ps-26', 'ps-28'],
			['ps-119-v', 'ps-34-i|v0', 'ps-34-ii|v0'],
			['ps-23|v0', 'ps-76-i|v0', 'ps-76-ii|v0'],
			['ps-119-vi', 'ps-40-i', 'ps-40-ii'],
			['ps-119-vii', 'ps-53', 'ps-54'],
			['ps-119-viii', 'ps-55-i', 'ps-55-ii'],
			['ps-119-ix', 'ps-56', 'ps-57-tsn'],
			['ps-119-x', 'ps-59', 'ps-60'],
			['ps-119-xi', 'ps-61', 'ps-64'],
			['ps-118-i|v1', 'ps-118-ii|v1', 'ps-118-iii|v1'],
			['ps-119-xii', 'ps-71-i', 'ps-71-ii'],
			['ps-119-xiii', 'ps-74-i', 'ps-74-ii'],
			['ps-119-xiv-tsn', 'ps-70', 'ps-75'],
			['ps-119-xv', 'ps-79', 'ps-80-tsn'],
			['ps-22-i', 'ps-22-ii', 'ps-22-iii'],
			['ps-119-xvi', 'ps-34-i|v1', 'ps-34-ii|v1'],
			['ps-23|v1', 'ps-76-i|v1', 'ps-76-ii|v1'],
			['ps-119-xvii', 'ps-82', 'ps-120'],
			['ps-119-xviii', 'ps-88-i', 'ps-88-ii'],
			['ps-119-xix-tsn', 'ps-94-i', 'ps-94-ii'],
			['ps-119-xx', 'ps-128-tsn', 'ps-129'],
			['ps-119-xxi', 'ps-133', 'ps-140'],
			['ps-119-xxii', 'ps-45-i-tsn', 'ps-45-ii-tsn']
		],
		canticum2 = [ //TODO umbenennen -tsn -> -tertia, -sexta, -nona, 128
			['ps-120', 'ps-121-tsn', 'ps-122-tsn'], //TODO 120 aufspalten für en
			['ps-123-tsn', 'ps-124-tsn', 'ps-125-tsn'],
			['ps-126-tsn', 'ps-127', 'ps-128'] //TODO 127 aufspalten für en
		],
		canticumP = [
			['ps-118-i', 'ps-118-ii', 'ps-118-iii'],
			['ps-8', 'ps-19-i', 'ps-19-ii'],
			['ps-119-i', 'ps-16-vespera', 'ps-23'],
			['ps-119-ii', 'ps-28', 'ps-116-ii'],
			['ps-119-iii', 'ps-30-i', 'ps-30-ii'],
			['ps-119-iv', 'ps-76-i', 'ps-76-ii'],
			['ps-119-v', 'ps-96-i', 'ps-96-ii'],
			['ps-118-i', 'ps-118-ii', 'ps-118-iii']
		], cantica, antiphona, vespera;
	if (config.get('replaceDuplicatePsalms')) { //TODO welche Antiphonen?
//Marienfeste 122 (121) -> 129 (128), 127 (126) -> 131 (130)
//Apostel, Kirchweihe
//3. Woche Mo, Mi
		vespera = getCanticaVespera(date).join(' ');
		if (vespera.indexOf('ps-122') > 0) {
			canticum2[0][2] = 'ps-129';
		}
		if (vespera.indexOf('ps-127') > 0) {
			canticum2[2][1] = 'ps-131';
		}
	}
	cantica = date.getText('cantica', ['tertia', 'sexta', 'nona'][hora]);
	if (cantica) {
		cantica[0] = cantica[0].replace(/^\*/, date.isSunday() ? 'ps-118-i' : canticum2[hora][0]);
		cantica[1] = cantica[1].replace(/^\*/, date.isSunday() ? 'ps-118-ii' : canticum2[hora][1]);
		cantica[2] = cantica[2].replace(/^\*/, date.isSunday() ? 'ps-118-iii' : canticum2[hora][2]);
		if (cantica[0].charAt(0) === '|') {
			cantica[0] = canticum[date.getDayInSequence()][0].replace(/\|.*$/, '') + cantica[0];
			cantica[1] = canticum[date.getDayInSequence()][1].replace(/\|.*$/, '') + cantica[1];
			cantica[2] = canticum[date.getDayInSequence()][2].replace(/\|.*$/, '') + cantica[2];
		}
		if (complementaris) {
			cantica[0] = canticum2[hora][0] + cantica[0].replace(/^[^|]+/, '');
			cantica[1] = canticum2[hora][1] + cantica[1].replace(/^[^|]+/, '');
			cantica[2] = canticum2[hora][2] + cantica[2].replace(/^[^|]+/, '');
		}
	}
	if (!cantica) {
		cantica = complementaris ?
			canticum2[hora] :
			canticum[date.getOrder() === 2 && date.isSunday() ? 0 : date.getDayInSequence()];
		switch (date.getPart()) {
		case 1:
			switch (date.getSubPart()) {
			case 0: case 1: case 2:
				antiphona = 'adventus';
				break;
			case 3: case 4:
				antiphona = 'nativitatis';
				/*if (!complementaris && Config.getConfig().get('bugCompat')) {
					cantica = canticum[(date.getDayInSequence() + 7) % 28];
				}*/
				break;
			case 5:
				antiphona = 'nativitatis-1';
				/*if (!complementaris && Config.getConfig().get('bugCompat')) {
					cantica = canticum[(date.getDayInSequence() + 7) % 28];
				}*/
				break;
			}
			antiphona = ['tertia', 'sexta', 'nona'][hora] + '-' + antiphona;
			break;
		case 2:
			antiphona = ['tertia', 'sexta', 'nona'][hora] + '-quadragesimae' + (date.getSubPart() >= 2 ? '-1' : '');
			break;
		case 3:
			if (date.getSubPart() === 0) {
				if (!complementaris) {
					cantica = canticumP[date.getDayInSequence()];
				}
				antiphona = ['tertia', 'sexta', 'nona'][hora] + '-paschale';
			} else {
				antiphona = 'alleluia';
			}
			break;
		}
		if (antiphona) {
			cantica[0] = cantica[0].replace(/\|.*$/, '') + '|!' + antiphona;
			cantica[1] = cantica[1].replace(/\|.*$/, '') + '|!' + antiphona;
			cantica[2] = cantica[2].replace(/\|.*$/, '') + '|!' + antiphona;
		}
	}
	if (config.get('varyTSNAntiphon')) {
		cantica = cantica.map(function (canticum, i) {
			return canticum.replace(['tertia', 'sexta', 'nona'][hora], ['tertia', 'sexta', 'nona'][i]);
		});
	}
	if (
		config.get('removeDuplicateAntiphon') &&
		cantica[0].replace(/^.*\|!/, '') === cantica[1].replace(/^.*\|!/, '') &&
		cantica[0].replace(/^.*\|!/, '') === cantica[2].replace(/^.*\|!/, '')
	) {
		cantica[0] = cantica[0].replace('|', '|<');
		cantica[1] = cantica[1].replace(/\|.*$/, '|!');
		cantica[2] = cantica[2].replace('|', '|>');
	}
	return cantica;
}

function getCanticaVespera (date) {
	var canticum = [
		['ps-110|v0', 'ps-114', 'apc-19|v0'],
		['ps-11', 'ps-15', 'eph-1|v0'],
		['ps-20', 'ps-21', 'apc-4-5|v0'],
		['ps-27-i', 'ps-27-ii', 'col-1|v0'],
		['ps-30', 'ps-32', 'apc-11-12|v0'],
		['ps-41', 'ps-46', 'apc-15|v0'],
		['ps-119-xiv', 'ps-16-vespera', 'phil-2|v0'],
		['ps-110|v1', 'ps-115', 'apc-19|v1'],
		['ps-45-i', 'ps-45-ii', 'eph-1|v1'],
		['ps-49-i', 'ps-49-ii', 'apc-4-5|v1'],
		['ps-62', 'ps-67-vespera', 'col-1|v1'],
		['ps-72-i', 'ps-72-ii', 'apc-11-12|v1'],
		['ps-116-i', 'ps-121', 'apc-15|v1'],
		['ps-113', 'ps-116-ii', 'phil-2|v1'],
		['ps-110|v2', 'ps-111', 'apc-19|v0'],
		['ps-123', 'ps-124', 'eph-1|v0'],
		['ps-125', 'ps-131', 'apc-4-5|v0'],
		['ps-126', 'ps-127', 'col-1|v0'],
		['ps-132-i', 'ps-132-ii', 'apc-11-12|v0'],
		['ps-135-i-vespera', 'ps-135-ii', 'apc-15|v0'],
		['ps-122', 'ps-130-vespera', 'phil-2|v0'],
		['ps-110|v3', 'ps-112', 'apc-19|v1'],
		['ps-136-i', 'ps-136-ii', 'eph-1|v1'],
		['ps-137', 'ps-138', 'apc-4-5|v1'],
		['ps-139-i', 'ps-139-ii', 'col-1|v1'],
		['ps-144-i-vespera', 'ps-144-ii', 'apc-11-12|v1'],
		['ps-145-i', 'ps-145-ii', 'apc-15|v1'],
		['ps-141', 'ps-142', 'phil-2|v1']
	], cantica;
	cantica = date.getText('cantica', 'vespera');
	if (!cantica) {
		cantica = canticum[date.getDayInSequence()];
		switch (date.getPart()) {
		case 1:
			switch (date.getSubPart()) {
			case 0:
				if (date.isSunday()) {
					cantica = cantica.map(function (s) {
						return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'a';
					});
				}
				break;
			case 1:
				if (date.isSunday()) {
					cantica = cantica.map(function (s) {
						return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'a';
					});
				} else {
					cantica = cantica.map(function (s, i) {
						return s.replace(/\|.*$/g, '') + '|!adventus-' + date.getDay() + '-' + (i + 1);
					});
				}
				break;
			case 2:
				cantica = cantica.map(function (s, i) {
					return s.replace(/\|.*$/g, '') + '|!adventus-24-' + (i + 1);
				});
				break;
			case 3:
				cantica = ['ps-110', 'ps-130-vespera', 'col-1'].map(function (s) {
					return s.replace(/\|.*$/g, '') + '|nativitatis';
				});
				break;
			case 4: case 5:
				/*if (Config.getConfig().get('bugCompat')) {
					cantica = canticum[date.getDayInSequence() + 7];
				}*/
				if (date.isSunday()) {
					cantica = cantica.map(function (s) {
						return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'n';
					});
				}
			}
			break;
		case 2:
			cantica[2] = cantica[2].replace('apc-19', '1-pt-2');
			if (date.isSunday() || date.getSubPart() >= 2) {
				cantica = cantica.map(function (s) {
					return s.replace(/\|.*$/g, '') + '|x' + date.getDayInSequence(-1) + 'q';
				});
			}
			break;
		case 3:
			if (date.getSubPart() === 0) {
				cantica = canticum[0].map(function (s) {
					return s.replace(/\|.*$/g, '') + '|paschale';
				});
			} else {
				cantica = cantica.map(function (s) {
					if (s.indexOf('|') === -1) {
						s += '|v';
					}
					return s + 'p';
				});
			}
			break;
		}
	}
	return cantica;
}

function getCanticaCompletorium (date, day, config) {
	var canticum = [
		['ps-91', ''],
		['ps-86-completorium', ''],
		['ps-143-completorium', ''],
		['ps-31-i', 'ps-130-completorium'],
		['ps-16-completorium', ''],
		['ps-88', ''],
		['ps-4', 'ps-134']
	][day];
	if (date.getPart() === 3) {
		if (config.get('removeDuplicateAntiphon') && canticum[1]) {
			canticum[0] += '|<!alleluia';
			canticum[1] += '|>!alleluia';
		} else {
			canticum[0] += '|!alleluia';
			canticum[1] += '|!alleluia';
		}
	}
	return canticum;
}

function getLectioResponsoriumLectionis (date, config) {
	var d, key, special, modus;
	modus = l10n.get('modus-lectionis');
	if (['1', '2'].indexOf(modus) === -1) {
		return ['modus-lectionis', '', '', '', '', ''];
	}
	switch (date.getPart()) {
	case 0: key = 'pa' + date.getDayInSequence(-1); break;
	case 1: key = date.getSubPart() === 0 ? 'a' + date.getDayInSequence(-1) : 'n' + date.getDayInChristmasSequence(); break;
	case 2: key = 'q' + date.getDayInSequence(-1); break;
	case 3:
		d = date.getDayInSequence(-1);
		if (config.get('ascensionSunday')) {
			if (d >= 39 && d <= 41) {
				d++;
			} else if (d === 42) {
				d = 39;
			}
		}
		key = 'p' + d;
	}
	if (modus === '2') {
		key += date.getYearLectio();
	}
	special = date.getText('lectio', 'lectionis');
	if (!special) {
		return [
			'lectio-lectionis-' + key + '-a',
			'responsorium-lectionis-' + key + '-a',
			'lectio-lectionis-' + key + '-b',
			'responsorium-lectionis-' + key + '-b',
			'', ''
		];
	}
	if (Array.isArray(special)) {
		if (special[1] === true) {
			l10n.setDynamicData('commemoratioLectio', 'lectio-lectionis-' + special[0]);
			return [
				'lectio-lectionis-' + key + '-a',
				'responsorium-lectionis-' + key + '-a',
				'lectio-lectionis-' + key + '-b',
				'responsorium-lectionis-' + key + '-b',
				'lectio-commemoratio',
				'responsorium-lectionis-' + special[0]
			];
		}
		return [
			'lectio-lectionis-' + special[0],
			'responsorium-lectionis-' + special[0],
			'lectio-lectionis-' + special[1],
			'responsorium-lectionis-' + special[1],
			'', '',
			(
				special[2] !== false &&
				['n1', 'n2', 'n3'].indexOf(key.replace(/i+$/, '')) === -1
			) ? 'lectio-lectionis-' + key + '-a' : ''
		];
	}
	return [
		'lectio-lectionis-' + key + '-a',
		'responsorium-lectionis-' + key + '-a',
		'lectio-lectionis-' + special,
		'responsorium-lectionis-' + special,
		'', ''
	];
}

function getLectioLaudes (date) {
	var lectioNormalMap = [
		'apc-7-10-12',
		'2-th-3-10-13',
		'rm-13-11-13',
		'tb-4-14-19',
		'is-66-1-2',
		'eph-4-29-32',
		'2-pt-1-10-11',
		'ez-36-25-27',
		'ier-15-16',
		'1-th-5-4-5',
		'rm-8-35-37',
		'rm-14-17-19',
		'eph-2-13-16',
		'rm-12-14-16',
		'ez-37-12-14',
		'iac-2-12-13',
		'1-io-4-14-15',
		'iob-1-21-2-10',
		'1-pt-4-10-11',
		'2-cor-12-9-10',
		'phil-2-14-15',
		'2-tim-2-8-13',
		'idt-8-25-27',
		'is-55-1',
		'dt-4-39-40',
		'rm-8-18-21',
		'gal-2-19-20',
		'2-pt-3-13-14'
	], lectioAdventMap = [
		'rm-13-11-12',
		'is-2-3',
		'gn-49-10',
		'is-7-14-15',
		'is-45-8',
		'ier-30-18-22',
		'is-11-1-3'
	], lectioChristmasMap = [
		['hbr-1-1-2', 'is-4-2-3'],
		['act-6-2-5', 'is-49-8-9'],
		['act-4-19-20', 'is-62-11-12'],
		['ier-31-15', 'is-45-22-23'],
		['hbr-1-1-2', 'sap-7-26-27'],
		['is-9-5', 'is-61-1-2'],
		['is-4-2-3', 'is-9-5']
	], lectioLentMap = [
		['2-esr-8-9-10', 'lv-23-4-7'],
		['ex-19-4-6', 'ier-11-19-20'],
		['ioel-2-12-13', 'za-12-10-11'],
		['dt-7-6-9', 'is-50-5-7'],
		['3-rg-8-51-53', 'hbr-2-9-10'],
		['is-53-11-12', 'is-52-13-15'],
		['is-1-16-18', 'is-65-1-3']
	], lectioEasterMap = [
		'act-10-40-43',
		'rm-10-8-10',
		'act-13-30-33',
		'rm-6-8-11',
		'rm-8-10-11',
		'act-5-30-32',
		'rm-14-7-9'
	], lectio, subpart;
	lectio = date.getText('lectio', 'laudes');

	if (!lectio) {
		switch (date.getPart()) {
		case 0: lectio = lectioNormalMap[date.getDayInSequence()]; break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: lectio = lectioAdventMap[date.getDay()]; break;
			case 1: case 2: lectio = lectioAdventMap[date.getDayInChristmasSequence(7)]; break;
			case 3: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][0]; break;
			case 4: case 5: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][1];
			}
			break;
		case 2: lectio = lectioLentMap[date.getDay()][date.getSubPart() === 0 ? 0 : 1]; break;
		case 3: lectio = lectioEasterMap[date.getDay()];
		}
	}
	return lectio;
}

function getLectioTertia (date) {
	var lectioNormalMap = [
		'1-io-4-16',
		'rm-13-8-10',
		'ier-17-7-8',
		'1-pt-1-13-14',
		'am-4-13',
		'phil-2-2-4',
		'3-rg-8-60-61',
		'rm-5-1-2-5',
		'ier-31-33',
		'1-cor-12-4-6',
		'dt-1-16-17',
		'gal-5-13-14',
		'dt-1-31',
		'dt-8-5-6',
		'rm-8-15-16',
		'2-cor-13-11',
		'ier-22-3',
		'1-cor-13-4-7',
		'sap-19-22',
		'rm-1-16b-17',
		'1-sm-15-22',
		'1-cor-6-19-20',
		'lv-20-26',
		'1-io-3-17-18',
		'1-cor-10-24-31',
		'1-io-3-23-24',
		'rm-12-17-19-21',
		'dn-6-27-28'
	], lectioAdventMap = [
		'rm-13-13-14',
		'is-10-20-21',
		'ier-23-5',
		'is-2-11',
		'mi-5-3-4',
		'ier-29-11-13',
		'is-4-2'
	], lectioChristmasMap = [
		['tit-2-11-12', 'is-45-13'],
		['1-pt-5-10-11', '1-tim-1-15'],
		['2-cor-5-19-20', 'is-2-3-4'],
		['lam-1-16', 'ier-31-7-8'],
		['tit-2-11-12', 'ez-20-41-42'],
		['dt-4-7', 'is-11-1-3'], //TODO leerer Eintrag für 6./13. Jan.?
		['is-45-13', 'dt-4-7']
	], lectioLentMap = [
		['1-th-4-1-7', '2-cor-4-10-11'],
		['sap-11-23-24', 'ez-33-10-11'],
		['ioel-2-17', '1-cor-1-18-19'],
		['ez-18-30-32', '1-tim-2-4-6'],
		['is-55-6-7', 'hbr-4-14-15'],
		['is-55-3', 'is-53-2-3'],
		['apc-3-19-20', '1-io-1-8-9']
	], lectioEasterMap = [
		'1-cor-15-3-5',
		'apc-1-17-18',
		'act-4-11-12',
		'rm-4-24-25',
		'1-cor-12-13',
		'act-2-32-36',
		'rm-5-10-11'
	], lectio, subpart;
	lectio = date.getText('lectio', 'tertia');

	if (!lectio) {
		switch (date.getPart()) {
		case 0: lectio = lectioNormalMap[date.getDayInSequence()]; break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: lectio = lectioAdventMap[date.getDay()]; break;
			case 1: case 2: lectio = lectioAdventMap[date.getDayInChristmasSequence(7)]; break;
			case 3: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][0]; break;
			case 4: case 5: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][1];
			}
			break;
		case 2: lectio = lectioLentMap[date.getDay()][date.getSubPart() === 0 ? 0 : 1]; break;
		case 3: lectio = lectioEasterMap[date.getDay()];
		}
	}
	return lectio;
}

function getLectioSexta (date) {
	var lectioNormalMap = [
		'gal-6-7b-8',
		'iac-1-19-20-26',
		'prv-3-13-15',
		'1-pt-1-15-16',
		'am-5-8',
		'2-cor-13-4',
		'ier-17-9-10',
		'rm-8-26',
		'ier-32-40',
		'1-cor-12-12-13',
		'is-55-8-9',
		'gal-5-16-17',
		'bar-4-28-29',
		'3-rg-2-2-3',
		'rm-8-22-23',
		'rm-6-22',
		'dt-15-7-8',
		'1-cor-13-8-9-13',
		'dt-4-7',
		'rm-3-21-22',
		'gal-5-26-6-2',
		'dt-10-12',
		'sap-15-1-3',
		'dt-30-11-14',
		'col-3-17',
		'sap-1-1-2',
		'1-io-3-16',
		'rm-15-5-7'
	], lectioAdventMap = [
		'1-th-3-12-13',
		'is-10-24-27',
		'ier-23-6',
		'is-12-2',
		'agg-2-6-9',
		'ier-30-18',
		'is-4-3'
	], lectioChristmasMap = [
		['1-io-4-9', 'is-48-20'],
		['iac-1-12', 'apc-21-23-24'],
		['act-5-12-14', 'is-9-1'],
		['lam-2-11', 'ier-31-11-12'],
		['1-io-4-9', 'ez-34-11-12'],
		['is-12-5-6', 'is-42-1'],
		['is-48-20', 'is-12-5-6']
	], lectioLentMap = [
		['is-30-15-18', '1-pt-4-13-14'], //TODO 1-pt-4-13-14 Variante?
		['ez-18-23', 'ier-18-20'],
		['ier-3-25', '1-cor-1-22-24'],
		['za-1-3-4', 'rm-15-3'],
		['dt-30-2-3', 'hbr-7-26-27'],
		['ier-3-12-14', 'is-53-4-5'],
		['is-44-21-22', '1-io-2-1-2']
	], lectioEasterMap = [
		'eph-2-4-6',
		'col-2-9-10-12',
		'1-pt-3-21-22',
		'1-io-5-5-6',
		'tit-3-5-7',
		'gal-3-27-28',
		'1-cor-15-20-22'
	], lectio, subpart;
	lectio = date.getText('lectio', 'sexta');

	if (!lectio) {
		switch (date.getPart()) {
		case 0: lectio = lectioNormalMap[date.getDayInSequence()]; break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: lectio = lectioAdventMap[date.getDay()]; break;
			case 1: case 2: lectio = lectioAdventMap[date.getDayInChristmasSequence(7)]; break;
			case 3: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][0]; break;
			case 4: case 5: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][1];
			}
			break;
		case 2: lectio = lectioLentMap[date.getDay()][date.getSubPart() === 0 ? 0 : 1]; break;
		case 3: lectio = lectioEasterMap[date.getDay()];
		}
	}
	return lectio;
}

function getLectioNona (date) {
	var lectioNormalMap = [
		'gal-6-9-10',
		'1-pt-1-17-19',
		'iob-5-17-18',
		'iac-4-7-8-10',
		'am-9-6',
		'col-3-12-13',
		'sap-7-27-8-1',
		'2-cor-1-21-22',
		'ez-34-31',
		'1-cor-12-24-26',
		'1-sm-16-7',
		'gal-5-22-23-25',
		'sap-1-13-15',
		'ier-6-16',
		'2-tim-1-9',
		'col-1-21-22',
		'prv-22-22-23',
		'col-3-14-15',
		'est-10-3',
		'eph-2-8-9',
		'mi-6-8',
		'ct-8-6-7',
		'bar-4-21-22',
		'is-55-10-11',
		'col-3-23-24',
		'hbr-12-1-2',
		'1-io-4-9-11',
		'phil-4-8-9'
	], lectioAdventMap = [
		'2-th-1-6-7-10',
		'is-13-22-14-1',
		'ez-34-15-16',
		'dn-9-19',
		'mal-3-20',
		'bar-3-5-6',
		'is-61-11'
	], lectioChristmasMap = [
		['act-10-36', 'is-65-1'],
		['sap-3-1-3', '1-io-1-5'],
		['act-5-41-42', 'is-60-4-5'],
		['ier-31-16-17', 'za-8-7-8'],
		['act-10-36', 'mi-2-12'],
		['tb-14-6-7', 'is-49-6'],
		['is-65-1', 'tb-14-6-7']
	], lectioLentMap = [
		['dt-4-29-31', '1-pt-5-10-11'],
		['is-58-6-7', 'ier-31-2-3-4'],
		['is-58-1-2', '1-cor-1-25-27'],
		['dn-4-24', 'hbr-9-28'],
		['hbr-10-35-36', 'hbr-9-11-12'],
		['iac-1-27', 'is-53-6-7'],
		['gal-6-7-8', '1-io-2-8-10']
	], lectioEasterMap = [
		'rm-6-4',
		'2-tim-2-8-11',
		'col-3-1-2',
		'eph-4-23-24',
		'col-1-12-14',
		'1-cor-5-7-8',
		'2-cor-5-14-15'
	], lectio, subpart;
	lectio = date.getText('lectio', 'nona');

	if (!lectio) {
		switch (date.getPart()) {
		case 0: lectio = lectioNormalMap[date.getDayInSequence()]; break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: lectio = lectioAdventMap[date.getDay()]; break;
			case 1: case 2: lectio = lectioAdventMap[date.getDayInChristmasSequence(7)]; break;
			case 3: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][0]; break;
			case 4: case 5: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][1];
			}
			break;
		case 2: lectio = lectioLentMap[date.getDay()][date.getSubPart() === 0 ? 0 : 1]; break;
		case 3: lectio = lectioEasterMap[date.getDay()];
		}
	}
	return lectio;
}

function getLectioVespera (date) {
	var lectioNormalMap = [
		'2-cor-1-3-4',
		'col-1-9-11',
		'1-io-3-1-2',
		'iac-1-22-25',
		'1-pt-1-6-9',
		'rm-15-1-3',
		'col-1-2-6',
		'2-th-2-13-14',
		'1-th-2-13',
		'rm-3-23-25',
		'1-pt-5-5-7',
		'1-pt-1-22-23',
		'1-cor-2-7-10',
		'hbr-13-20-21',
		'1-pt-1-3-5',
		'iac-4-11-12',
		'rm-12-9-12',
		'eph-3-20-21',
		'1-pt-3-8-9',
		'iac-1-2-4',
		'2-pt-1-19-21',
		'hbr-12-22-24',
		'1-th-3-12-13',
		'col-3-16',
		'1-io-2-3-6',
		'col-1-23',
		'rm-8-1-2',
		'rm-11-33-36'
	], lectioAdventMap = [
		'phil-4-4-5',
		'phil-3-21',
		'1-cor-1-7-9',
		'1-cor-4-5',
		'iac-5-7-9',
		'2-pt-3-8-9',
		'1-th-5-23-24'
	], lectioChristmasMap = [
		['1-io-1-1-3', 'eph-2-3-5'],
		['1-io-1-5-7', 'col-1-13-15'],
		['rm-8-3-4', '1-io-1-5-7'],
		['eph-2-3-5', 'rm-8-3-4'],
		['1-io-1-1-3', '1-io-5-20'],
		['2-pt-1-3-4', 'act-10-37-38'],
		['', '2-pt-1-3-4'] //leerer Eintrag wegen Vorabend Hochfest Maria
	], lectioLentMap = [
		['1-cor-9-24-25', 'act-13-26-30'],
		['rm-12-1-2', 'rm-5-8-9'],
		['iac-2-14-18', '1-cor-1-27-30'],
		['phil-2-12-15', 'eph-4-32-5-2'],
		['iac-4-7-10', 'hbr-13-12-15'],
		['iac-5-16-20', '1-pt-2-21-24'],
		['2-cor-6-1-4', '1-pt-1-18-21']
	], lectioEasterMap = [ //leere Einträge wegen Pfingsten (einschließlich Vorabend)
		['hbr-10-12-14', ''],
		['hbr-8-1-3', 'rm-8-14-17'],
		['1-pt-2-4-5', 'rm-8-26-27'],
		['hbr-7-24-27', '1-cor-2-9-10'],
		['1-pt-3-18-22', '1-cor-6-19-20'],
		['hbr-5-8-10', 'gal-5-16-25'],
		['1-pt-2-9-10', '']
	], lectio, subpart;
	lectio = date.getText('lectio', 'vespera');
	if (!lectio) {
		switch (date.getPart()) {
		case 0: lectio = lectioNormalMap[date.getDayInSequence()]; break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: lectio = lectioAdventMap[date.getDay()]; break;
			case 1: case 2: lectio = lectioAdventMap[date.getDayInChristmasSequence(7)]; break;
			case 3: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][0]; break;
			case 4: case 5: lectio = lectioChristmasMap[date.getDayInChristmasSequence(7)][1];
			}
			break;
		case 2: lectio = lectioLentMap[date.getDay()][date.getSubPart() === 0 ? 0 : 1]; break;
		case 3: lectio = lectioEasterMap[date.getDay()][date.getSubPart() < 3 ? 0 : 1];
		}
	}
	return lectio;
}

function getVersusLectionis (date, config) {
	var versus = date.getText('versus', 'lectionis'), d;
	if (!versus) {
		switch (date.getPart()) {
		case 0: versus = 'lectionis-' + date.getDayInSequence(); break;
		case 1:
			switch (date.getSubPart()) {
			case 0:
				versus = 'lectionis-adventus-' + date.getDay();
				break;
			case 1:
			case 2:
				versus = 'lectionis-adventus-' + ((date.getDayInChristmasSequence() + 14) % 7);
				break;
			default:
				versus = 'lectionis-nativitatis-' + date.getDayInChristmasSequence();
			}
			break;
		case 2:
			versus = date.getSubPart() >= 2 ?
				'lectionis-quadragesimae-hebdomada-sancta' :
				('lectionis-quadragesimae-' + date.getDayInSequence(7) +
					(date.isSunday() ? '-' + date.getDayInSequence(-1) / 7 : ''));
			break;
		case 3:
			d = date.getDayInSequence(-1);
			if (d <= 7) {
				versus = 'lectionis-paschale-' + ['', '7', '3', '4', '5', '6', '3', '7'][d];
			} else {
				if (config.get('ascensionSunday') && [39, 40, 41].indexOf(d) > -1) {
					d = (d + 1) % 7;
				} else {
					d = date.getDayInSequence(7);
				}
				versus = 'lectionis-paschale-' + d;
			}
		}
	}
	return 'versus-' + versus;
}

function getResponsoriumLaudes (date) {
	var resp = date.getText('responsorium', 'laudes');
	if (!resp) {
		switch (date.getPart()) {
		case 0: resp = 'laudes-' + date.getDayInSequence(14); break;
		case 1:
			if (date.getSubPart() < 2) {
				resp = 'laudes-adventus';
				if (date.isSunday()) {
					resp += '-1';
				}
			} else if (date.getSubPart() === 2) {
				resp = 'laudes-adventus-2';
			} else if (date.getSubPart() < 5) {
				resp = 'laudes-nativitatis';
			} else {
				resp = 'laudes-nativitatis-1';
			}
			break;
		case 2:
			resp = 'laudes-quadragesimae';
			if (date.getSubPart() === 3 && date.getDayInSequence(-1) !== 39) {
				resp = 'substitutum-' + (date.getDayInSequence(-1) - 39);
			} else if (date.getSubPart() === 2 || date.getDayInSequence(-1) === 39) {
				resp += '-2';
			} else if (date.isSunday()) {
				resp += '-1';
			}
			break;
		case 3:
			if (date.getSubPart() === 0) {
				resp = 'substitutum-3';
			} else {
				resp = 'laudes-paschale' + (date.isSunday() ? '-0' : '-1');
			}
		}
	}
	return 'responsorium-' + resp;
}

function getVersusTertiaSextaNona (date, type) {
	var resp = date.getText('versus', ['tertia', 'sexta', 'nona'][type]);
	if (resp) {
		return 'versus-' + resp;
	}
	switch (date.getPart()) {
	case 0: return 'versus-' + ['tertia', 'sexta', 'nona'][type] + '-' + date.getDayInSequence();
	case 1: return 'versus-' + ['tertia', 'sexta', 'nona'][type] +
		(date.getSubPart() < 3 ? '-adventus' : '-nativitatis' + (date.getSubPart() === 5 ? '-1' : ''));
	case 2: return 'versus-' + ['tertia', 'sexta', 'nona'][type] + '-quadragesimae' + (date.getSubPart() >= 2 ? '-1' : '');
	case 3: return 'versus' + (date.getDayInSequence(-1) > 7 ? '-' + ['tertia', 'sexta', 'nona'][type] : '') +
		'-paschale';
	}
}

function getResponsoriumVespera (date) {
	var resp = date.getText('responsorium', 'vespera');
	if (!resp) {
		switch (date.getPart()) {
		case 0: resp = 'vespera-' + date.getDayInSequence(14); break;
		case 1:
			if (date.getSubPart() < 2) {
				resp = 'vespera-adventus';
				if (
					date.isSunday() ||
					[-8, -7].indexOf(date.getDayInChristmasSequence()) > -1
				) {
					resp += '-1';
				}
			} else if (date.getSubPart() < 5) {
				resp = 'vespera-nativitatis';
			} else {
				resp = 'vespera-nativitatis-1';
			}
			break;
		case 2:
			resp = 'vespera-quadragesimae';
			if (date.getSubPart() === 3) {
				resp = 'substitutum-' + (date.getDayInSequence(-1) - 39);
			} else if (date.getSubPart() === 2) {
				resp += '-2';
			} else if (date.isSunday()) {
				resp += '-1';
			}
			break;
		case 3:
			if (date.getSubPart() === 0) {
				resp = 'substitutum-3';
			} else if (date.getSubPart() === 1) {
				resp = 'vespera-paschale';
				if (date.getDayInSequence(-1) % 7 === 0) {
					//deutsches Stundenbuch teilweise abweichend,
					//aber das halte ich für Fehler in der Übersetzung
					resp += '-1';
				}
			} else {
				resp = 'vespera-paschale-2';
			}
		}
	}
	return 'responsorium-' + resp;
}

function getInvitatoriumAntiphona (date) {
	var antiphona = date.getText('antiphona', 'invitatorium');
	if (antiphona) {
		return '!invitatorium-' + antiphona;
	}
	switch (date.getPart()) {
	case 0: return '!invitatorium-' + date.getDayInSequence(14);
	case 1: return '!invitatorium-' + ['adventus', 'adventus-1',
		'adventus-2', 'nativitatis', 'nativitatis', 'nativitatis-1'][date.getSubPart()];
	case 2: return '!invitatorium-quadragesimae';
	case 3: return date.getSubPart() <= 1 ? '!invitatorium-paschale' : '!invitatorium-paschale-1';
	}
}

function getBenedictusAntiphona (date) {
	var benedictus = date.getText('antiphona', 'laudes');
	if (benedictus) {
		return benedictus;
	}
	switch (date.getPart()) {
	case 0: return date.getSunday() || String(date.getDayInSequence(14));
	case 1:
		switch (date.getSubPart()) {
		case 0: return date.getDayInSequence(-1) + (date.isSunday() ? date.getYearLetter() : '') + '-adventus';
		case 1: case 2:
			if (
				date.isSunday() &&
				[-4, -2, -1].indexOf(date.getDayInChristmasSequence() === -1) &&
				l10n.has('antiphona-benedictus-21a-adventus')
			) {
				return '21' + date.getYearLetter() + '-adventus';
			}
			return (-date.getDayInChristmasSequence()) + '-adventus-1';
		case 3: case 4: case 5: return date.getDayInChristmasSequence() + '-nativitatis';
		}
		break; //to make jshint happy
	case 2: return date.getDayInSequence(-1) + (date.isSunday() ? date.getYearLetter() : '') + '-quadragesimae';
	case 3: return date.getDayInSequence(-1) +
		(date.getDayInSequence(-1) > 7 && date.isSunday() ? date.getYearLetter() : '') + '-paschale';
	}
}

function getMagnificatAntiphona (date) {
	var magnificat = date.getText('antiphona', 'vespera');
	if (magnificat) {
		return magnificat;
	}
	switch (date.getPart()) {
	case 0: return date.getSunday(true) || String(date.getDayInSequence(14));
	case 1:
		switch (date.getSubPart()) {
		case 0: return date.getDayInSequence(-1) + (date.isSunday() ? date.getYearLetter() : '') + '-adventus';
		case 1: case 2: return (-date.getDayInChristmasSequence()) + '-adventus-1';
		case 3: case 4: case 5: return date.getDayInChristmasSequence() + '-nativitatis';
		}
		break; //to make jshint happy
	case 2: return date.getDayInSequence(-1) + (date.isSunday() ? date.getYearLetter() : '') + '-quadragesimae';
	case 3: return date.getDayInSequence(-1) +
		(date.getDayInSequence(-1) > 7 && date.isSunday() ? date.getYearLetter() : '') + '-paschale';
	}
}

function getPrecesLaudes (date) {
	var preces = date.getText('preces', 'laudes'), subpart, n;
	if (!preces) {
		switch (date.getPart()) {
		case 0: preces = 'laudes-' + date.getDayInSequence(); break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: preces = 'laudes-' + date.getDayInSequence(14) + '-adventus'; break;
			case 1: case 2:
				n = date.getDayInChristmasSequence() + 14;
				if (n === 11) {
					n = 12;
				} else if (n === 12) {
					n = 11;
				}
				preces = 'laudes-' + n + '-adventus';
				break;
			case 3: case 4: case 5: preces = 'laudes-' + date.getDayInChristmasSequence() + '-nativitatis'; break;
			}
			break;
		case 2: preces = 'laudes-' + (date.getSubPart() >= 2 ? 12 : date.getDayInSequence(14)) +
			'-quadragesimae'; break;
		case 3: preces = 'laudes-' + date.getDayInSequence(14) + '-paschale' + (date.getSubPart() <= 1 ? '' : '-1');
		}
	}
	return 'preces-' + preces;
}

function getPrecesVespera (date) {
	var preces = date.getText('preces', 'vespera'), subpart;
	if (!preces) {
		switch (date.getPart()) {
		case 0: preces = 'vespera-' + date.getDayInSequence(); break;
		case 1:
			subpart = date.getSubPart();
			if (subpart === 1 && date.isSunday()) {
				subpart = 0;
			}
			switch (subpart) {
			case 0: preces = 'vespera-' + date.getDayInSequence(14) + '-adventus'; break;
			case 1: case 2: preces = 'vespera-' + (date.getDayInChristmasSequence(7) + 7) + '-adventus'; break;
			case 3: case 4: case 5: preces = 'vespera-' + date.getDayInChristmasSequence() + '-nativitatis'; break;
			}
			break;
		case 2: preces = 'vespera-' + (date.getSubPart() >= 2 ? 12 : date.getDayInSequence(14)) +
			'-quadragesimae'; break;
		case 3: preces = 'vespera-' + date.getDayInSequence(14) + '-paschale' + (date.getSubPart() <= 1 ? '' : '-1');
		}
	}
	return 'preces-' + preces;
}

function getOratioLectionis (date, config) {
	var oratio = date.getText('oratio', 'lectionis');
	if (!oratio && date.isSunday()) {
		oratio = date.getSunday().replace(/^[abc](\d+)(-[aqp])?$/, 'dominica-$1$2');
	}
	if (!oratio) {
		switch (date.getPart()) {
		case 0: oratio = 'dominica-' + Math.floor(date.getDayInSequence(-1) / 7); break;
		case 1:
			switch (date.getSubPart()) {
			case 0: oratio = date.getDayInSequence(-1) + '-adventus'; break;
			case 1: case 2: oratio = (-date.getDayInChristmasSequence()) + '-adventus-1'; break;
			case 3: case 4: case 5: oratio = date.getDayInChristmasSequence() + '-nativitatis';
			}
			break;
		case 2: oratio = date.getDayInSequence(-1) + '-quadragesimae'; break;
		case 3:
			oratio = date.getDayInSequence(-1) + '-paschale' +
				(config.get('ascensionSunday') && [40, 41].indexOf(date.getDayInSequence(-1)) > -1 ? '-asc' : '');
		}
	}
	return 'oratio-' + oratio;
}

function getOratioLaudes (date, config) {
	var oratio = date.getText('oratio', 'laudes'), commemoratio;
	if (Array.isArray(oratio)) {
		commemoratio = oratio;
		oratio = false;
	}
	if (!oratio && date.isSunday()) {
		oratio = date.getSunday().replace(/^[abc](\d+)(-[aqp])?$/, 'dominica-$1$2');
	}
	if (!oratio) {
		switch (date.getPart()) {
		case 0: oratio = 'laudes-' + date.getDayInSequence(); break;
		case 1:
			switch (date.getSubPart()) {
			case 0: oratio = date.getDayInSequence(-1) + '-adventus'; break;
			case 1: case 2: oratio = (-date.getDayInChristmasSequence()) + '-adventus-1'; break;
			case 3: case 4: case 5: oratio = date.getDayInChristmasSequence() + '-nativitatis';
			}
			break;
		case 2: oratio = date.getDayInSequence(-1) + '-quadragesimae'; break;
		case 3:
			oratio = date.getDayInSequence(-1) + '-paschale' +
				(config.get('ascensionSunday') && [40, 41].indexOf(date.getDayInSequence(-1)) > -1 ? '-asc' : '');
		}
	}
	if (commemoratio) {
		l10n.setDynamicData('commemoratioOratio1', 'oratio-' + oratio);
		l10n.setDynamicData('commemoratioAntiphona', commemoratio[0]);
		l10n.setDynamicData('commemoratioOratio2', 'oratio-' + commemoratio[1]);
		oratio = 'commemoratio';
	}
	return 'oratio-' + oratio;
}

function getOratioTertiaSextaNona (date, type, config) {
	var oratio = date.getText('oratio', ['tertia', 'sexta', 'nona'][type]);
	if (!oratio && date.isSunday()) {
		oratio = date.getSunday().replace(/^[abc](\d+)(-[aqp])?$/, 'dominica-$1$2');
	}
	if (!oratio) {
		switch (date.getPart()) {
		case 0: oratio = ['tertia', 'sexta', 'nona'][type] + '-' + date.getDayInSequence(7); break;
		case 1:
			switch (date.getSubPart()) {
			case 0: oratio = date.getDayInSequence(-1) + '-adventus'; break;
			case 1: case 2: oratio = (-date.getDayInChristmasSequence()) + '-adventus-1'; break;
			case 3: case 4: case 5: oratio = date.getDayInChristmasSequence() + '-nativitatis';
			}
			break;
		case 2: oratio = date.getDayInSequence(-1) + '-quadragesimae'; break;
		case 3:
			oratio = date.getDayInSequence(-1) + '-paschale' +
				(config.get('ascensionSunday') && [40, 41].indexOf(date.getDayInSequence(-1)) > -1 ? '-asc' : '');
		}
	}
	return 'oratio-' + oratio;
}

function getOratioVespera (date, config) {
	var oratio = date.getText('oratio', 'vespera'), commemoratio;
	if (Array.isArray(oratio)) {
		commemoratio = oratio;
		oratio = false;
	}
	if (!oratio && date.isSunday()) {
		oratio = date.getSunday().replace(/^[abc](\d+)(-[aqp])?$/, 'dominica-$1$2');
	}
	if (!oratio) {
		switch (date.getPart()) {
		case 0: oratio = 'vespera-' + date.getDayInSequence(); break;
		case 1:
			switch (date.getSubPart()) {
			case 0: oratio = date.getDayInSequence(-1) + '-adventus'; break;
			case 1: case 2: oratio = (-date.getDayInChristmasSequence()) + '-adventus-1'; break;
			case 3: case 4: case 5: oratio = date.getDayInChristmasSequence() + '-nativitatis';
			}
			break;
		case 2: oratio = date.getDayInSequence(-1) + '-quadragesimae'; break;
		case 3:
			oratio = date.getDayInSequence(-1) + '-paschale' +
				(config.get('ascensionSunday') && [40, 41].indexOf(date.getDayInSequence(-1)) > -1 ? '-asc' : '');
		}
	}
	if (commemoratio) {
		l10n.setDynamicData('commemoratioOratio1', 'oratio-' + oratio);
		l10n.setDynamicData('commemoratioAntiphona', commemoratio[0]);
		l10n.setDynamicData('commemoratioOratio2', 'oratio-' + commemoratio[1]);
		oratio = 'commemoratio';
	}
	return 'oratio-' + oratio;
}

function getMaria (date, config) {
	var maria = date.getText('maria'), d;
	if (maria) {
		return maria;
	}
	if (date.getPart() === 3) {
		return 'regina-caeli';
	}
	switch (Number(config.get('modusMaria'))) {
	case 1: //Wochentag
		d = date.getDayInSequence(7);
		if (d > 0) {
			return ['', 'alma-redemptoris-mater', 'ave-maria', 'salve-regina',
				'sub-tuum-praesidium', 'ave-regina-caelorum', 'salve-regina'][d];
		}
		/*falls through*/
	case 2: //nach Zeit
		return ['salve-regina', 'alma-redemptoris-mater', 'ave-regina-caelorum'][date.getPart()];
	case 3: //Woche
		d = date.getDayInSequence(35);
		return ['ave-regina-caelorum', 'ave-maria', 'salve-regina',
			'sub-tuum-praesidium', 'alma-redemptoris-mater'][Math.floor(d / 7)];
	default: //traditionell
		if (date.getPart() === 1 || date.getMonth() === 0 || (date.getMonth() === 1 && date.getDate() < 3)) {
			return 'alma-redemptoris-mater';
		}
		if (date.getMonth() < 4) {
			return 'ave-regina-caelorum';
		}
		return 'salve-regina';
	}
}

function getInvitatorium (date, config) {
	var link = config.get('invitatoriumLocus');
	if (link === 'lectionis' && date.getPart() === 3 && date.getDayInSequence(-1) === 0) {
		link = false;
	}
	return [
		{type: 'title', title: 'invitatorium', date: date},
		'incipit-invitatorium',
		['ps-95', getInvitatoriumAntiphona(date)],
		link ? {type: 'link', href: getHora.makeLink(date, link), label: link} : ''
	];
}

function getLectionisEaster (date) {
	return [
		{type: 'title', title: 'lectionis', date: date},
		'omitte-4',
		'lectio-lectionis-p0-a',
		['ex-15-lectionis'],
		'oratio-lectionis-p0-a',
		'lectio-lectionis-p0-b',
		['ps-42-43-lectionis'],
		'oratio-lectionis-p0-b',
		'lectio-lectionis-p0-c',
		['ps-118-lectionis'],
		'lectio-lectionis-p0-d',
		'te-deum',
		'oratio-dominica-0-p',
		'conclusio'
	];
}

function getLectionis (date, config) {
	if (date.getPart() === 3 && date.getDayInSequence(-1) === 0) {
		return getLectionisEaster(date);
	}
	var cantica = getCanticaLectionis(date),
		lectioResponsorium = getLectioResponsoriumLectionis(date, config);
	return [
		{type: 'title', title: 'lectionis', date: date},
		config.get('invitatoriumLocus') === 'lectionis' ?
			{type: 'link', href: getHora.makeLink(date, 'invitatorium'), label: 'invitatorium'} :
			'incipit' + (date.getPart() === 2 ? '-quadragesimae' : ''),
		getHymnusLectionis(date, config),
		cantica[0].split('|'),
		cantica[1].split('|'),
		cantica[2].split('|'),
		getVersusLectionis(date, config),
		lectioResponsorium[0],
		lectioResponsorium[1],
		lectioResponsorium[2],
		lectioResponsorium[3],
		lectioResponsorium[4],
		lectioResponsorium[5],
		date.hasTeDeum() ? 'te-deum' : '',
		getOratioLectionis(date, config),
		'conclusio',
		lectioResponsorium[6] ? 'lectio-continua' : '',
		lectioResponsorium[6]
	];
}

function getLaudes (date, config) {
	var cantica = getCanticaLaudes(date);
	return [
		{type: 'title', title: 'laudes', date: date},
		config.get('invitatoriumLocus') === 'laudes' ?
			{type: 'link', href: getHora.makeLink(date, 'invitatorium'), label: 'invitatorium'} :
			'incipit' + (date.getPart() === 2 ? '-quadragesimae' : ''),
		getHymnusLaudes(date, config),
		cantica[0].split('|'),
		cantica[1].split('|'),
		cantica[2].split('|'),
		getLectioLaudes(date),
		getResponsoriumLaudes(date),
		['benedictus', getBenedictusAntiphona(date)],
		getPrecesLaudes(date),
		Number(config.get('paterNosterIntro')) ? 'pater-noster-intro-' + config.get('paterNosterIntro') : '',
		'pater-noster',
		getOratioLaudes(date, config),
		config.get('priest') ?
			('benedictio-sacerdos' +
				((date.getPart() === 3 &&
				(date.getSubPart() === 0 || date.getDayInSequence(-1) === 49)) ? '-paschale' : '')) :
			'benedictio'
	];
}

function getTertiaSextaNona (date, hora, complementaris, config) {
	var cantica = getCanticaTertiaSextaNona(date, hora, complementaris, config),
		types = ['tertia', 'sexta', 'nona'];
	return [
		{type: 'title', title: types[hora], date: date},
		complementaris ?
			'complementaris' :
			{type: 'link', href: getHora.makeLink(date, types[hora] + '-complementaris'), label: 'complementaris-1'},
		'incipit' + (date.getPart() === 2 ? '-quadragesimae' : ''),
		getHymnusTertiaSextaNona(date, hora, complementaris),
		cantica[0].split('|'),
		cantica[1].split('|'),
		cantica[2].split('|'),
		hora === 0 ? getLectioTertia(date) : '',
		hora === 1 ? getLectioSexta(date) : '',
		hora === 2 ? getLectioNona(date) : '',
		getVersusTertiaSextaNona(date, hora),
		getOratioTertiaSextaNona(date, hora, config),
		'conclusio'
	];
}

function getVespera (date, config) {
	var cantica, skip;
	date = date.getEve();
	cantica = getCanticaVespera(date);
	if (date.getPart() === 2) {
		skip = date.getDayInSequence(-1) - 37;
		if (skip !== 2 && skip !== 3) {
			skip = false;
		}
	}
	return [
		{type: 'title', title: 'vespera', date: date, eve: true},
		skip ? 'omitte-' + skip : '',
		'incipit' + (date.getPart() === 2 ? '-quadragesimae' : ''),
		getHymnusVespera(date, config),
		cantica[0].split('|'),
		cantica[1].split('|'),
		cantica[2].split('|'),
		getLectioVespera(date),
		getResponsoriumVespera(date),
		['magnificat', getMagnificatAntiphona(date)],
		getPrecesVespera(date),
		Number(config.get('paterNosterIntro')) ? 'pater-noster-intro-' + config.get('paterNosterIntro') : '',
		'pater-noster',
		getOratioVespera(date, config),
		config.get('priest') ?
			('benedictio-sacerdos' +
				((date.getPart() === 3 &&
				(date.getSubPart() === 0 || date.getDayInSequence(-1) >= 48)) ? '-paschale' : '')) :
			'benedictio',
		config.get('marianAntiphon') === 'vespera' ? getMaria(date, config) : ''
	];
}

function getCompletorium (date, config) {
	var cantica,
		lectio = [
		'apc-22-4-5',
		'1-th-5-9-10',
		'1-pt-5-8-9',
		'eph-4-26-27',
		'1-th-5-23',
		'ier-14-9',
		'dt-6-4-7'
	], day, skip = false, resp = 'completorium', special, oratio;
	date = date.getEve();
	day = date.getDay();
	special = date.hasSpecialCompletorium();

	switch (date.getPart()) {
	case 1:
		if (date.getDayInChristmasSequence() === -1) {
			skip = 1;
		}
		if (date.getSubPart() === 3) {
			special = true;
		}
		break;
	case 2:
		if (date.getDayInSequence(-1) === 41) {
			skip = 4;
		}
		if (date.getSubPart() === 3) {
			resp = 'substitutum-' + (date.getDayInSequence(-1) - 39);
		}
		break;
	case 3:
		if (date.getSubPart() === 0) {
			resp = 'substitutum-3';
			special = true;
		}
	}

	if (special/* && !config.get('bugCompat')*/) {
		day = date.isEve() ? 6 : 0;
		if (!config.get('bugCompat')) {
			oratio = date.isSunday() ? day : 7;
		} else {
			oratio = day;
		}
	} else {
		oratio = day;
	}

	cantica = getCanticaCompletorium(date, day, config);

	return [
		{type: 'title', title: 'completorium', date: date, eve: true},
		skip ? 'omitte-' + skip : '',
		'incipit' + (date.getPart() === 2 ? '-quadragesimae' : ''),
		'confiteor',
		getHymnusCompletorium(date, day),
		cantica[0].split('|'),
		cantica[1].split('|'),
		lectio[day],
		'responsorium-' + resp,
		['nunc-dimittis'],
		'oratio-completorium-' + oratio,
		'benedictio-completorium',
		config.get('marianAntiphon') === 'completorium' ? getMaria(date, config) : ''
	];
}

function getOverview (date, config) {

	function getInfoForDay (date) {
		var time, info = [], title, type, other, omitted;

		time = util.replaceFormatString(
			l10n.get('dies-info-' + ['annum', 'adventus-nativitatis', 'quadragesimae', 'paschale'][date.getPart()]),
			function (c) {
				if (c === 'p') {
					return date.getSubPart();
				}
			}
		);
		info.push(util.replaceFormatString(l10n.get('dies-info'), function (c) {
			switch (c) {
			case 'a': return date.getYearLetter().charCodeAt(0) - 97;
			case 'i': return date.getYearLectio().length - 1;
			case 'l': return date.getMoon() - 1; //change to 0-based
			case 't': return time;
			case 'w': return Math.floor(date.getDayInSequence() / 7);
			}
		}));

		title = date.getName();
		if (title) {
			title = l10n.getTitle(title);
			type = date.getType();
			if (type) {
				title += ' (' + l10n.get(type + '-littera') + ')'; //TODO l10n?
			}
		} else if (date.isSunday()) {
			title = l10n.formatSunday(date.getSunday());
		}
		if (title) {
			info.push(title);
		}

		other = date.getAlternatives().filter(function (name) {
			return name !== '';
		}).map(function (name) {
			return l10n.getTitle(name);
		});
		if (other.length) {
			info.push(l10n.get('dies-info-alternativus') + ' ' + other.join('; '));
		}

		omitted = date.getOmitted();
		other = Object.keys(omitted).map(function (name) {
			return l10n.getTitle(name) + ' (' + l10n.get(omitted[name] + '-littera') + ')'; //TODO l10n?
		});
		if (other.length) {
			info.push(l10n.get('dies-info-omittantes') + ' ' + other.join('; '));
		}

		return info;
	}

	var eve = date.getEve().isEve() ? ' (' + l10n.get('vespera-pridiana') + ')' : '',
		current = date.getCurrentHora();
	if (current && config.get('invitatoriumLocus') === current) {
		current = 'invitatorium';
	}
	return [
		{type: 'title', title: 'liturgia-horarum', date: date},
		getHora.makeSelect(date),
		date.getType(),
		{type: 'notes', notes: date.getNotes()},
		{type: 'link', href: getHora.makeLink(date, 'invitatorium'), label: 'invitatorium',
			cls: current === 'invitatorium' ? 'current' : ''},
		{type: 'link', href: getHora.makeLink(date, 'lectionis'), label: 'lectionis'},
		{type: 'link', href: getHora.makeLink(date, 'laudes'), label: 'laudes', cls: current === 'laudes' ? 'current' : ''},
		{type: 'link', href: getHora.makeLink(date, 'tertia'), label: 'tertia', cls: current === 'tertia' ? 'current' : ''},
		{type: 'link', href: getHora.makeLink(date, 'sexta'), label: 'sexta', cls: current === 'sexta' ? 'current' : ''},
		{type: 'link', href: getHora.makeLink(date, 'nona'), label: 'nona', cls: current === 'nona' ? 'current' : ''},
		{type: 'link', href: getHora.makeLink(date, 'vespera'),
			labelHtml: l10n.get('vespera') + eve, cls: current === 'vespera' ? 'current' : ''},
		//TODO? antizipierte Lesehore
		{type: 'link', href: getHora.makeLink(date, 'completorium'),
			labelHtml: l10n.get('completorium') + eve, cls: current === 'completorium' ? 'current' : ''},
		{type: 'notes', notes: getInfoForDay(date)},
		date.getAbout()
	];
}

function getCatalogue (data) {
	var catalogus = l10n.get('catalogus'),
		top = '<div class="title green" data-title="' + catalogus + '"><h1>' + catalogus + '</h1></div>';
	if (data.length > 1) {
		data.splice(1, 0, '');
		data.push('');
	} else {
		top += l10n.get('catalogus-index');
	}
	l10n.setDynamicData('nomen', '');
	l10n.setDynamicData('antiphona', '@antiphona');
	return data.map(function (entry) {
		var content;
		if (entry === 'catalogus') {
			return {type: 'raw', html: top};
		}
		if (entry.slice(0, 'catalogus-'.length) === 'catalogus-') {
			return {type: 'raw', html: l10n.get(entry)};
		}
		if (entry === '') {
			return {
				type: 'raw',
				html: '<p class="link"><span class="link-like" tabindex="0" data-action="?a=back">' +
					l10n.get('retrorsum') + '</span></p>'
			};
		}
		content = l10n.get(entry, '');
		if (!content) {
			return 'textus-abest';
		}
		return content.indexOf('@antiphona') > -1 ? [entry, '!'] : entry;
	});
}

function getMonth (date) {
	var m = date.getMonth(), y = date.getYear(),
		now, prev, next,
		colors = {},
		rows = [],
		cls, color, type, d, href, title, alternatives, omitted = [],
		maxCount = 0, maxColor;

	function getAlternatives (date) {
		return date.getAlternatives().filter(function (name) {
			return name !== '';
		}).map(function (name) {
			return l10n.getTitle(name);
		}).map(function (title) {
			return '<span class="alternativus">' + title + '</span>';
		}).join('<br>');
	}

	function addOmitted (date) {
		var data = date.getOmitted(), name, rank;
		for (name in data) {
			if (data.hasOwnProperty(name) && data[name] !== 'sollemnitas') {
				rank = data[name];
				omitted.push(
					l10n.getTitle(name) + ' ' +
					date.format(l10n.get(rank ? 'date-format-short-type' : 'date-format-short'))
						.replace('%t',  l10n.get(rank + '-littera'))
				);
			}
		}
	}

	now = new Day();
	date = new Day(y, m, 1);
	prev = date.prev();
	while (date.getMonth() === m) {
		color = date.getColor();
		if (!colors[color]) {
			colors[color] = 0;
		}
		colors[color]++;

		type = date.getType();
		if (type) {
			type = l10n.get(type + '-littera');
		}

		d = date.getDate();
		href = getHora.makeLink(date, '');
		if (href) {
			d = '<a href="' + href + '">' + d + '</a>';
		}

		title = date.getName();
		if (title) {
			title = l10n.getTitle(title);
		} else if (date.isSunday()) {
			title = l10n.formatSunday(date.getSunday());
		}

		alternatives = getAlternatives(date);
		addOmitted(date);

		cls = [];
		if (date.isSunday()) {
			cls.push('sunday');
		}
		if (now.getYear() === date.getYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
			cls.push('current');
		}
		rows.push(
			'<tr' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '><td class="' + color + '">' + type + '</td>' +
			'<td>' + d + '</td><td>' + title + (title && alternatives ? '<br>' : '') + alternatives + '</td></tr>'
		);

		date = date.next();
	}
	next = date;
	date = next.prev();
	for (color in colors) {
		if (colors[color] > maxCount) {
			maxCount = colors[color];
			maxColor = color;
		}
	}
	omitted = omitted.length ?
		'<div class="p additamentum">' + l10n.get('dies-omittantes') +
			'<ul><li>' + omitted.join('</li><li>') + '</li></ul></div>' :
		'';
	return [
		{type: 'month', date: date, color: maxColor},
		{type: 'link', href: getHora.makeLink(prev, 'mensis'), labelHtml: prev.format(l10n.get('date-format-month'))},
		{type: 'raw', html: '<div class="p"><table class="mensis">' + rows.join('') + '</table></div>' + omitted},
		{type: 'link', href: getHora.makeLink(next, 'mensis'), labelHtml: next.format(l10n.get('date-format-month'))}
	];
}

function getHoraSequence (date, hora, config) {
	switch (hora) {
	case 'mensis': return getMonth(date, config);
	case 'invitatorium': return getInvitatorium(date, config);
	case 'lectionis': return getLectionis(date, config);
	case 'laudes': return getLaudes(date, config);
	case 'tertia': return getTertiaSextaNona(date, 0, false, config);
	case 'tertia-complementaris': return getTertiaSextaNona(date, 0, true, config);
	case 'sexta': return getTertiaSextaNona(date, 1, false, config);
	case 'sexta-complementaris': return getTertiaSextaNona(date, 1, true, config);
	case 'nona': return getTertiaSextaNona(date, 2, false, config);
	case 'nona-complementaris': return getTertiaSextaNona(date, 2, true, config);
	case 'vespera': return getVespera(date, config);
	case 'completorium': return getCompletorium(date, config);
	default:
		if (hora.indexOf('catalogus') === 0) {
			return getCatalogue(hora.split(','), config);
		}
		return getOverview(date, config);
	}
}

function mergeSequences (seq1, seq2, lang1) {
	var part2;
	return '<table class="twolang">' + seq1.map(function (part1, i) {
		part2 = seq2[i];
		if (!part1 && !part2) {
			return '';
		}
		if (
			part1 === false ||
			(part2 && (part1 === part2.replace(/&nbsp;<span class="audio" [^>]*>♪<\/span><\/h2>/, '</h2>')))
		) {
			return '<tr><td colspan="2">' + part2 + '</td></tr><!--2-->';
		}
		return '<tr><td lang="' + lang1 + '">' + part1 + '</td><td>' + (part2 || '') + '</td></tr>';
	}).join('').replace(/<\/td><\/tr><!--2--><tr><td colspan="2">/g, '').replace(/<!--2-->/g, '') + '</table>';
}

function getHora (date, hora, callback) {
	var part, seqPrimary, seqSecondary, config, lang1, lang2;
	config = Config.getConfig(); //TODO übergeben lassen
	if (hora.indexOf('catalogus') === 0) {
		part = '';
	} else {
		part = (['vespera', 'completorium'].indexOf(hora) > -1 ? date.getEve() : date).getPartLetter();
	}
	if (part === 'p' && hora === 'lectionis' && date.getDayInSequence(-1) === 0) {
		part = 'q';
	}
	seqPrimary = formatSequence(getHoraSequence(date, hora, config), part);
	if (callback) {
		lang1 = config.get('lang');
		lang2 = config.get('lang2');
		if (lang2 && lang1 !== lang2) {
			l10n.load(lang2, function () {
				seqSecondary = formatSequence(getHoraSequence(date, hora, config), part, true);
				l10n.load(lang1, function () {
					callback(mergeSequences(seqSecondary, seqPrimary, lang2));
				});
			});
		} else {
			callback(seqPrimary.join(''));
		}
	}
	return seqPrimary.join('');
}

getHora.makeLink = function (/*date, hora*/) {
	return '';
};

getHora.makeSelect = function (/*date*/) {
	return '';
};

return getHora;
})();
