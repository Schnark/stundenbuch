/*global Day*/
(function () {
"use strict";
//For historic development of the calendars see NOTES.txt

/*
Typen:
ordinarium
dominus
defunctus
ecclesia
maria
apostolus/apostolus2/evangelista
virgo
martyr
pastor/doctor/papa/episcopus/fundator/missionarius
religiosus/abbas
(ohne)

Zusätze:
misericordia
educator
martyr
vir
mulier
plures
beatus
extra (nur ecclesia)
*/
/*
var d = new Day('2021-01-01'), i, n;
for (i = 0; i < 365; i++) {
	n = d.getNotes();
	if (n && n.length) {
		console.log(d.format() + ': ' + l10n.localizeNotes(n).join(', '));
	}
	d = d.next();
}
*/
/*
Naming conventions for calendars:
*: basic calendar that has to exist to prevent missing texts
(empty string): General Roman Calendar
Numeric entries: Large regions (e.g. 150 is Europa), see https://unstats.un.org/unsd/methodology/m49/
Valid language codes, either with or without country: when areas with common language also share the calendar,
	with additions for single countries
Country codes: Calendars for a country that don't inherit from a common language calendar
Yet undecided convention for dioceses
*/

Day.calendars = {
	'*': {
		getEntries: function (config) {
			return [
				[1, 'sunday', 'baptismate', 1, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-135-i-vespera', 'ps-135-ii', '1-tim-3'],
							lectionis: ['ps-29', 'ps-66-i', 'ps-66-ii'],
							vigilia: ['is-26', 'is-40-vig', 'is-66'],
							tertia: ['ps-118-i', 'ps-118-ii', 'ps-118-iii'],
							sexta: ['ps-118-i', 'ps-118-ii', 'ps-118-iii'],
							nona: ['ps-118-i', 'ps-118-ii', 'ps-118-iii'],
							tsnAlt: ['ps-23', 'ps-76-i', 'ps-76-ii'],
							vespera: ['ps-110', 'ps-112', 'apc-15']
						},
						lectio: {
							vespera0: 'act-10-37-38',
							laudes: 'is-61-1-2',
							tertia: 'is-11-1-3',
							sexta: 'is-42-1',
							nona: 'is-49-6',
							vespera: 'act-10-37-38'
						}
					},
					iii: true
				}],
				[34, 'sunday', 'rex', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-117', 'apc-4-5'],
							lectionis: ['ps-2', 'ps-72-i', 'ps-72-ii'],
							vigilia: ['1-par-29', 'is-12', 'is-61-62'],
							vespera: ['ps-110', 'ps-145-i', 'apc-19']
						},
						lectio: {
							vespera0: 'eph-1-20-23',
							laudes: 'eph-4-15-16',
							tertia: 'col-1-12-13',
							sexta: 'col-1-16-18',
							nona: 'col-1-19-20',
							vespera: '1-cor-15-25-28'
						}
					}
				}],
				[-1, 'sunday', 'familia', 1, '', {
					texts: {
						cantica: { //= maria
							vespera0: ['ps-113', 'ps-147-ii', 'eph-1'],
							lectionis: ['ps-24', 'ps-46', 'ps-87'],
							vigilia: ['is-26', 'is-40-vig', 'is-66'],
							vespera: ['ps-122', 'ps-127', 'eph-1']
						},
						lectio: {
							vespera0: '2-cor-8-9',
							laudes: 'dt-5-16',
							tertia: 'col-3-12-13-var',
							sexta: 'col-3-14-15-var',
							nona: 'col-3-17',
							vespera: 'phil-2-6-7'
						}
					},
					abc: true
				}],
				[30, 12, '', 4, '', {
					move: function (day) {
						return day.getDay() === 5 ? 'sunday/-1' : false;
					}
				}],
				[-2, 'sunday', 'dominica-nativitatis', 1, '', {
					type: '',
					texts: {
						lectio: {
							vespera0: '1-io-5-20',
							laudes: 'hbr-1-1-2',
							tertia: 'tit-2-11-12',
							sexta: '1-io-4-9',
							nona: 'act-10-36',
							vespera: '1-io-1-1-3'
						}
					}
				}],

				[-46, 'easter', 'cinerum', 0, 'ordinarium', {
					type: '',
					eve: false,
					tedeum: false,
					vigilia: false,
					completorium: false,
					texts: {
						preces: {
							laudes: 'p'
						}
					}
				}],
				[-7, 'easter', 'palmis', 0, '', {
					type: '',
					color: 'red',
					tedeum: false,
					texts: {
						hymnus: {
							tertia: 'p',
							sexta: 'p',
							nona: 'p'
						},
						lectio: {
							laudes: 'za-9-9'
						}
					}
				}],
				[-3, 'easter', 'cena', 1, 'ordinarium', {
					type: '',
					color: ['violet', 'white'],
					tedeum: false,
					texts: {
						hymnus: {
							vespera: 'p'
						},
						preces: {
							laudes: 'p',
							vespera: 'p'
						},
						oratio: {
							vespera: 'p'
						}
					},
					completorium: true
				}],
				[-2, 'easter', 'passionis', 1, 'dominus', {
					type: '',
					color: 'red',
					tedeum: false,
					texts: {
						hymnus: {
							tertia: 'p',
							sexta: 'p',
							nona: 'p'
						},
						cantica: {
							laudes: 'o',
							lectionis: ['ps-2', 'ps-22', 'ps-38'],
							vigilia: ['ier-14', 'ez-36', 'lam-5'],
							tertia: ['ps-40', 'ps-54', 'ps-88'],
							sexta: ['ps-40', 'ps-54', 'ps-88'],
							nona: ['ps-40', 'ps-54', 'ps-88'],
							vespera: ['ps-116-ii', 'ps-143-vespera', 'phil-2']
						}
					},
					completorium: true
				}],
				[-1, 'easter', 'sabbatum-sanctum', 1, 'dominus', {
					type: '',
					color: 'black',
					tedeum: false,
					texts: {
						hymnus: {
							tertia: 'p',
							sexta: 'p',
							nona: 'p'
						},
						cantica: {
							laudes: ['ps-64', 'is-38', 'ps-150'],
							lectionis: ['ps-4', 'ps-16-vespera', 'ps-24'],
							vigilia: ['ier-14', 'ez-36', 'lam-5'],
							tertia: ['ps-27', 'ps-30', 'ps-76'],
							sexta: ['ps-27', 'ps-30', 'ps-76'],
							nona: ['ps-27', 'ps-30', 'ps-76'],
							vespera: ['ps-116-ii', 'ps-143-vespera', 'phil-2']
						},
						lectio: {
							laudes: 'os-5-15-6-2'
						}
					},
					completorium: true
				}],
				[0, 'easter', 'pascha', 0, 'ordinarium', {
					eve: false //actually neither needed nor used
				}],
				/*[7, 'easter', 'pascha-octava', 0, 'ordinarium', {
					type: ''
				}],*///TODO
				[config.get('ascensionSunday') ? 42 : 39, 'easter', 'ascensio', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-117', 'apc-11-12'],
							lectionis: ['ps-68-i', 'ps-68-ii', 'ps-68-iii'],
							tertia: ['ps-8', 'ps-19-i', 'ps-19-ii'],
							sexta: ['ps-8', 'ps-19-i', 'ps-19-ii'],
							nona: ['ps-8', 'ps-19-i', 'ps-19-ii'],
							vespera: ['ps-110', 'ps-47', 'apc-11-12']
						},
						lectio: {
							vespera0: 'eph-2-4-6',
							laudes: 'hbr-10-12-14',
							tertia: 'apc-1-17-18',
							sexta: 'hbr-8-1-3',
							nona: 'col-3-1-2',
							vespera: '1-pt-3-18-22'
						}
					}
				}],
				[49, 'easter', 'pentecoste', 0, 'dominus', {
					color: 'red',
					texts: {
						hymnus: {
							tertia: 'p'
						},
						cantica: {
							vespera0: ['ps-113', 'ps-147-i', 'apc-15'],
							lectionis: ['ps-104-i', 'ps-104-ii', 'ps-104-iii'],
							vigilia: ['is-63', 'os-6', 'so-3'],
							vespera: ['ps-110', 'ps-114', 'apc-19']
						},
						lectio: {
							vespera0: 'rm-8-11',
							laudes: 'act-5-30-32',
							tertia: '1-cor-12-13',
							sexta: 'tit-3-5-7',
							nona: '2-cor-1-21-22',
							vespera: 'eph-4-3-6'
						}
					}
				}],
				[56, 'easter', 'trinitatis', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-147-ii', 'eph-1'],
							lectionis: ['ps-8', 'ps-33-i', 'ps-33-ii'],
							vigilia: ['is-33-vig', 'is-33', 'sir-36-vig'],
							vespera: ['ps-110', 'ps-114', 'apc-19']
						},
						lectio: {
							vespera0: 'rm-11-33-36',
							laudes: '1-cor-12-4-6',
							tertia: '2-cor-1-21-22',
							sexta: 'gal-4-4-6',
							nona: 'apc-7-12',
							vespera: 'eph-4-3-6'
						}
					}
				}],
				[config.get('corpusSunday') ? 63 : 60, 'easter', 'corpus-domini', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-111', 'ps-147-ii', 'apc-11-12'],
							lectionis: ['ps-23', 'ps-42', 'ps-81'],
							vigilia: ['prv-9', 'ier-31', 'sap-16-17'],
							vespera: ['ps-110', 'ps-116-ii', 'apc-19']
						},
						lectio: {
							vespera0: '1-cor-10-16-17',
							laudes: 'mal-1-11',
							tertia: 'sap-16-20',
							sexta: 'prv-9-1-2',
							nona: 'act-2-42-47',
							vespera: '1-cor-11-23-25'
						}
					}
				}],
				[68, 'easter', 'cor-iesu', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-146', 'apc-4-5'],
							lectionis: ['ps-36', 'ps-61', 'ps-98'],
							vigilia: ['is-12', '1-sm-2-i', '1-sm-2-ii'],
							vespera: ['ps-110', 'ps-111', 'phil-2']
						},
						lectio: {
							vespera0: 'eph-5-25-27',
							laudes: 'ier-31-33',
							tertia: 'ier-31-2-4',
							sexta: 'ier-32-40',
							nona: 'rm-5-8-9',
							vespera: 'eph-2-4-7'
						}
					}
				}],

				[1, 1, 'maria-genetrix', 0, 'maria', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-147-ii', 'eph-1'],
							lectionis: ['ps-24', 'ps-87', 'ps-99'],
							vigilia: ['is-26', 'is-40-vig', 'is-66'],
							vespera: ['ps-122', 'ps-127', 'eph-1']
						},
						lectio: {
							vespera0: 'gal-4-4-5',
							laudes: 'mi-5-2-4',
							tertia: 'so-3-14-15',
							sexta: 'za-9-9',
							nona: 'bar-5-3-4',
							vespera: 'gal-4-4-5'
						}
					}
				}],
				[
					config.get('epiphaniasSunday') ? -2 : 6, config.get('epiphaniasSunday') ? 'sunday' : 1,
					'epiphanias', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-135-i-vespera', 'ps-135-ii', '1-tim-3'],
							lectionis: ['ps-72', 'ps-96', 'ps-97'],
							vigilia: ['is-26', 'is-40-vig', 'is-66'],
							tertia: ['ps-47', 'ps-86-i', 'ps-98'],
							sexta: ['ps-47', 'ps-86-i', 'ps-98'],
							nona: ['ps-47', 'ps-86-i', 'ps-98'],
							vespera: ['ps-110', 'ps-112', 'apc-15']
						},
						lectio: {
							vespera0: '2-tim-1-9-10',
							laudes: 'is-52-7-10',
							tertia: 'apc-15-4',
							sexta: 'is-49-6',
							nona: 'za-2-15',
							vespera: 'tit-3-4-5'
						}
					}
				}],
				[25, 12, 'natalis', 0, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-147-ii', 'phil-2'],
							lectionis: ['ps-2', 'ps-19-i', 'ps-45'],
							tertia: ['ps-19-ii', 'ps-47', 'ps-48'],
							sexta: ['ps-19-ii', 'ps-47', 'ps-48'],
							nona: ['ps-19-ii', 'ps-47', 'ps-48']
						},
						lectio: {
							vespera0: 'gal-4-4-5'
						}
					}
				}],
				[26, 12, 'stephanus', 1, ['martyr', 'vir'], {
					color: ['red', 'white'],
					texts: {
						hymnus: {
							vespera: 'o'
						},
						cantica: {
							vespera: 'o'
						},
						lectio: {
							laudes: 'act-6-2-5',
							sexta: 'iac-1-12',
							vespera: 'o'
						},
						responsorium: {
							vespera: 'o'
						},
						antiphona: {
							vespera: 'o'
						},
						preces: {
							vespera: 'o'
						},
						oratio: {
							vespera: 'o'
						}
					}
				}],
				[27, 12, 'ioannes-apostolus', 1, 'apostolus', {
					texts: {
						hymnus: {
							vespera: 'o'
						},
						cantica: {
							lectionis: ['ps-19-i', 'ps-64', 'ps-99'],
							vespera: 'o'
						},
						lectio: {
							laudes: 'act-4-19-20',
							vespera: 'o'
						},
						responsorium: {
							vespera: 'o'
						},
						antiphona: {
							vespera: 'o'
						},
						preces: {
							vespera: 'o'
						},
						oratio: {
							vespera: 'o'
						}
					}
				}],
				[28, 12, 'innocentes', 1, ['martyr', 'plures'], {
					color: ['red', 'white'],
					texts: {
						hymnus: {
							vespera: 'o'
						},
						cantica: {
							vespera: 'o'
						},
						lectio: {
							laudes: 'ier-31-15',
							tertia: 'lam-1-16',
							sexta: 'lam-2-11',
							nona: 'ier-31-16-17',
							vespera: 'o'
						},
						responsorium: {
							vespera: 'o'
						},
						antiphona: {
							vespera: 'o'
						},
						preces: {
							vespera: 'o'
						},
						oratio: {
							vespera: 'o'
						}
					}
				}]
			];
		}
	},

	'': {
		base: '*',
		labelMsg: 'titulus-calendarium-generalis',
		papa: {
			'': 'Leo'/*,
			'de': '',
			'en': '',
			'la': '',
			'la-x-noaccent': ''*/
		},
		getEntries: function (config) {
			function moveNIPPprev (day) {
				if (day.getMonth() === 5) {
					if (day.getDate() === 23) {
						return '6/24';
					}
					if (day.getDate() === 28) {
						return '6/29';
					}
				}
				return false;
			}
			function moveNIPPnext (day) {
				if (day.getMonth() === 5) {
					if (day.getDate() === 25) {
						return '6/24';
					}
					if (day.getDate() === 30) {
						return '6/29';
					}
				}
				return false;
			}

			return [
				[50, 'easter', 'maria-ecclesia', 2, 'maria'],
				//move 'nativitatis-ioannes'/'petrus-paulus' by one day
				//when they coincide with 'corpus-domini' (to next)/'cor-iesu' (to previous)
				[config.get('corpusSunday') ? 64 : 61, 'easter', '', 4, '', {
					move: moveNIPPnext
				}],
				[67, 'easter', '', 4, '', {
					move: moveNIPPprev
				}],
				[69, 'easter', 'cor-maria', 2, 'maria'],

				[2, 1, 'basilius-gregorius', 2, [config.get('bugCompat') ? 'pastor' : 'doctor', 'plures']],
				[3, 1, 'nomen-iesu', 3, 'ordinarium'],
				[7, 1, 'raimundus-penyafort', 3, 'pastor'],
				[13, 1, 'hilarius', 3, 'doctor'],
				[17, 1, 'antonius', 2, ['religiosus', 'vir']],
				[20, 1, 'fabianus', 3, ['martyr', 'vir']],
				[20, 1, 'sebastianus', 3, ['martyr', 'vir']],
				[21, 1, 'agnes', 2, ['martyr', 'mulier'], {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: 'p'
						}
					}
				}],
				[22, 1, 'vincentius', 3, ['martyr', 'vir']],
				[24, 1, 'franciscus-sales', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[25, 1, 'conversio-pauli', 1, 'apostolus', {
					texts: {
						cantica: {
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', '']
						},
						lectio: {
							laudes: 'act-26-16-18',
							tertia: '1-tim-1-12-13',
							sexta: '1-tim-1-14-15',
							nona: '1-tim-1-16',
							vespera: '1-cor-15-9-10'
						}
					}
				}],
				[26, 1, 'timotheus-titus', 2, ['episcopus', 'plures']],
				[27, 1, 'angela-merici', 3, 'virgo'],
				[28, 1, 'thomas-aquino', 2, 'doctor'],
				[31, 1, 'ioannes-bosco', 2, 'pastor'],

				[2, 2, 'praesentatio', 1, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-147-ii', 'phil-2'],
							lectionis: ['ps-2', 'ps-19-i', 'ps-45'],
							vigilia: ['is-9', 'is-26', 'is-66'],
							vespera: ['ps-110', 'ps-130-vespera', 'col-1']
						},
						lectio: {
							vespera0: 'hbr-10-5-7',
							laudes: 'mal-3-1',
							tertia: 'is-8-14',
							sexta: 'is-42-13',
							nona: 'is-12-5-6',
							vespera: 'hbr-4-15-16'
						}
					}
				}],
				[3, 2, 'blasius', 3, ['martyr', 'vir']],
				[3, 2, 'ansgarius', 3, 'episcopus'],
				[5, 2, 'agatha', 2, ['virgo', 'martyr', 'mulier']],
				[6, 2, 'paulus-miki', 2, ['martyr', 'vir', 'plures']],
				[8, 2, 'hieronymus-emiliani', 3, ['vir', 'educator']],
				[8, 2, 'iosephina-bakhita', 3, 'virgo'],
				[10, 2, 'scholastica', 2, 'virgo'],
				[11, 2, 'maria-lourdes', 3, 'maria'],
				[14, 2, 'cyrillus-methodius', 2, ['pastor', 'plures']],
				[17, 2, 'septem-fundatores', 3, ['religiosus', 'vir', 'plures']],
				[21, 2, 'petrus-damiani', 3, 'doctor'],
				[22, 2, 'cathedra-petri', 1, 'apostolus', {
					texts: {
						lectio: {
							laudes: 'act-15-7-9',
							tertia: 'is-22-22',
							sexta: '1-pt-5-1-2',
							nona: '2-pt-1-16',
							vespera: '1-pt-1-3-5'
						}
					}
				}],
				[23, 2, 'polycarpus', 2, ['martyr', 'vir']],
				[27, 2, 'gregorius-narcensis', 3, 'doctor'],

				[4, 3, 'casimirus', 3, 'vir'],
				[7, 3, 'perpetua-felicitas', 2, ['martyr', 'mulier', 'plures']],
				[8, 3, 'ioannes-deo', 3, ['religiosus', 'misericordia', 'vir']],
				[9, 3, 'francisca-romana', 3, ['religiosus', 'mulier']],
				[17, 3, 'patricius', 3, 'episcopus'],
				[18, 3, 'cyrillus-hierosolymitanus', 3, 'doctor'],
				[19, 3, 'ioseph', 0, ['religiosus', 'vir'], {
					texts: {
						lectio: {
							vespera0: 'col-3-23-24',
							laudes: '2-sm-7-28-29',
							tertia: 'prv-2-7-8',
							sexta: 'sap-10-10',
							nona: 'sir-2-18-19',
							vespera: 'col-3-23-24'
						}
					}
				}],
				[-8, 'easter', '', 4, '', {
					move: function (day) {
						return (day.getMonth() === 2 && day.getDate() <= 18) ? '3/19' : false;
					}
				}],
				[20, 3, '', 4, '', {
					move: function (day) {
						return day.getDay() === 1 ? '3/19' : false;
					}
				}],
				[23, 3, 'turibius', 3, 'episcopus'],
				[25, 3, 'annuntiatio', 0, '', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-147-ii', 'phil-2'],
							lectionis: ['ps-2', 'ps-19-i', 'ps-45'],
							vigilia: ['is-9', 'is-26', 'is-66'],
							vespera: ['ps-110', 'ps-130-vespera', 'col-1']
						},
						lectio: {
							vespera0: '1-io-1-1-2',
							laudes: 'phil-2-6-7',
							tertia: 'eph-1-9-10',
							sexta: '1-io-4-10',
							nona: '1-tim-2-5-6',
							vespera: '1-io-1-1-2'
						}
					}
				}],
				[26, 3, '', 4, '', {
					move: function (day) {
						return day.getDay() === 1 ? '3/25' : false;
					}
				}],
				[8, 'easter', '', 4, '', {
					move: function (day) {
						return (day.getMonth() === 2 || (day.getMonth() === 3 && day.getDate() <= 9)) ? '3/25' : false;
					}
				}],

				[2, 4, 'franciscus-paola', 3, ['religiosus', 'vir']],
				[4, 4, 'isidorus', 3, 'doctor'],
				[5, 4, 'vincentius-ferrer', 3, 'pastor'],
				[7, 4, 'ioannes-baptista-de-la-salle', 2, 'pastor'], //TODO educator?
				[11, 4, 'stanislaus', 2, ['martyr', 'vir']],
				[13, 4, 'martinus-i', 3, ['martyr', 'vir']],
				[21, 4, 'anselmus', 3, 'doctor'],
				[23, 4, 'georgius', 3, ['martyr', 'vir']],
				[23, 4, 'adalbertus', 3, ['martyr', 'vir']],
				[24, 4, 'fidelis-sigmaringen', 3, ['martyr', 'vir']],
				[25, 4, 'marcus', 1, ['evangelista', 'martyr']],
				[28, 4, 'petrus-chanel', 3, ['martyr', 'vir']],
				[28, 4, 'ludovicus-maria-grignion-montfort', 3, 'pastor'],
				[29, 4, 'catharina-senensis', 2, 'virgo'],
				[30, 4, 'pius-v', 3, 'papa'],

				[1, 5, 'ioseph-opifex', 3, '', {
					texts: {
						lectio: {
							laudes: '2-sm-7-28-29',
							vespera: 'col-3-23-24'
						}
					}
				}],
				[2, 5, 'athanasius', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[3, 5, 'philippus-iacobus', 1, ['apostolus', 'martyr', 'plures']],
				[10, 5, 'ioannes-de-avila', 3, 'doctor'],
				[12, 5, 'nereus-achilleus', 3, ['martyr', 'vir', 'plures']],
				[12, 5, 'pancratius', 3, ['martyr', 'vir']],
				[13, 5, 'maria-fatima', 3, 'maria'],
				[14, 5, 'matthias', 1, ['apostolus', 'martyr']], //TODO apostolus2 ?
				[18, 5, 'ioannis-i', 3, ['papa', 'martyr']],
				[20, 5, 'bernhardinus-senensis', 3, 'pastor'],
				[21, 5, 'christophorus-magallanes', 3, ['martyr', 'vir', 'plures']],
				[22, 5, 'rita-cascia', 3, ['religiosus', 'mulier']],
				[25, 5, 'beda-venerabilis', 3, 'doctor'],
				[25, 5, 'gregorius-vii', 3, 'papa'],
				[25, 5, 'maria-magdalena-pazzi', 3, 'virgo'],
				[26, 5, 'philippus-neri', 2, 'pastor'],
				[27, 5, 'augustinus-cantuariensis', 3, 'episcopus'],
				[29, 5, 'paulus-vi', 3, 'papa'],
				[31, 5, 'visitatio', 1, 'maria', {
					texts: {
						lectio: {
							laudes: 'ioel-2-27-3-1',
							tertia: 'idt-14-7', //=idt-13-18-19 für la
							sexta: 'tb-12-6',
							nona: 'sap-7-27-28',
							vespera: '1-pt-5-5-7'
						}
					}
				}],

				[1, 6, 'iustinus', 2, ['martyr', 'vir']],
				[2, 6, 'marcellinus-petrus', 3, ['martyr', 'vir', 'plures']],
				[3, 6, 'carolus-lwanga', 2, ['martyr', 'vir', 'plures']],
				[5, 6, 'bonifatius', 2, ['martyr', 'vir']],
				[6, 6, 'norbertus', 3, 'pastor'],
				[9, 6, 'ephraem', 3, 'doctor'],
				[11, 6, 'barnabas', 2, ['apostolus2', 'martyr'], {
					texts: {
						lectio: {
							tertia: 'c',
							sexta: 'c',
							nona: 'c'
						},
						versus: {
							tertia: 'c',
							sexta: 'c',
							nona: 'c'
						},
						oratio: {
							tertia: 'p',
							sexta: 'p',
							nona: 'p'
						}
					}
				}],
				[13, 6, 'antonius-padova', 2, 'pastor'], //TODO doctor
				[19, 6, 'romualdus', 3, ['religiosus', 'vir']],
				[21, 6, 'aloisius-gonzaga', 2, ['religiosus', 'vir']],
				[22, 6, 'ioannes-fisher-thomas-more', 3, ['martyr', 'vir', 'plures']],
				[22, 6, 'paulinus-nolanus', 3, 'pastor'],
				[24, 6, 'nativitatis-ioannes', 0, '', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-146', 'eph-1'],
							lectionis: ['ps-21', 'ps-92-i', 'ps-92-ii'],
							vigilia: ['ier-17', 'sir-14-15', 'sir-31'],
							laudes: config.get('varyCanticaLaudes') ? ['ps-118', 'dn-3-ii', 'ps-150'] : undefined,
							vespera: ['ps-15', 'ps-112', 'apc-15']
						},
						lectio: {
							vespera0: 'act-13-23-25',
							laudes: 'mal-3-23-24',
							tertia: 'is-49-1',
							sexta: 'is-49-5-6',
							nona: 'is-49-7',
							vespera: 'act-13-23-25'
						}
					}
				}],
				[27, 6, 'cyrillus-alexandrinus', 3, 'doctor'],
				[28, 6, 'irenaeus', 2, ['doctor', 'martyr']],
				[29, 6, 'petrus-paulus', 0, ['apostolus', 'martyr', 'plures'], {
					texts: {
						lectio: {
							vespera0: 'rm-1-1-7',
							laudes: '1-pt-4-13-14',
							tertia: 'act-15-7-9',
							sexta: 'gal-1-15-18',
							nona: '2-cor-4-13-14',
							vespera: '1-cor-15-3-8'
						}
					}
				}],
				[30, 6, 'promartyr-roma', 3, ['martyr', 'vir', 'plures']],

				[3, 7, 'thomas', 1, ['apostolus', 'martyr']],
				[4, 7, 'elisabeth-lusitania', 3, ['mulier', 'misericordia']],
				[5, 7, 'antonius-maria-zaccaria', 3, 'pastor'],
				[6, 7, 'maria-goretti', 3, ['martyr', 'mulier']],
				[9, 7, 'augustinus-zhao-rong', 3, ['martyr', 'vir', 'plures']],
				[11, 7, 'benedictus-nursia', 2, ['religiosus', 'vir']],
				[13, 7, 'henricus', 3, 'vir'],
				[14, 7, 'camillus-lellis', 3, ['vir', 'misericordia']],
				[15, 7, 'bonaventura', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[16, 7, 'maria-de-monte-carmelo', 3, 'maria'],
				[20, 7, 'apollinaris', 3, ['martyr', 'vir']],
				[21, 7, 'laurentius-brindisi', 3, 'doctor'],
				[22, 7, 'maria-magdalena', 1, 'mulier', {
					texts: {
						lectio: {
							laudes: 'rm-12-1-2',
							vespera: 'rm-8-28-30'
						}
					}
				}],
				[23, 7, 'birgitta', 3, ['religiosus', 'mulier']],
				[24, 7, 'sarbelius-makhluf', 3, 'pastor'],
				[25, 7, 'iacobus-maior', 1, ['apostolus', 'martyr']],
				[26, 7, 'ioachim-anna', 2, ['vir', 'plures'], {
					texts: {
						lectio: {
							laudes: 'is-55-3',
							vespera: 'rm-9-4-5'
						}
					}
				}],
				[29, 7, 'martha', 2, ['mulier', 'plures']], //id nur martha, weil ursprünglich nur Marta
				[30, 7, 'petrus-chrysologus', 3, 'doctor'],
				[31, 7, 'ignatius-loyola', 2, 'pastor'],

				[1, 8, 'alfonsus-liguori', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[2, 8, 'eusebius', 3, ['episcopus']],
				[2, 8, 'petrus-iulianus', 3, ['religiosus', 'vir']],
				[4, 8, 'ioannes-maria-vianney', 2, 'pastor'],
				[5, 8, 'basilica-maria', 3, 'maria'],
				[6, 8, 'transfiguratio', 1, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-117', 'apc-19'],
							lectionis: ['ps-84', 'ps-97', 'ps-99'],
							vigilia: ['1-par-29', 'is-12', 'is-61-62'],
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', ''],
							vespera: ['ps-110', 'ps-121', '1-tim-3']
						},
						lectio: {
							vespera0: 'phil-3-20-21',
							laudes: 'apc-21-10-23',
							tertia: 'ex-19-8-9',
							sexta: 'ex-33-9-11',
							nona: '2-cor-3-18',
							vespera: 'rm-8-16-17'
						}
					}
				}],
				[7, 8, 'xystus', 3, ['martyr', 'vir', 'plures']],
				[7, 8, 'caietanus', 3, 'pastor'],
				[8, 8, 'dominicus', 2, 'pastor'],
				[9, 8, 'teresia-benedicta', 3, ['martyr', 'virgo']],
				[10, 8, 'laurentius', 1, ['martyr', 'vir']],
				[11, 8, 'clara-assisi', 2, 'virgo'],
				[12, 8, 'ioanna-francisca-chantal', 3, ['religiosus', 'mulier']],
				[13, 8, 'pontianus-hippolytus', 3, ['martyr', 'vir', 'plures']],
				[14, 8, 'maximilianus-maria-kolbe', 2, ['martyr', 'vir']],
				[15, 8, 'assumptio', 0, 'maria', {
					texts: {
						lectio: {
							vespera0: 'rm-8-30',
							laudes: 'is-61-10',
							tertia: 'idt-13-17-18',
							sexta: 'apc-12-1',
							nona: '2-cor-5-1',
							vespera: '1-cor-15-22-23'
						},
						maria: 'ave-regina-caelorum'
					}
				}],
				[16, 8, 'stephanus-hungaria', 3, 'vir'],
				[19, 8, 'ioannes-eudes', 3, 'pastor'],
				[20, 8, 'bernardus-clairvaux', 2, 'doctor'],
				[21, 8, 'pius-x', 2, 'papa'],
				[22, 8, 'maria-regina', 2, 'maria', {
					texts: {
						maria: 'ave-regina-caelorum'
					}
				}],
				[23, 8, 'rosa-lima', 3, 'virgo'],
				[24, 8, 'bartholomaeus', 1, ['apostolus', 'martyr']],
				[25, 8, 'ludovicus', 3, 'vir'],
				[25, 8, 'ioseph-calasanz', 3, 'pastor'],
				[27, 8, 'monica', 2, 'mulier'],
				[28, 8, 'augustinus', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[29, 8, 'passio-ioannes', 2, ['martyr', 'vir'], {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: 'p'
						},
						lectio: {
							laudes: 'is-49-1-2',
							vespera: 'act-13-23-25'
						}
					}
				}],

				[3, 9, 'gregorius-magnus', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[5, 9, 'teresa-kalkutta', 3, ['misericordia', 'mulier']], //id deutsch, weil ursprünglich nur Freiburg
				[8, 9, 'nativitatis-maria', 1, 'maria', {
					texts: {
						cantica: {
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', '']
						},
						lectio: {
							laudes: 'is-11-1-3', //TODO oder Variante?
							tertia: 'ct-6-10',
							sexta: 'idt-13-18b-19',
							nona: 'apc-21-3',
							vespera: 'rm-9-4-5'
						}
					}
				}],
				[9, 9, 'petrus-claver', 3, ['pastor', 'misericordia']],
				[12, 9, 'nomen-maria', 3, 'maria'],
				[13, 9, 'ioannes-chrysostomus', 2, config.get('bugCompat') ? 'pastor' : 'doctor'],
				[14, 9, 'exaltatio-crucis', 1, 'dominus', {
					color: 'red',
					texts: {
						cantica: {
							vespera0: ['ps-147-i', 'ps-147-ii', 'phil-2'],
							lectionis: ['ps-2', 'ps-8', 'ps-96'],
							vigilia: ['1-par-29', 'is-12', 'is-61-62'],
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', ''],
							vespera: ['ps-110', 'ps-116-ii', 'apc-4-5']
						},
						lectio: {
							vespera0: '1-cor-1-23-24',
							laudes: 'hbr-2-9-10',
							tertia: 'hbr-5-7-9',
							sexta: 'eph-1-7-8',
							nona: '1-pt-1-18-19',
							vespera: '1-cor-1-23-24'
						}
					}
				}],
				[15, 9, 'perdolens-maria', 2, 'maria', {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: 'p'
						},
						lectio: {
							laudes: 'col-1-24-25',
							vespera: '2-tim-2-10-12'
						}
					}
				}],
				[16, 9, 'cornelius-cyprianus', 2, ['martyr', 'vir', 'plures']],
				[17, 9, 'robertus-bellarmino', 3, 'doctor'],
				[17, 9, 'hildegard-bingen', 3, ['religiosus', 'mulier']], //id deutsch, weil ursprünglich nur de
				[19, 9, 'ianuarius', 3, ['martyr', 'vir']],
				[20, 9, 'andreas-kim-taegon', 2, ['martyr', 'vir', 'plures']],
				[21, 9, 'matthaeus', 1, ['apostolus', 'martyr']],
				[23, 9, 'pius-pietrelcina', 2, 'pastor'],
				[26, 9, 'cosmas-damianus', 3, ['martyr', 'vir', 'plures']],
				[27, 9, 'vincentius-paul', 2, 'pastor'],
				[28, 9, 'venceslaus', 3, ['martyr', 'vir']],
				[28, 9, 'laurentius-ruiz', 3, ['martyr', 'vir', 'plures']],
				[29, 9, 'archangeli', 1, '', {
					vigilia: true,
					texts: {
						cantica: {
							lectionis: ['ps-97', 'ps-103-i-archangeli', 'ps-103-ii-archangeli'],
							vigilia: ['tb-13-i', 'tb-13-ii-vig', 'tb-13-iii'],
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', ''],
							vespera: ['ps-8', 'ps-138', 'col-1']
						},
						lectio: {
							laudes: 'gn-28-12-13',
							tertia: 'dn-12-1',
							sexta: 'dn-9-22-23',
							nona: 'tb-12-15-20',
							vespera: 'apc-1-4-6'
						}
					}
				}],
				[30, 9, 'hieronymus', 2, 'doctor'],

				[1, 10, 'teresia-iesu-infante', 2, 'virgo'],
				[2, 10, 'angeli-custodum', 2, '', {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: ['ps-34-i', 'ps-34-ii', 'apc-11-12']
						},
						lectio: {
							laudes: 'ex-23-20-21',
							tertia: 'act-5-17-20',
							sexta: 'act-12-7',
							nona: 'act-10-3-5',
							vespera: 'apc-8-3-4'
						},
						versus: {
							tertia: 'p',
							sexta: 'p',
							nona: 'p'
						},
						oratio: {
							tertia: 'p',
							sexta: 'p',
							nona: 'p'
						}
					},
					tedeum: true
				}],
				[4, 10, 'franciscus', 2, ['religiosus', 'vir']],
				[5, 10, 'faustina-kowalska', 3, 'virgo'],
				[6, 10, 'bruno', 3, 'pastor'],
				[7, 10, 'maria-rosarium', 2, 'maria', {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: 'p'
						}
					}
				}],
				[9, 10, 'dionysius', 3, ['martyr', 'vir', 'plures']],
				[9, 10, 'ioannes-leonardus', 3, ['pastor', 'misericordia']],
				[11, 10, 'ioannes-xxiii', 3, 'papa'],
				[14, 10, 'callistus-i', 3, ['martyr', 'vir']],
				[15, 10, 'teresia-iesu', 2, 'virgo'],
				[16, 10, 'hedvigis', 3, ['mulier', 'misericordia']],
				[16, 10, 'margarita-maria-alacoque', 3, 'virgo'],
				[17, 10, 'ignatius-antiochia', 2, ['martyr', 'vir']],
				[18, 10, 'lucas', 1, ['evangelista', 'martyr']],
				[19, 10, 'ioannes-brebeuf-isaac-jogues', 3, ['martyr', 'vir', 'plures']],
				[19, 10, 'paulus-cruce', 3, 'pastor'],
				[22, 10, 'ioannes-paulus-ii', 3, 'papa'],
				[23, 10, 'ioannes-capestrano', 3, 'pastor'],
				[24, 10, 'antonius-maria-claret', 3, 'episcopus'],
				[28, 10, 'simon-iudas', 1, ['apostolus', 'martyr', 'plures']],

				[1, 11, 'omnes-sancti', 0, '', {
					texts: {
						cantica: {
							vespera0: [config.get('bugCompat') ? 'ps-150' : 'ps-113', 'ps-147-ii', 'apc-19'],
							lectionis: ['ps-8', 'ps-15', 'ps-16-vespera'],
							vigilia: ['tb-13-i', 'tb-13-ii-vig', 'tb-13-iii'],
							vespera: ['ps-110', 'ps-116-ii', 'apc-4-5']
						},
						lectio: {
							vespera0: 'hbr-12-22-24',
							laudes: 'eph-1-17-18',
							tertia: 'is-65-18-19',
							sexta: '1-pt-1-15-16',
							nona: 'apc-21-10-11-22-3-4',
							vespera: '2-cor-6-16-7-1'
						}
					}
				}],
				[2, 11, 'commemoratio-defuncti', 1, ['defunctus', 'plures']],
				[3, 11, 'martinus-porres', 3, ['religiosus', 'vir']],
				[4, 11, 'carolus-borromeus', 2, 'episcopus'],
				[9, 11, 'basilica-laterano', 1, ['ecclesia', 'extra', 'dominus']],
				[10, 11, 'leo-magnus', 2, 'papa'],
				[11, 11, 'martinus', 2, 'pastor', {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: 'p'
						}
					}
				}],
				[12, 11, 'iosaphat', 2, ['martyr', 'vir']],
				[15, 11, 'albertus-magnus', 3, 'doctor'],
				[16, 11, 'margarita-scotia', 3, ['mulier', 'misericordia']],
				[16, 11, 'gertrudis', 3, 'virgo'],
				[17, 11, 'elisabeth-hungaria', 2, ['mulier', 'misericordia']],
				[18, 11, 'basilica-petrus-paulus', 3, 'apostolus'],
				[21, 11, 'praesentatio-maria', 2, 'maria'],
				[22, 11, 'caecilia', 2, ['martyr', 'virgo', 'mulier']],
				[23, 11, 'clemens-i', 3, ['martyr', 'vir']],
				[23, 11, 'columbanus', 3, 'pastor'],
				[24, 11, 'andreas-dung-lac', 2, ['martyr', 'vir', 'plures']],
				[25, 11, 'catharina-alexandrina', 3, ['martyr', 'mulier']],
				[30, 11, 'andreas', 1, ['apostolus', 'martyr']],

				[3, 12, 'franciscus-xavier', 2, 'pastor'],
				[4, 12, 'ioannes-damasceni', 3, 'doctor'],
				[6, 12, 'nicolaus', 3, 'episcopus'],
				[7, 12, 'ambrosius', 2, 'doctor'],
				[8, 12, 'maria-immaculata', 0, 'maria', {
					texts: {
						lectio: {
							vespera0: 'rm-8-29-30',
							laudes: 'is-43-1',
							tertia: 'eph-1-4',
							sexta: 'eph-1-11-12',
							nona: 'eph-5-25-27',
							vespera: 'rm-5-20-21'
						}
					}
				}],
				[9, 12, '', 4, '', {
					move: function (day) {
						return day.getDay() === 1 ? '12/8' : false;
					}
				}],
				[9, 12, 'ioannes-didacus', 3, 'vir'],
				[10, 12, 'maria-loreto', 3, 'maria'],
				[11, 12, 'damasus-i', 3, 'pastor'],
				[12, 12, 'maria-guadalupe', 3, 'maria'],
				[13, 12, 'lucia', 2, ['martyr', 'virgo']],
				[14, 12, 'ioannes-cruce', 2, 'doctor'],
				[21, 12, 'petrus-canisius', 3, 'doctor'],
				[23, 12, 'ioannes-kety', 3, ['misericordia', 'pastor']],
				[29, 12, 'thomas-becket', 3, ['episcopus', 'martyr']],
				[31, 12, 'silvester', 3, 'papa'],

				[21, 4, 'franciscus-i', 3, ['defunctus', 'vir'], 'Franciscus']
			];
		},
		notes: [ //TODO vollständig lokalisieren
			[7, 'easter', {
				'': 'Dominica de divina misericordia',
				'de': 'Sonntag der Göttlichen Barmherzigkeit',
				'en': 'Sunday of the Divine Mercy'
			}],
			[21, 'easter', {
				'': 'Weltgebetstag um Geistliche Berufungen',
				'en': 'World Day of Prayer for Vocations'
			}],
			[42, 'easter', {
				'': 'Welttag der sozialen Kommunikationsmittel',
				'en': 'World Communications Day'
			}],
			[1, 1, {
				'': 'Dies Mundanus Pacis',
				'de': 'Weltfriedenstag',
				'en': 'World Day of Peace'
			}],
			[18, 1, {
				'': 'Initium Hebdomadæ Precibus pro Unitate Effundendis',
				'de': 'Beginn der Weltgebetswoche für die Einheit der Christen',
				'en': 'Start of the Week of Prayer for Christian Unity'
			}],
			[3, 'sunday', {
				'': 'Dominica Verbi Dei',
				'de': 'Sonntag des Wortes Gottes',
				'en': 'Sunday of the Word of God'
			}],
			[2, 2, {
				'': 'Dies Vitæ Consecratæ',
				'de': 'Tag des geweihten Lebens',
				'en': 'World Day for Consecrated Life'
			}],
			[8, 2, {
				'': 'Internationaler Tag des Gebets und der Reflexion gegen den Menschenhandel',
				'en': 'World Day of Prayer, Reflection and Action against Human Trafficking'
			}],
			[11, 2, {
				'': 'Dies Mundanus Ægrotorum',
				'de': 'Welttag der Kranken',
				'en': 'World Day of the Sick'
			}],
			[-601, 3, { //1st Friday
				'': 'Weltgebetstag der Frauen',
				'en': 'Women’s World Day of Prayer'
			}],
			[21, 4, {
				'': 'Dies obitus Papæ Francisci (2025)',
				'de': 'Todestag von Papst Franziskus (2025)',
				'en': 'Day of the death of Pope Francis (2025)'
			}],
			[8, 5, {
				'': 'Anniversarium electionis Papæ Leonis XIV (2025)',
				'de': 'Jahrestag der Wahl von Papst Leo XIV. (2025)',
				'en': 'Anniversary of the election of Pope Leo XIV (2025)'
			}],
			[18, 5, {
				'': 'Anniversarium inaugurationis Papæ Leonis XIV (2025)',
				'de': 'Jahrestag der Amtseinführung von Papst Leo XIV. (2025)',
				'en': 'Anniversary of the papal inauguration of Pope Leo XIV (2025)'
			}],
			[24, 5, {
				'': 'Gebetstag für die Kirche in China',
				'en': 'World Day of Prayer for the Church in China'
			}],
			[-122, 7, { //4th Sunday
				'': 'Dies Mundanus Avorum',
				'de': 'Welttag der Großeltern und der älteren Menschen',
				'en': 'World Day for Grandparents and the Elderly'
			}],
			[1, 9, {
				'': 'Weltgebetstag für die Bewahrung der Schöpfung',
				'en': 'World Day of Prayer for the Care of Creation'
			}],
			[14, 9, {
				'': 'Dies natali Papæ Leonis XIV (1955)',
				'de': 'Geburtstag von Papst Leo XIV. (1955)',
				'en': 'Birthday of Pope Leo XIV (1955)'
			}],
			[17, 9, 'Namenstag von Papst Leo XIV.'], //TODO oder anderes Datum?
			[-124, 9, { //last Sunday
				'': 'Welttag des Migranten und Flüchtlings',
				'en': 'World Day of Migrants and Refugees'
			}],
			[-118, 10, { //next to last Sunday
				'': 'Weltmissionssonntag',
				'en': 'World Mission Day'
			}],
			[18, 11, {
				'': 'Gebetstag für die Opfer von Missbrauch und Gewalt in der Kirche',
				'en': 'Day of Prayer for Victims and Survivors of Abuse in the Church'
			}],
			[33, 'sunday', {
				'': 'Dies Mundanus Pauperum',
				'de': 'Welttag der Armen',
				'en': 'World Day of the Poor'
			}]
		],
		groups: [
			[
				'nomen-iesu', 'sebastianus', 'ansgarius', 'maria-lourdes', 'francisca-romana',
				'isidorus', 'adalbertus', 'pius-v', 'ioannes-de-avila', 'pancratius',
				'maria-magdalena-pazzi', 'bernhardinus-senensis', 'ephraem', 'promartyr-roma', 'antonius-maria-zaccaria',
				'apollinaris', 'birgitta', 'eusebius', 'caietanus', 'stephanus-hungaria',
				'ludovicus', 'teresa-kalkutta', 'nomen-maria', 'laurentius-ruiz', 'ioannes-xxiii',
				'paulus-cruce', 'martinus-porres', 'margarita-scotia', 'clemens-i', 'ioannes-damasceni',
				'damasus-i'
			],
			[
				'hilarius', 'vincentius', 'hieronymus-emiliani', 'casimirus', 'cyrillus-hierosolymitanus',
				'franciscus-paola', 'martinus-i', 'ludovicus-maria-grignion-montfort', 'ioannis-i', 'rita-cascia',
				'augustinus-cantuariensis', 'marcellinus-petrus', 'cyrillus-alexandrinus', 'augustinus-zhao-rong',
					'maria-de-monte-carmelo',
				'sarbelius-makhluf', 'petrus-iulianus', 'teresia-benedicta', 'rosa-lima', 'petrus-claver',
				'robertus-bellarmino', 'venceslaus', 'ioannes-leonardus', 'ioannes-brebeuf-isaac-jogues', 'ioannes-paulus-ii',
				'catharina-alexandrina', 'nicolaus', 'maria-loreto', 'ioannes-kety'
			],
			[
				'raimundus-penyafort', 'angela-merici', 'septem-fundatores', 'gregorius-narcensis', 'ioannes-deo',
				'turibius', 'anselmus', 'fidelis-sigmaringen', 'ioseph-opifex', 'maria-fatima',
				'christophorus-magallanes', 'gregorius-vii', 'norbertus', 'ioannes-fisher-thomas-more', 'elisabeth-lusitania',
				'henricus', 'laurentius-brindisi', 'xystus', 'ioanna-francisca-chantal', 'ioannes-eudes',
				'ianuarius', 'bruno', 'callistus-i', 'margarita-maria-alacoque', 'ioannes-capestrano',
				'albertus-magnus', 'basilica-petrus-paulus', 'maria-guadalupe', 'silvester'
			],
			[
				'fabianus', 'blasius', 'iosephina-bakhita', 'petrus-damiani', 'patricius',
				'vincentius-ferrer', 'georgius', 'petrus-chanel', 'nereus-achilleus', 'beda-venerabilis',
				'paulus-vi', 'romualdus', 'paulinus-nolanus', 'maria-goretti', 'camillus-lellis',
				'petrus-chrysologus', 'basilica-maria', 'pontianus-hippolytus', 'ioseph-calasanz', 'hildegard-bingen',
				'cosmas-damianus', 'faustina-kowalska', 'dionysius', 'hedvigis', 'antonius-maria-claret',
				'gertrudis', 'columbanus', 'ioannes-didacus', 'petrus-canisius', 'thomas-becket'
			]
		]
	},

	150: {
		base: '',
		getEntries: function () {
			return [
				[14, 2, 'cyrillus-methodius', 1, ['pastor', 'plures']],
				[29, 4, 'catharina-senensis', 1, 'virgo'],
				[11, 7, 'benedictus-nursia', 1, ['religiosus', 'vir']],
				[23, 7, 'birgitta', 1, ['religiosus', 'mulier']],
				[9, 8, 'teresia-benedicta', 1, ['martyr', 'virgo']]
			];
		}
	},

	de: {
		base: '150',
		label: 'Regionalkalender für das deutsche Sprachgebiet',
		getEntries: function () {
			return [
				[7, 1, 'valentin-raetien', 3, 'pastor', 'Valentin'],
				[8, 1, 'severin-norikum', 3, 'pastor', 'Severin'],
				[21, 1], //agnes
				[21, 1, 'agnes', 3, ['martyr', 'mulier'], {
					texts: {
						cantica: {
							laudes: 'p',
							vespera: 'p'
						}
					}
				}],
				[21, 1, 'meinrad', 3, ['martyr', 'vir'], 'Meinrad'],
				[23, 1, 'heinrich-seuse', 3, ['religiosus', 'vir', 'beatus'], 'Heinrich Seuse'],
				[4, 2, 'rabanus-maurus', 3, 'pastor', 'Rabanus Maurus'],
				[24, 2, 'matthias', 1, ['apostolus', 'martyr']], //TODO apostolus2 ?
				[25, 2, 'walburga', 3, ['religiosus', 'mulier'], 'Walburga'],
				[6, 3, 'fridolin', 3, ['religiosus', 'vir'], 'Fridolin'],
				[9, 3, 'bruno-querfurt', 3, ['martyr', 'vir'], 'Bruno von Querfurt'],
				[14, 3, 'mathilde', 3, 'mulier', 'Mathilde'],
				[15, 3, 'klemens-maria-hofbauer', 3, 'pastor', 'Klemens Maria Hofbauer'],
				[17, 3, 'gertrud', 3, ['religiosus', 'mulier'], 'Gertrud'],
				[26, 3, 'liudger', 3, 'episcopus', 'Liudger'],
				[19, 4, 'leo-ix', 3, 'papa', 'Leo IX.'],
				[21, 4, 'konrad-parzham', 3, ['religiosus', 'vir'], 'Konrad von Parzham'],
				[27, 4, 'petrus-canisius', 3, 'doctor'],
				[4, 5, 'florian', 3, ['martyr', 'vir', 'plures'], 'Florian +'],
				[5, 5, 'godehard', 3, 'episcopus', 'Godehard'],
				[14, 5], //matthias
				[16, 5, 'johannes-nepomuk', 3, ['martyr', 'vir'], 'Johannes Nepomuk'],
				[21, 5, 'hermann-josef', 3, ['religiosus', 'vir'], 'Hermann Josef'],
				[31, 5], //visitatio
				[15, 6, 'vitus', 3, ['martyr', 'vir'], 'Vitus'],
				[16, 6, 'benno', 3, 'pastor', 'Benno'],
				//iosephmaria-escriva eigentlich nur DE+CH+FL, aber wohl auch alle Diözesen in AT und Bozen-Brixen
				//daher hier wohl am besten aufgehoben
				[26, 6, 'iosephmaria-escriva', 3, 'pastor', 'Josefmaria Escrivá de Balaguer'],
				[27, 6, 'hemma-gurk', 3, 'mulier', 'Hemma von Gurk'],
				[30, 6, 'otto-bamberg', 3, 'pastor', 'Otto'],
				[2, 7, 'visitatio', 1, 'maria', {
					texts: {
						lectio: {
							laudes: 'ioel-2-27-3-1',
							tertia: 'idt-14-7',
							sexta: 'tb-12-6',
							nona: 'sap-7-27-28',
							vespera: '1-pt-5-5-7'
						}
					}
				}],
				[4, 7, 'ulrich', 3, 'episcopus', 'Ulrich'],
				[7, 7, 'willibald', 3, 'episcopus', 'Willibald'],
				[8, 7, 'kilian', 3, ['martyr', 'vir', 'plures'], 'Kilian +'],
				[10, 7, 'knud-erich-olaf', 3, ['martyr', 'vir', 'plures'], 'Knud, Erich, Olaf'],
				[13, 7], //henricus
				[13, 7, 'heinrich-kunigunde', 3, ['vir', 'plures'], 'Heinrich II., Kunigunde'],
				[20, 7, 'margareta', 3, ['virgo', 'martyr'], 'Margareta'],
				[24, 7, 'christophorus', 3, ['martyr', 'vir'], 'Christophorus'],
				[31, 8, 'paulinus-trevirenis', 3, ['episcopus', 'martyr'], 'Paulinus'],
				[18, 9, 'lambertus', 3, ['pastor', 'martyr'], 'Lambertus'],
				[22, 9, 'mauritius', 3, ['martyr', 'vir', 'plures'], 'Mauritius +'],
				[24, 9, 'rupert-virgil', 3, ['pastor', 'plures'], 'Rupert, Virgil'],
				[25, 9, 'niklaus-flue', 3, 'vir', 'Niklaus von der Flüe'],
				[28, 9, 'lioba', 3, ['religiosus', 'mulier'], 'Lioba'],
				[16, 10, 'gallus', 3, ['religiosus', 'vir'], 'Gallus'],
				[20, 10, 'wendelin', 3, 'vir', 'Wendelin'],
				[21, 10, 'ursula', 3, ['martyr', 'mulier', 'plures'], 'Ursula +'],
				[31, 10, 'wolfgang', 3, 'episcopus', 'Wolfgang'],
				[3, 11, 'hubert', 3, 'episcopus', 'Hubert'],
				[3, 11, 'pirmin', 3, 'episcopus', 'Pirmin'],
				[6, 11, 'leonhard', 3, ['religiosus', 'vir'], 'Leonhard'],
				[7, 11, 'willibrord', 3, 'episcopus', 'Willibrord'],
				[15, 11, 'leopold', 3, 'vir', 'Leopold'],
				[16, 11], //margarita-scotia, gertrudis
				[16, 11, 'margarita-scotia', 3, ['mulier', 'misericordia']],
				[17, 11], //elisabeth-hungaria
				[17, 11, 'gertrudis', 3, 'virgo'],
				[19, 11, 'elisabeth-hungaria', 2, ['mulier', 'misericordia']],
				[26, 11, 'konrad-gebhard', 3, ['episcopus', 'plures'], 'Konrad, Gebhard'],
				[2, 12, 'luzius', 3, ['martyr', 'vir'], 'Luzius'],
				[4, 12, 'barbara', 3, ['martyr', 'mulier'], 'Barbara'],
				[5, 12, 'anno', 3, 'episcopus', 'Anno'],
				[13, 12], //lucia
				[13, 12, 'lucia', 3, ['martyr', 'virgo']],
				[13, 12, 'odilia', 3, ['religiosus', 'mulier'], 'Odilia'],
				[21, 12] //petrus-canisius
			];
		},
		notes: [
			[-101, 10, 'Erntedanksonntag'] //erster Sonntag
		],
		groups: [
			[
				'severin-norikum', 'agnes', 'fridolin', 'gertrud', 'konrad-parzham', 'godehard',
				'iosephmaria-escriva', 'kilian', 'lambertus', 'rupert-virgil', 'gallus',
				'wolfgang', 'konrad-gebhard', 'lucia'
			],
			[
				'valentin-raetien', 'agnes', 'walburga', 'bruno-querfurt', 'liudger',
				'florian', 'vitus', 'ulrich', 'margareta', 'paulinus-trevirenis',
				'mauritius', 'hubert', 'willibrord', 'leopold', 'barbara', 'odilia'
			],
			[
				'agnes', 'klemens-maria-hofbauer', 'johannes-nepomuk', 'benno', 'hemma-gurk',
				'willibald', 'heinrich-kunigunde', 'christophorus', 'niklaus-flue', 'lioba',
				'wendelin', 'leonhard', 'lucia'
			],
			[
				'meinrad', 'heinrich-seuse', 'rabanus-maurus', 'mathilde', 'leo-ix', 'hermann-josef',
				'otto-bamberg', 'knud-erich-olaf', 'ursula', 'pirmin', 'luzius',
				'anno', 'lucia'
			]
		]
	},
	'de-DE': {
		base: 'de',
		label: 'Deutschland',
		getEntries: function () {
			return [
				[5, 1, 'johannes-nepomuk-neumann', 3, 'episcopus', 'Johannes Nepomuk Neumann'], //?
				[19, 4, 'marcel-callo', 3, ['martyr', 'vir', 'beatus'], 'Marcel Callo'],
				[5, 6, 'bonifatius', 1, ['martyr', 'vir']],
				[3, 11, 'rupert-mayer', 3, ['pastor', 'beatus'], 'Rupert Mayer'], //?
				[4, 12, 'adolph-kolping', 3, ['pastor', 'beatus'], 'Adolph Kolping']
				//TODO laut DBK von Vollversammlung angenommen, stehen aber in keinem Direktorium:
				//22. Jan.: Vinzenz Pallotti
				//10. Mai: Damian de Veuster
				//20. Nov.: Korbinian
			];
		},
		notes: [
			[3, 'sunday'], //Sonntag des Wortes Gottes
			[-125, 1, { //letzter Sonntag
				'': 'Dominica Verbi Dei',
				'de': 'Sonntag des Wortes Gottes',
				'en': 'Sunday of the Word of God'
			}],
			[27, 1, 'Gedenktag für die Opfer des Nationalsozialismus'],
			[42, 'easter'], //Welttag der sozialen Kommunikationsmittel
			[-108, 9, { //zweiter Sonntag
				'': 'Welttag der sozialen Kommunikationsmittel',
				'en': 'World Communications Day'
			}],
			[3, 10, 'Tag der Deutschen Einheit'],
			[-118, 10], //Weltmissionssonntag
			[-122, 10, { //vierter Sonntag
				'': 'Weltmissionssonntag',
				'en': 'World Mission Day'
			}],
			[31, 10, 'Reformationstag (evangelisch)'],
			[9, 11, 'Gedenken an die Opfer der Schoah'],
			[-416, 11, 'Buß- und Bettag (evangelisch)'], //Mittwoch zwischen 16. und 22.
			[26, 12, 'Gebetstag für verfolgte und bedrängte Christen']
		],
		groups: [
			[],
			['marcel-callo'],
			['rupert-mayer', 'adolph-kolping'],
			['johannes-nepomuk-neumann']
		]
	},
	'de-AT': {
		base: 'de',
		label: 'Österreich',
		getEntries: function () {
			return [
				[50, 'easter'], //maria-ecclesia
				[50, 'easter', 'maria-ecclesia', 3, 'maria'],

				[10, 5, 'damian-veuster', 3, 'pastor', 'Damian de Veuster'],
				[21, 5, 'franz-jaegerstaetter', 3, ['martyr', 'vir', 'beatus'], 'Franz Jägerstätter'],
				[30, 5, 'otto-neururer', 3, ['martyr', 'vir', 'beatus'], 'Otto Neururer'],
				[12, 6, 'hildegard-burjan', 3, ['mulier', 'beatus'], 'Hildegard Burjan'],
				[12, 9, 'nomen-maria', 1, 'maria'],
				[13, 11, 'carl-lampert', 3, ['martyr', 'vir', 'beatus'], 'Carl Lampert'],
				[15, 11], //albertus-magnus, leopold
				[15, 11, 'leopold', 3, 'vir'],
				[16, 11, 'albertus-magnus', 3, 'doctor'],
				[8, 12, 'maria-immaculata', 0, ['maria', 'dominus'], { //+dominus um über 2. Adventsonntag zu stehen
					texts: {
						lectio: {
							vespera0: 'rm-8-29-30',
							laudes: 'is-43-1',
							tertia: 'eph-1-4',
							sexta: 'eph-1-11-12',
							nona: 'eph-5-25-27',
							vespera: 'rm-5-20-21'
						}
					}
				}],
				[9, 12], //maria-immaculata move, ioannes-didacus
				[9, 12, 'ioannes-didacus', 3, 'vir']
			];
		},
		extra: {
			'Kirchweihe (allg. Datum)': [
				[-614, 10, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia'] //Samstag vor drittem Sonntag
			]
		},
		notes: [
			[26, 10, 'Nationalfeiertag']
		],
		groups: [
			['maria-ecclesia', 'otto-neururer', 'hildegard-burjan'],
			['maria-ecclesia', 'franz-jaegerstaetter'],
			['maria-ecclesia', 'damian-veuster'],
			['maria-ecclesia', 'carl-lampert']
		]
	},
	'de-CH': {
		base: 'de',
		label: 'Schweiz (deutschsprachige Gebiete)',
		getEntries: function () {
			return [
				[16, 7, 'muttergottes-einsiedeln', 3, 'maria', 'Muttergottes von Einsiedeln'],
				[16, 8, 'theodor', 3, 'episcopus', 'Theodor'],
				[25, 9, 'niklaus-flue', 0, 'vir'],
				[30, 9], //hieronymus
				[30, 9, 'hieronymus', 3, 'doctor'],
				[30, 9, 'urs-viktor', 3, ['martyr', 'plures'], 'Urs, Viktor']
			];
		},
		notes: [
			[1, 8, 'Schweizer Nationalfeiertag'],
			[-115, 9, 'Eidgenössischer Dank-, Buss- und Bettag'] //dritter Sonntag
		],
		groups: [
			['hieronymus'],
			['theodor', 'hieronymus'],
			['urs-viktor'],
			['muttergottes-einsiedeln', 'hieronymus']
		]
	},

	'de-freiburg': {
		base: 'de-DE',
		groupLabel: 'Diözesen Deutschland',
		label: 'Erzdiözese Freiburg',
		episcopus: {
			'': 'Stephan',
			'la-x-noaccent': 'Stephanus',
			'la': 'Stéphanus'
		},
		getEntries: function () {
			return [
				[50, 'easter'], //maria-ecclesia
				[50, 'easter', 'pentecoste-secunda', 3, 'dominus', { //als Gedenktag Pfingsten wiederholen
					color: 'red',
					texts: {
						lectio: {
							laudes: 'act-5-30-32',
							vespera: 'eph-4-3-6'
						}
					},
					nameFallback: 'Pfingstmontag'
				}],
				[55, 'easter', 'maria-ecclesia', 2, 'maria'],

				[3, 1, 'oskar-saier', 3, ['defunctus', 'vir'], 'Oskar Saier'],
				//5. 1. Johannes Nepomuk Neumann (bereits in de-DE)
				//21. 1. Meinrad (bereits in de)
				[22, 1, 'vinzenz-pallotti', 3, 'fundator', 'Vinzenz Pallotti'],
				//23. 1. Heinrich Seuse (bereits in de)
				//6. 3. Fridolin von Säckingen (bereits in de)
				//15. 3. Klemens Maria Hofbauer (bereits in de)
				[17, 4, 'max-josef-metzger', 3, ['martyr', 'vir', 'beatus'], 'Max Josef Metzger'],
				//19. 4. Leo IX. (bereits in de)
				//24. 4. Fidelis von Sigmaringen (bereits in '')
				[26, 4, 'trudpert', 3, ['martyr', 'vir'], 'Trudpert'],
				//27. 4. Petrus Kanisius (bereits in de)
				[8, 5, 'ulrika-franziska-nisch-hegne', 3, ['virgo', 'beatus'], 'Ulrika Franziska Nisch von Hegne'],
				[27, 6, 'heimerad-messkirch', 3, 'pastor', 'Heimerad aus Meßkirch'],
				//4. 7. Ulrich (bereits in de)
				//8. 7. Kilian (bereits in de)
				[14, 7, 'ulrich-zell', 3, ['religiosus', 'vir'], 'Ulrich von Zell'],
				[15, 7], //bonaventura
				[15, 7, 'bernhard-baden', 3, ['vir', 'beatus'], 'Bernhard von Baden'],
				[17, 7, 'bonaventura', 2, 'doctor'],
				[21, 7, 'arbogast', 3, 'episcopus', 'Arbogast'],
				[21, 7, 'franziskus-maria', 3, ['pastor', 'beatus'], 'Franziskus Maria'],
				//9. 8. Theresia Benedicta vom Kreuz (bereits in 150)
				[12, 8, 'karl-leisner', 3, ['martyr', 'vir', 'beatus'], 'Karl Leisner'],
				//15. 8. Mariä Aufnahme in den Himmel (bereits in '')
				//20. 8. Bernhard von Clairvaux (bereits in '')
				[27, 8], //monica
				[27, 8, 'monica', 3, 'mulier'],
				[27, 8, 'gebhard', 3, 'episcopus', 'Gebhard'],
				[1, 9, 'pelagius', 3, ['martyr', 'vir'], 'Pelagius'],
				[1, 9, 'verena-zurzach', 3, 'virgo', 'Verena'],
				[9, 9, 'alfons-maria-eppinger', 3, ['virgo', 'beatus'], 'Alfons Maria'],
				//18. 9. Lambert (bereits in de)
				[22, 9, 'landelin', 3, ['martyr', 'vir'], 'Landelin'],
				//25. 9. Niklaus von der Flüe (bereits in de)
				//28. 9. Lioba (bereits in de)
				[9, 10, 'john-henry-newman', 3, 'pastor', 'John Henry Newman'],
				//16. 10. Gallus (bereits in de)
				//31. 10. Wolfgang (bereits in de)
				//3. 11. Pirmin (bereits in de)
				//3. 11. Rupert Mayer (bereits in de-DE)
				//15. 11. Albert der Große (bereits in '')
				[16, 11, 'otmar', 3, ['abbas', 'vir'], 'Otmar'],
				//23. 11. Kolumban (bereits in '')
				[26, 11, 'konrad', 1, 'episcopus', 'Konrad']
				//13. 12. Odilia (bereits in de)
			];
		},
		extra: {
			'Dekanat Mosbach-Buchen': [
				[9, 12, 'liborius-wagner', 3, ['martyr', 'vir', 'beatus'], 'Liborius Wagner']
			],
			'Hohenzollern': [
				[24, 4, 'fidelis-sigmaringen', 1, ['martyr', 'vir']]
			],
			'Baden': [
				[15, 7, 'bernhard-baden', 1, ['vir', 'beatus']]
			],
			'Breisgau': [
				[14, 7, 'ulrich-zell', 1, ['religiosus', 'vir']]
			],
			'Freiburg': [
				[18, 9, 'lambertus', 0, ['pastor', 'martyr']]
			],
			'Freiburger Münster': [
				[63, 'easter', 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia'],
				[23, 4, 'georgius', 2, ['martyr', 'vir']],
				[26, 8, 'alexander', 2, ['martyr', 'vir'], 'Alexander']
			],
			'Kirchweihe (allg. Datum)': [
				[-115, 10, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia'] //dritter Sonntag
			]
		},
		notes: [
			[30, 5, 'Jahrestag der Ernennung von Erzbischof Stephan Burger (2014)'],
			[29, 6, 'Jahrestag der Bischofsweihe von Erzbischof Stephan Burger (2014)'],
			[15, 8, 'Schutzpatronin der Erzdiözese Freiburg'],
			[26, 11, 'Zweiter Patron der Erzdiözese Freiburg'],
			[26, 12, 'Namenstag von Erzbischof Stephan Burger']
		],
		extraNotes: {
			'Hohenzollern': [
				[24, 4, 'Landespatron von Hohenzollern']
			],
			'Baden': [
				[15, 7, 'Landespatron von Baden']
			],
			'Breisgau': [
				[14, 7, 'Patron des Breisgaus']
			],
			'Freiburg': [
				[18, 9, 'Hauptpatron der Stadt Freiburg']
			]
		},
		groups: [
			[
				'vinzenz-pallotti', 'bernhard-baden', 'karl-leisner', 'gebhard',
				'pentecoste-secunda'
			],
			[
				'oskar-saier', 'ulrich-zell', 'monica', 'landelin', 'otmar',
				'pentecoste-secunda'
			],
			[
				'max-josef-metzger', 'franziskus-maria', 'monica', 'pelagius', 'alfons-maria-eppinger', 'john-henry-newman',
				'pentecoste-secunda'
			],
			[
				'trudpert', 'ulrika-franziska-nisch-hegne', 'heimerad-messkirch', 'arbogast', 'monica', 'verena-zurzach',
				'pentecoste-secunda'
			]
		]
	},
	'de-mainz': { //hauptsächlich als POC
		base: 'de-DE',
		label: 'Diözese Mainz',
		episcopus: {
			'': 'Peter',
			'la': 'Petrus'
		},
		getEntries: function () {
			return [
				//5. 1. Johannes Nepomuk Neumann (bereits in de-DE)
				[13, 1, 'gottfried-kappenberg', 3, ['religiosus', 'vir'], 'Gottfried von Kappenberg'],
				[23, 1, 'marianne-cope', 3, ['religiosus', 'mulier'], 'Marianne Cope'],
				//4. 2. Rabanus Maurus (bereits in de)
				[14, 2], //cyrillus-methodius
				[14, 2, 'cyrillus-methodius', 3, ['pastor', 'plures']],
				[14, 2, 'valentin-terni', 3, ['episcopus', 'martyr'], 'Valentin'],
				[23, 2], //polycarpus
				[23, 2, 'polycarpus', 3, ['martyr', 'vir']],
				[23, 2, 'willigis', 3, 'episcopus', 'Willigis'],
				[27, 4, 'petrus-canisius', 1, 'doctor'],
				[15, 5, 'rupert-bingen', 3, 'vir', 'Rupert von Bingen'],
				//2. 6. Marcellinus und Petrus (bereits in '')
				//5. 6. Bonifatius (bereits in de-DE)
				[10, 6, 'bardo', 3, 'episcopus', 'Bardo'],
				[21, 6], //aloisius-gonzaga
				[21, 6, 'aloisius-gonzaga', 3, ['religiosus', 'vir']],
				[21, 6, 'alban', 3, ['pastor', 'martyr'], 'Alban'],
				[27, 6, 'kreszenz-et-al', 3, ['episcopus', 'plures'], 'Kreszenz, Aureus, Theonest, Maximus'],
				[4, 7, 'dom-mainz', 1, ['ecclesia', 'extra'], 'Dom zu Mainz'],
				[1, 8], //alfonsus-liguori
				[1, 8, 'alfonsus-liguori', 3, 'doctor'],
				[1, 8, 'petrus-faber', 3, 'pastor', 'Petrus Faber'],
				[16, 8, 'rochus', 3, 'vir', 'Rochus von Montpellier'],
				[17, 9, 'hildegard-bingen', 2, ['religiosus', 'mulier']],
				//28. 9. Lioba (bereits in de)
				[16, 10, 'lullus', 3, 'episcopus', 'Lullus'],
				[26, 10, 'amandus', 3, 'episcopus', 'Amandus'],
				[29, 10, 'ferrutius', 3, ['martyr', 'vir'], 'Ferrutius'],
				[11, 11, 'martinus', 0, 'pastor'],
				[27, 11, 'bilhildis', 3, ['religiosus', 'mulier'], 'Bilhildis']
			];
		},
		extra: {
			'Dom zu Mainz': [
				[4, 7, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia']
			],
			'Kirchweihe (allg. Datum)': [
				[6, 9, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia']
			]
		},
		notes: [
			[18, 4, 'Jahrestag der Ernennung von Bischof Peter Kohlgraf (2017)'],
			[27, 8, 'Jahrestag der Bischofsweihe von Bischof Peter Kohlgraf (2017)'],
			[11, 11, 'Patron der Diözese Mainz']
		],
		groups: [
			['valentin-terni', 'willigis', 'aloisius-gonzaga', 'alfonsus-liguori'],
			['marianne-cope', 'cyrillus-methodius', 'polycarpus', 'rupert-bingen',
				'alban', 'alfonsus-liguori', 'rochus', 'lullus', 'amandus'],
			['gottfried-kappenberg', 'cyrillus-methodius', 'polycarpus',
				'aloisius-gonzaga', 'petrus-faber', 'ferrutius', 'bilhildis'],
			['cyrillus-methodius', 'polycarpus', 'bardo', 'aloisius-gonzaga',
				'kreszenz-et-al', 'alfonsus-liguori']
		]
	},
	'de-rottenburg-stuttgart': { //hauptsächlich als POC
		base: 'de-DE',
		label: 'Diözese Rottenburg-Stuttgart',
		episcopus: {
			'': 'Klaus'
		},
		getEntries: function () {
			return [
				//5. 1. Johannes Nepomuk Neumann (bereits in de-DE)
				//21. 1. Meinrad (bereits in de)
				//23. 1. Heinrich Seuse (bereits in de)
				[8, 5, 'ulrika-franziska-nisch-hegne', 3, ['virgo', 'beatus'], 'Ulrika Franziska Nisch von Hegne'],
				//4. 7. Ulrich (bereits in de)
				//8. 7. Kilian (bereits in de)
				[16, 7, 'irmengard', 3, ['religiosus', 'mulier', 'beatus'], 'Irmengard'],
				[27, 8], //monica
				[27, 8, 'monica', 3, 'mulier'],
				[27, 8, 'gebhard', 3, 'episcopus', 'Gebhard'],
				[6, 9, 'magnus-fuessen', 3, ['religiosus', 'vir'], 'Magnus von Füssen'],
				[11, 10, 'jakob-griesinger', 3, ['religiosus', 'vir', 'beatus'], 'Jakob Griesinger'],
				//16. 10. Gallus (bereits in de)
				[19, 10, 'dom-rottenburg', 1, ['ecclesia', 'extra'], 'Dom zu Rottenburg'],
				//31. 10. Wolfgang (bereits in de)
				//3. 11. Rupert Mayer (bereits in de-DE)
				[11, 11, 'martinus', 0, 'pastor'],
				[25, 11, 'elisabeth-reute', 3, ['religiosus', 'mulier', 'beatus'], 'Elisabeth von Reute'],
				[26, 11], //konrad-gebhard
				[26, 11, 'konrad', 3, 'episcopus', 'Konrad'],
				//4. 12. Adolph Kolping (bereits in de-DE)
				[15, 12, 'carlo-steeb', 3, ['pastor', 'beatus'], 'Carlo Steeb']
			];
		},
		extra: {
			'Dom zu Rottenburg': [
				[19, 10, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia']
			],
			'Kirchweihe (allg. Datum)': [
				[14, 10, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia']
			]
		},
		notes: [
			[2, 10, 'Jahrestag der Ernennung von Bischof Klaus Krämer (2024)'],
			[11, 11, 'Patron der Diözese Rottenburg-Stuttgart'],
			[1, 12, 'Jahrestag der Bischofsweihe von Bischof Klaus Krämer (2024)']
		],
		groups: [
			['gebhard', 'konrad', 'carlo-steeb'],
			['monica', 'magnus-fuessen', 'jakob-griesinger'],
			['irmengard', 'monica', 'elisabeth-reute'],
			['ulrika-franziska-nisch-hegne', 'monica']
		]
	}
};
})();
