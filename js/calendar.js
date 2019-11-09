/*global Day*/
(function () {
"use strict";

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

Day.calendars = {
	'*': {
		getEntries: function (config) {
			return [
				[1, 'sunday', 'baptismate', 1, 'dominus', {
					texts: {
						cantica: {
							vespera0: ['ps-135-i-vespera', 'ps-135-ii', '1-tim-3'],
							lectionis: ['ps-29', 'ps-66-i', 'ps-66-ii'],
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', ''],
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
					}
				}],
				[34, 'sunday', 'rex', 0, 'dominus', {
					type: '',
					texts: {
						cantica: {
							vespera0: ['ps-113', 'ps-117', 'apc-4-5'],
							lectionis: ['ps-2', 'ps-72-i', 'ps-72-ii'],
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
							vespera: ['ps-122', 'ps-127', 'eph-1']
						},
						lectio: {
							vespera0: '2-cor-8-9',
							laudes: 'dt-5-16',
							tertia: 'col-3-12-13',
							sexta: 'col-3-14-15',
							nona: 'col-3-17',
							vespera: 'phil-2-6-7'
						}
					}
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
					color: 'red', //TODO ['violet', 'red']?
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
					color: false,
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
					eve: false
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
			'': 'Franciscus',
			'de': 'Franziskus',
			'en': 'Francis',
			'la': 'Francíscus',
			'la-x-noaccent': 'Franciscus'
		},
		getEntries: function (config) {
			return [
				[50, 'easter', 'maria-ecclesia', 2, 'maria'],
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
				[12, 5, 'nereus-achilleus', 3, ['martyr', 'vir', 'plures']],
				[12, 5, 'pancratius', 3, ['martyr', 'vir']],
				[13, 5, 'maria-fatima', 3, 'maria'],
				[14, 5, 'matthias', 1, ['apostolus2', 'martyr']],
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
				[28, 6, 'irenaeus', 2, ['martyr', 'vir']],
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
				[29, 7, 'martha', 2, 'mulier'],
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
				[19, 9, 'ianuarius', 3, ['martyr', 'vir']],
				[20, 9, 'andreas-kim-taegon', 2, ['martyr', 'vir', 'plures']],
				[21, 9, 'matthaeus', 1, ['apostolus', 'martyr']],
				[23, 9, 'pius-pietrelcina', 2, 'pastor'],
				[26, 9, 'cosmas-damianus', 3, ['martyr', 'vir', 'plures']],
				[27, 9, 'vincentius-paul', 2, 'pastor'],
				[28, 9, 'venceslaus', 3, ['martyr', 'vir']],
				[28, 9, 'laurentius-ruiz', 3, ['martyr', 'vir', 'plures']],
				[29, 9, 'archangeli', 1, '', {
					texts: {
						cantica: {
							lectionis: ['ps-97', 'ps-103-i', 'ps-103-ii'],
							tertia: ['', '', ''],
							sexta: ['', '', ''],
							nona: ['', '', ''],
							vespera: ['ps-8', 'ps-138', 'apc-4-5']
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
				[22, 11, 'caecilia', 2, ['martyr', 'mulier']],
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
				[13, 12, 'lucia', 2, ['martyr', 'mulier']],
				[14, 12, 'ioannes-cruce', 2, 'doctor'],
				[21, 12, 'petrus-canisius', 3, 'doctor'],
				[23, 12, 'ioannes-kety', 3, ['misericordia', 'pastor']],
				[29, 12, 'thomas-becket', 3, ['episcopus', 'martyr']],
				[31, 12, 'silvester', 3, 'papa']
			];
		},
		groups: [
			[
				'nomen-iesu', 'sebastianus', 'ansgarius', 'maria-lourdes', 'francisca-romana',
				'isidorus', 'adalbertus', 'pius-v', 'pancratius', 'maria-magdalena-pazzi',
				'bernhardinus-senensis', 'ephraem', 'promartyr-roma', 'antonius-maria-zaccaria', 'apollinaris',
				'birgitta', 'eusebius', 'caietanus', 'stephanus-hungaria', 'ludovicus',
				'nomen-maria', 'laurentius-ruiz', 'ioannes-xxiii', 'paulus-cruce', 'martinus-porres',
				'margarita-scotia', 'clemens-i', 'ioannes-damasceni', 'damasus-i'
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
				'raimundus-penyafort', 'angela-merici', 'septem-fundatores', 'ioannes-deo', 'turibius',
				'anselmus', 'fidelis-sigmaringen', 'ioseph-opifex', 'maria-fatima', 'christophorus-magallanes',
				'gregorius-vii', 'norbertus', 'ioannes-fisher-thomas-more', 'elisabeth-lusitania', 'henricus',
				'laurentius-brindisi', 'xystus', 'ioanna-francisca-chantal', 'ioannes-eudes', 'ianuarius',
				'bruno', 'callistus-i', 'margarita-maria-alacoque', 'ioannes-capestrano', 'albertus-magnus',
				'basilica-petrus-paulus', 'maria-guadalupe', 'silvester'
			],
			[
				'fabianus', 'blasius', 'iosephina-bakhita', 'petrus-damiani', 'patricius',
				'vincentius-ferrer', 'georgius', 'petrus-chanel', 'nereus-achilleus', 'beda-venerabilis',
				'paulus-vi', 'romualdus', 'paulinus-nolanus', 'maria-goretti', 'camillus-lellis',
				'petrus-chrysologus', 'basilica-maria', 'pontianus-hippolytus', 'ioseph-calasanz', 'cosmas-damianus',
				'dionysius', 'hedvigis', 'antonius-maria-claret', 'gertrudis', 'columbanus',
				'ioannes-didacus', 'petrus-canisius', 'thomas-becket'
			]
		]
	},

	de: {
		base: '',
		label: 'Regionalkalender für das deutsche Sprachgebiet',
		getEntries: function () {
			return [
				[5, 1, 'johannes-nepomuk-neumann', 3, 'episcopus', 'Johannes Nepomuk Neumann'],
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
				[14, 2, 'cyrillus-methodius', 1, ['pastor', 'plures']],
				[24, 2, 'matthias', 1, ['apostolus2', 'martyr']],
				[25, 2, 'walburga', 3, 'mulier', 'Walburga'],
				[6, 3, 'fridolin', 3, ['religiosus', 'vir'], 'Fridolin'],
				[9, 3, 'bruno-querfurt', 3, ['martyr', 'vir'], 'Bruno'],
				[14, 3, 'mathilde', 3, 'mulier', 'Mathilde'],
				[15, 3, 'klemens-maria-hofbauer', 3, 'pastor', 'Klemens Maria Hofbauer'],
				[17, 3, 'gertrud', 3, ['religiosus', 'mulier'], 'Gertrud'],
				[26, 3, 'liudger', 3, 'episcopus', 'Liudger'],
				[19, 4, 'leo-ix', 3, 'papa', 'Leo'],
				[19, 4, 'marcel-callo', 3, ['martyr', 'vir', 'beatus'], 'Marcel Callo'],
				[21, 4, 'konrad-parzham', 3, ['religiosus', 'vir'], 'Konrad'],
				[27, 4, 'petrus-canisius', 3, 'doctor'],
				[29, 4, 'catharina-senensis', 1, 'virgo'],
				[4, 5, 'florian', 3, ['martyr', 'vir', 'plures'], 'Florian'],
				[5, 5, 'godehard', 3, 'episcopus', 'Godehard'],
				[14, 5], //matthias
				[16, 5, 'johannes-nepomuk', 3, ['martyr', 'vir'], 'Johannes Nepomuk'],
				[21, 5, 'hermann-josef', 3, ['religiosus', 'vir'], 'Hermann Josef'],
				[31, 5], //visitatio
				[5, 6, 'bonifatius', 1, ['martyr', 'vir']],
				[15, 6, 'vitus', 3, ['martyr', 'vir'], 'Vitus'],
				[16, 6, 'benno', 3, 'pastor', 'Benno'],
				[26, 6, 'iosephmaria-escriva', 3, 'pastor', 'Josefmaria'],
				[27, 6, 'hemma-gurk', 3, 'mulier', 'Hemma'],
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
				[8, 7, 'kilian', 3, ['martyr', 'vir', 'plures'], 'Kilian'],
				[10, 7, 'knud-erich-olaf', 3, ['martyr', 'vir', 'plures'], 'Knud, Erich, Olaf'],
				[11, 7, 'benedictus-nursia', 1, ['religiosus', 'vir']],
				[13, 7], //henricus
				[13, 7, 'heinrich-kunigunde', 3, ['vir', 'plures'], 'Heinrich, Kunigunde'],
				[20, 7, 'margareta', 3, ['virgo', 'martyr'], 'Margareta'],
				[23, 7, 'birgitta', 1, ['religiosus', 'mulier']],
				[24, 7, 'christophorus', 3, ['martyr', 'vir'], 'Christophorus'],
				[9, 8, 'teresia-benedicta', 1, ['martyr', 'virgo']],
				[31, 8, 'paulinus-trevirenis', 3, ['episcopus', 'martyr'], 'Paulinus'],
				[17, 9, 'hildegard-bingen', 3, ['religiosus', 'mulier'], 'Hildegard'],
				[18, 9, 'lambertus', 3, ['pastor', 'martyr'], 'Lambertus'],
				[22, 9, 'mauritius', 3, ['martyr', 'vir', 'plures'], 'Mauritius'],
				[24, 9, 'rupert-virgil', 3, ['pastor', 'plures'], 'Rupert, Virgil'],
				[25, 9, 'niklaus-flue', 3, 'vir', 'Niklaus von der Flüe'],
				[28, 9, 'lioba', 3, ['religiosus', 'mulier'], 'Lioba'],
				[16, 10, 'gallus', 3, ['religiosus', 'vir'], 'Gallus'],
				[20, 10, 'wendelin', 3, 'vir', 'Wendelin'],
				[21, 10, 'ursula', 3, ['martyr', 'mulier', 'plures'], 'Ursula'],
				[31, 10, 'wolfgang', 3, 'episcopus', 'Wolfgang'],
				[3, 11, 'hubert', 3, 'episcopus', 'Hubert'],
				[3, 11, 'rupert-mayer', 3, ['pastor', 'beatus'], 'Rupert Mayer'],
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
				[4, 12, 'adolph-kolping', 3, ['pastor', 'beatus'], 'Adolph Kolping'],
				[5, 12, 'anno', 3, 'episcopus', 'Anno'],
				[13, 12], //lucia
				[13, 12, 'lucia', 3, ['martyr', 'mulier']],
				[13, 12, 'odilia', 3, ['religiosus', 'mulier'], 'Odilia'],
				[21, 12] //petrus-canisius
			];
		},
		notes: [ //TODO mehrsprachig
			[1, 1, 'Weltfriedenstag'],
			[18, 1, 'Beginn der Weltgebetswoche für die Einheit der Christen'],
			[27, 1, 'Gedenktag für die Opfer des Nationalsozialismus'],
			[2, 2, 'Tag des geweihten Lebens'],
			[11, 2, 'Welttag der Kranken'],
			[-6, 3, 'Weltgebetstag der Frauen'],
			[-8, 3, 'Beginn der Woche der Brüderlichkeit'],
			[13, 3, 'Jahrestag der Wahl von Papst Franziskus'],
			[23, 4, 'Namenstag von Papst Franziskus'],
			[24, 5, 'Gebetstag für die Kirche in China'],
			[1, 9, 'Gebetstag für die Schöpfung'],
			[-1, 10, 'Erntedanksonntag'],
			[31, 10, 'Reformationstag (evangelisch)'],
			[9, 11, 'Gedenken an die Opfer der Schoah'],
			[33, 'sunday', 'Welttag der Armen'],
			[-18, 11, 'Buß- und Bettag (evangelisch)'],
			[17, 12, 'Geburtstag von Papst Franziskus'],
			[26, 12, 'Gebetstag für verfolgte und bedrängte Christen']
		],
		groups: [
			[
				'severin-norikum', 'agnes', 'fridolin', 'gertrud', 'konrad-parzham', 'godehard',
				'iosephmaria-escriva', 'kilian', 'lambertus', 'rupert-virgil', 'gallus',
				'wolfgang', 'konrad-gebhard', 'lucia'
			],
			[
				'valentin-raetien', 'agnes', 'walburga', 'bruno-querfurt', 'liudger', 'marcel-callo',
				'florian', 'vitus', 'ulrich', 'margareta', 'paulinus-trevirenis',
				'mauritius', 'hubert', 'willibrord', 'leopold', 'barbara',
				'odilia'
			],
			[
				'agnes', 'klemens-maria-hofbauer', 'johannes-nepomuk', 'benno', 'hemma-gurk',
				'willibald', 'heinrich-kunigunde', 'christophorus', 'niklaus-flue', 'lioba',
				'wendelin', 'rupert-mayer', 'leonhard', 'adolph-kolping', 'lucia'
			],
			[
				'johannes-nepomuk-neumann', 'meinrad', 'heinrich-seuse', 'rabanus-maurus', 'mathilde',
				'leo-ix', 'hermann-josef', 'otto-bamberg', 'knud-erich-olaf', 'hildegard-bingen',
				'ursula', 'pirmin', 'luzius', 'anno', 'lucia'
			]
		]
	},
	'de-DE': {
		base: 'de',
		getEntries: function () {
			return [];
		},
		notes: [
			[-8, 9, 'Welttag der sozialen Kommunikationsmittel'], //anderswo an anderem Datum
			[3, 10, 'Tag der Deutschen Einheit'],
			[-22, 10, 'Weltmissionssonntag'] //anderswo an anderem Datum
		]
	},
	'de-freiburg': {
		base: 'de-DE',
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
					}
				}],
				[55, 'easter', 'maria-ecclesia', 3, 'maria'],

				[3, 1, 'oskar-saier', 3, ['defunctus', 'vir'], 'Oskar Saier'],
				[22, 1, 'vinzenz-pallotti', 3, 'fundator', 'Vinzenz Pallotti'],
				[27, 2, 'gregor-narek', 3, 'doctor', 'Gregor'],
				//? [24, 3, 'oscar-romero', 3, ['martyr', 'vir'], 'Oscar Romero'],
				[26, 4, 'trudpert', 3, ['martyr', 'vir'], 'Trudpert'],
				[8, 5, 'ulrika-franziska-nisch-hegne', 3, ['virgo', 'beatus'], 'Ulrika Franziska Nisch'],
				[10, 5, 'johannes-avila', 3, 'doctor', 'Johannes'],
				[27, 6, 'heimerad-messkirch', 3, 'pastor', 'Heimerad'],
				[14, 7, 'ulrich-zell', 3, ['religiosus', 'vir'], 'Ulrich'],
				[15, 7], //bonaventura
				[15, 7, 'bonaventura', 3, 'doctor'],
				[15, 7, 'bernhard-baden', 3, ['vir', 'beatus'], 'Bernhard'],
				[21, 7, 'arbogast', 3, 'episcopus', 'Arbogast'],
				[12, 8, 'karl-leisner', 3, ['martyr', 'vir', 'beatus'], 'Karl'],
				[27, 8], //monica
				[27, 8, 'monica', 3, 'mulier'],
				[27, 8, 'gebhard', 3, 'episcopus', 'Gebhard'],
				[1, 9, 'pelagius', 3, ['martyr', 'vir'], 'Pelagius'],
				[1, 9, 'verena-zurzach', 3, 'virgo', 'Verena'],
				[5, 9, 'teresa-kalkutta', 3, ['misericordia', 'mulier'], 'Teresa'],
				[22, 9, 'landelin', 3, ['martyr', 'vir'], 'Landelin'],
				//[26, 9, 'paulus-vi', 3, 'papa'],
				[9, 10, 'john-henry-newman', 3, 'pastor', 'John Henry'],
				[16, 11, 'otmar', 3, ['abbas', 'vir'], 'Otmar'],
				[26, 11, 'konrad', 1, 'episcopus', 'Konrad']
			];
		},
		notes: [
			[30, 5, 'Jahrestag der Ernennung von Erzbischof Stephan Burger'],
			[29, 6, 'Jahrtag der Bischofsweihe und Amtseinführung von Erzbischof Stephan Burger'],
			[9, 8, 'Geburtstag von Erzbischof em. Robert Zollitsch'],
			[26, 12, 'Namenstag von Erzbischof Stephan Burger']
		],
		extra: {
			'Dekanat Mosbach-Buchen': [
				[9, 12, 'liborius-wagner', 3, ['martyr', 'vir', 'beatus'], 'Liborius Wagner']
			],
			'Hohenzollern': [
				[24, 4, 'fidelis-sigmaringen', 1, ['martyr', 'vir']]
			],
			'Baden': [
				[15, 7, 'bernhard-baden', 1, ['vir', 'beatus']],
				[17, 7, 'bonaventura', 3, 'doctor']
			],
			'Breisgau': [
				[14, 7, 'ulrich-zell', 1, ['religiosus', 'vir']]
			],
			'Freiburg': [
				[18, 9, 'lambertus', 0, ['pastor', 'martyr']]
			],
			'Freiburger Münster': [
				[63, 'easter', 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia']
			],
			'Kirchweihe (allg. Datum)': [
				[-15, 10, 'anniversarium-dedicationis-ecclesiae', 0, 'ecclesia']
			]
		},
		groups: [
			[
				'vinzenz-pallotti', 'trudpert', 'bernhard-baden', 'karl-leisner', 'gebhard', 'teresa-kalkutta',
				'pentecoste-secunda', 'maria-ecclesia'
			],
			[
				'oskar-saier', 'johannes-avila', 'ulrich-zell', 'bonaventura', 'monica', 'landelin', 'otmar',
				'pentecoste-secunda', 'maria-ecclesia'
			],
			[
				'gregor-narek', 'bonaventura', 'monica', 'pelagius', 'john-henry-newman',
				'pentecoste-secunda', 'maria-ecclesia'
			],
			[
				'ulrika-franziska-nisch-hegne', 'heimerad-messkirch', 'bonaventura', 'arbogast', 'monica',
				'verena-zurzach', 'pentecoste-secunda', 'maria-ecclesia'
			]
		]
	}
};
})();
