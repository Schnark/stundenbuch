/*global Day: true, Config, l10n, util*/
Day =
(function () {
"use strict";

function Day (y, m, d) {
	var now, result;
	if (y instanceof Date) {
		this.date = y;
	} else {
		y = y || '';
		if (typeof y === 'string') {
			result = /^(\d+)-(\d+)-(\d+)$/.exec(y);
			if (result) {
				y = result[1];
				m = result[2] - 1;
				d = result[3];
			} else {
				now = Day.now();
				y = now.y;
				m = now.m;
				d = now.d;
			}
		}
		this.date = new Date(Date.UTC(y, m, d));
	}
}

Day.DAY = 24 * 60 * 60 * 1000;

Day.getShift = function () {
	if (!window.Config) {
		return 0;
	}
	var start = Config.getConfig().get('dayStart') || '00:00';
	if (!(/^([01]?[0-9]|2[0-3]):[0-5]?[0-9]$/.test(start))) { //make leading 0 optional for old clients
		return 0;
	}
	start = start.split(':');
	start = Number(start[0]) + Number(start[1]) / 60;
	return start < 12 ? start : start - 24;
};

Day.now = function () {
	var now = new Date(), h, shift;
	h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600 + now.getMilliseconds() / 3600000;
	shift = Day.getShift();
	if (h < shift) {
		h += 24;
		now = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
	} else if (h > 24 + shift) {
		h -= 24;
		now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
	}
	return {
		y: now.getFullYear(),
		m: now.getMonth(),
		d: now.getDate(),
		h: h
	};
};

Day.getStart = function (y) {
	var day = new Day(y - 1, 11, 3);
	return day.prev(day.getDay());
};

Day.getChristmas = function (y) {
	return new Day(y - 1, 11, 25);
};

Day.getBaptism = function (y) {
	var day = new Day(y, 0, 7);
	return day.next((7 - day.getDay()) % 7);
};

Day.getEaster = function (y) {
	//https://de.wikipedia.org/wiki/Gaußsche_Osterformel#Eine_ergänzte_Osterformel
	var k = Math.floor(y / 100),
		m = 15 + Math.floor((3 * k + 3) / 4) - Math.floor((8 * k + 13) / 25),
		s = 2 - Math.floor((3 * k + 3) / 4),
		a = y % 19,
		d = (19 * a + m) % 30,
		r = Math.floor((d + Math.floor(a / 11)) / 29),
		og = 21 + d - r,
		sz = 7 - (y + Math.floor(y / 4) + s) % 7,
		oe = 7 - (og - sz) % 7;
	return (new Day(y, 2, 1)).next(og + oe - 1);
};

Day.notes = {};

Day.addNote = function (d, m, note) {
	var key = m + '/' + d;
	if (!Day.notes[key]) {
		Day.notes[key] = [];
	}
	Day.notes[key].push(note);
};

Day.initCalendar = function (name) {
	var extra, key, i;
	if ('base' in Day.calendars[name]) {
		Day.initCalendar(Day.calendars[name].base);
	}
	Day.addSpecialDays(Day.calendars[name].getEntries(Config.getConfig()), name !== '*');
	if (name === '*') {
		Day.calendarExtraEntries = [];
		Day.dayGroups = [[], [], [], []];
		l10n.setNames('papa', {});
		l10n.setNames('episcopus', {});
	}
	if (Day.calendars[name].notes) {
		for (i = 0; i < Day.calendars[name].notes.length; i++) {
			Day.addNote(Day.calendars[name].notes[i][0], Day.calendars[name].notes[i][1], Day.calendars[name].notes[i][2]);
		}
	}
	if (Day.calendars[name].extra) {
		extra = Config.getConfig().get('calendarExtra') || [];
		for (key in Day.calendars[name].extra) {
			Day.calendarExtraEntries.push(key);
			if (extra.indexOf(key) > -1) {
				Day.addSpecialDays(util.clone(Day.calendars[name].extra[key]), true);
			}
		}
	}
	if (Day.calendars[name].groups) {
		Day.dayGroups[0] = Day.dayGroups[0].concat(Day.calendars[name].groups[0]);
		Day.dayGroups[1] = Day.dayGroups[1].concat(Day.calendars[name].groups[1]);
		Day.dayGroups[2] = Day.dayGroups[2].concat(Day.calendars[name].groups[2]);
		Day.dayGroups[3] = Day.dayGroups[3].concat(Day.calendars[name].groups[3]);
	}
	if (Day.calendars[name].papa) {
		l10n.setNames('papa', Day.calendars[name].papa);
	}
	if (Day.calendars[name].episcopus) {
		l10n.setNames('episcopus', Day.calendars[name].episcopus);
	}
};

Day.init = function (cal, extra) {
	Day.notes = {};
	Day.initCalendar(cal);
	extra.split('\n')
		.map(function (line) {
			return line.trim();
		})
		.filter(function (line) {
			return line && line.charAt(0) !== '#';
		})
		.forEach(function (line) {
			line = line.split('|');
			line[0] = Number(line[0]);
			if (line[1] === 'e') {
				line[1] = 'easter';
			} else if (line[1] === 's') {
				line[1] = 'sunday';
			} else {
				line[1] = Number(line[1]);
			}
			if (line[3]) {
				line[3] = Number(line[3]);
			}
			if (line.length === 2) {
				Day.addSpecialDay(line[0], line[1]);
			} else if (line.length === 3) {
				Day.addNote(line[0], line[1], line[2]);
			} else if (line.length === 5) {
				Day.addSpecialDay(line[0], line[1], line[2], line[3], line[4].split(','), line[2], true);
			}
		});
};

Day.prototype.getYear = function () {
	return this.date.getUTCFullYear();
};

Day.prototype.getMonth = function () {
	return this.date.getUTCMonth();
};

Day.prototype.getDate = function () {
	return this.date.getUTCDate();
};

Day.prototype.getDay = function () {
	return this.date.getUTCDay();
};

Day.prototype.format = function (format) {
	return util.replaceFormatString(format || '%y-%0M-%0d', function (c) {
		switch (c) {
		case 'w': return this.getDay();
		case 'd': return this.getDate();
		case 'm': return this.getMonth();
		case 'y': return this.getYear();
		default: return false;
		}
	}.bind(this));
};

Day.prototype.prev = function (d) {
	if (d === undefined) {
		d = 1;
	}
	return new Day(new Date(Number(this.date) - d * Day.DAY));
};

Day.prototype.next = function (d) {
	if (d === undefined) {
		d = 1;
	}
	return new Day(new Date(Number(this.date) + d * Day.DAY));
};

Day.prototype.diffTo = function (other) {
	return Math.round((Number(this.date) - Number(other.date)) / Day.DAY);
};

Day.prototype.getCurrentHora = function () {
	var now = Day.now();
	if (now.y !== this.getYear() || now.m !== this.getMonth() || now.d !== this.getDate()) {
		return '';
	}
	now = now.h;
	if (now < 7) {
		return 'invitatorium';
	}
	if (now < 8.5) {
		return 'laudes';
	}
	if (now < 10.5) {
		return 'tertia';
	}
	if (now < 13.5) {
		return 'sexta';
	}
	if (now < 16.5) {
		return 'nona';
	}
	if (now < 20) {
		return 'vespera';
	}
	return 'completorium';
};

Day.prototype.calculateNumbers = function () {
	var y, d, specialData, special, config,
		start, christmas, baptism, movedBaptism, lent, easter, pentecost, end;
	if (this.calculated) {
		return;
	}
	this.calculated = true;
	config = Config.getConfig();

	this.tomorrow = this.next();

	y = this.getYear();
	if (this.diffTo(Day.getStart(y + 1)) >= 0) {
		y++;
	}

	this.yearLetter = ['c', 'a', 'b'][y % 3];
	this.yearLectio = ['ii', 'i'][y % 2];

	start = Day.getStart(y);
	christmas = Day.getChristmas(y);
	baptism = Day.getBaptism(y);
	movedBaptism = config.get('epiphaniasSunday') && this.diffTo(baptism) === 1 && this.getDate() <= 9;
	easter = Day.getEaster(y);
	lent = easter.prev(46);
	pentecost = easter.next(49);
	end = Day.getStart(y + 1);

	specialData = {
		d: this.getDate(),
		m: this.getMonth() + 1,
		e: this.diffTo(easter),
		//w: -1: first sunday in month, -2: first monday, ..., -8: second sunday, ...
		w: -(Math.floor(this.getDate() / 7) * 7 + this.getDay() + 1)
	};

	this.order = 7;

	if (this.diffTo(baptism) <= 0 || movedBaptism) {
		//Advent/Christmas
		d = this.diffTo(start);
		this.christmasDaySequence = this.diffTo(christmas);
		if (Config.getConfig().get('epiphaniasSunday')) {
			if (this.getMonth() === 0 && this.getDate() >= this.getDay() + 2) {
				this.christmasDaySequence = 19 + this.getDay();
			}
		} else {
			if (this.getMonth() === 0 && this.getDate() >= 6) {
				this.christmasDaySequence += 7;
			}
		}
		if (this.christmasDaySequence >= -8 && this.christmasDaySequence <= 7) {
			this.order = 5;
		}
		if (d % 7 === 0) {
			this.order = this.christmasDaySequence >= 0 ? 3 : 0;
			if (this.getMonth() === 11 && this.getDate() >= 26) {
				specialData.s = -1;
			} else if (this.getMonth() === 0) {
				if (this.getDate() >= 2 && this.getDate() <= (config.get('epiphaniasSunday') ? 8 : 5)) {
					specialData.s = -2;
				} else if (this.getDate() > 6) {
					specialData.s = 1;
				}
			}
		}
		if (movedBaptism) {
			specialData.s = 1;
			d = 1;
		}
		this.part = 1;
		this.color = 'violet';
		if (d === 14) {
			this.color = 'pink';
		}
		if (this.christmasDaySequence >= 0) {
			this.color = 'white';
		}
	} else if (this.diffTo(lent) < 0) {
		//Zeit im Jahreskreis
		d = this.diffTo(baptism);
		if (d % 7 === 0) {
			this.order = 3;
		}
		this.part = 0;
		this.color = 'green';
		/*if (config.get('bugCompat') && this.getMonth() === 0 && [7, 8].indexOf(this.getDate()) > -1) {
			this.part = 1;
			this.christmasDaySequence = this.diffTo(christmas) + 7;
		}*/
	} else if (this.diffTo(easter) < 0) {
		//Lent
		d = this.diffTo(lent) - 4;
		this.order = 5;
		if ((d % 7 === 0 || d >= 36)) {
			this.order = 0;
		}
		this.part = 2;
		this.color = 'violet';
		if (d === 21) {
			this.color = 'pink';
		}
	} else if (this.diffTo(pentecost) <= 0) {
		//Easter time
		d = this.diffTo(easter);
		if ((d % 7 === 0 || d < 7)) {
			this.order = d === 7 ? -1 : 0; //to celebrate eve of second sunday
		}
		this.part = 3;
		this.color = 'white';
	} else {
		//Zeit im Jahreskreis (2)
		d = 34 * 7 - end.diffTo(this);
		if (d % 7 === 0) {
			this.order = 3;
			specialData.s = 1 + (d / 7);
		}
		this.part = 0;
		this.color = 'green';
	}

	this.hasEve = (d % 7 === 0);
	this.dayInSequence = d;

	if (this.part === 0 && d % 7 === 6) {
		specialData.maria = (d + 1) / 7;
	}

	specialData = Day.getSpecialData(this, this.order, specialData);
	special = specialData.special;
	this.omittedNames = specialData.omittedNames;
	this.alternativeNames = specialData.alternativeNames;
	this.notes = specialData.notes;

	if (special) {
		this.hasEve = this.hasEve || special.eve || false;
		this.order = special.order;
	}
	if (special && special.color) {
		this.color = special.color;
	}
	this.special = special;
};

//order:
//0: Advents-, Fastensonntage, Sonntage der Osterzeit, Karwoche, Osteroktav
//1: Hochfeste
//2: Herrenfeste
//3: Sonntage
//4: Feste
//5: Fastenzeit/Hoher Advent/Weihnachtsoktav
//6: Gedenktage
//7: Rest

Day.prototype.getOrder = function () {
	this.calculateNumbers();
	return this.order;
};

Day.prototype.startsEve = function (order) {
	this.calculateNumbers();
	return this.hasEve && this.order < order;
};

Day.prototype.getEve = function () {
	this.calculateNumbers();
	return this.tomorrow.startsEve(this.order) ? new DayEve(this) : this;
};

Day.prototype.isEve = function () {
	return false;
};

Day.prototype.getType = function (original) {
	this.calculateNumbers();
	return (this.special && ((original && this.special.originalType) || this.special.type)) || '';
};

Day.prototype.hasTeDeum = function () {
	this.calculateNumbers();
	return (this.special && this.special.tedeum) ||
		(this.isSunday() && this.getPart() !== 2) ||
		(this.getPart() === 1 && this.getSubPart() === 3) ||
		(this.getPart() === 3 && this.getDayInSequence(-1) <= 7);
};

Day.prototype.hasSpecialCompletorium = function () {
	this.calculateNumbers();
	return this.special && this.special.completorium && this.getDay() !== 0;
};

//Dec 17 to Dec 24: -8 .. -1
//Octave of Christmas: 0 .. 7
//January before Epiphany: 8 .. 13 (11 if Epiphany is on Jan 6, end varies otherwise)
//Epiphany: 19
//January after Epiphany: 20 .. 27 (27 only for Baptism on Monday, otherwise Baptism is 26 or earlier)
Day.prototype.getDayInChristmasSequence = function (mod) {
	this.calculateNumbers();
	mod = mod || -1;
	if (mod < 0) {
		return this.christmasDaySequence;
	}
	return (this.christmasDaySequence % mod + mod) % mod;
};

Day.prototype.getDayInSequence = function (mod) {
	this.calculateNumbers();
	mod = mod || 28;
	if (mod < 0) {
		return this.dayInSequence;
	}
	return (this.dayInSequence % mod + mod) % mod;
};

Day.prototype.getPart = function () {
	this.calculateNumbers();
	return this.part;
};

Day.prototype.getSubPart = function () {
	var d;
	switch (this.getPart()) {
	case 1:
		d = this.getDayInChristmasSequence();
		if (d < -8) {
			return 0; //until Dec 16
		}
		if (d < -1) {
			return 1; //Dec 17 to Dec 23
		}
		if (d < 0) {
			return 2; //Dec 24
		}
		if (d < 8) {
			return 3; //Dec 25 to Jan 1
		}
		if (d < 19) {
			return 4; //Jan 2 to before Epiphany
		}
		return 5; //from Epiphany
	case 2:
		d = this.getDayInSequence(-1);
		if (d < 28) {
			return 0; //start of lent
		}
		if (d < 35) {
			return 1; //week 5
		}
		if (d < 39) {
			return 2;
		}
		return 3; //last days
	case 3:
		d = this.getDayInSequence(-1);
		if (d < (Config.getConfig().get('ascensionSunday') ? 42 : 39)) {
			return 0; //until before ascension
		}
		if (d < 43) {
			return 1;
		}
		return 2; //last week
	default: return 0;
	}
};

Day.prototype.getYearLetter = function () {
	this.calculateNumbers();
	return this.yearLetter;
};

Day.prototype.getYearLectio = function () {
	this.calculateNumbers();
	return this.yearLectio;
};

Day.prototype.isSunday = function () {
	return this.getDay() === 0;
};

Day.prototype.getSunday = function (/*eve*/) { //TODO
	if (!this.isSunday()) {
		return '';
	}
	return this.getYearLetter() +
			(this.getDayInSequence(-1) / 7) +
			['', '-a', '-q', '-p'][this.getPart()];
};

Day.prototype.getName = function () {
	this.calculateNumbers();
	return (this.special && this.special.name) || '';
};

Day.prototype.getAlternatives = function () {
	this.calculateNumbers();
	return this.alternativeNames;
};

Day.prototype.getOmitted = function () {
	this.calculateNumbers();
	return this.omittedNames;
};

Day.prototype.getAbout = function () {
	return l10n.has(this.getName() + '-introductio') ? this.getName() + '-introductio' : '';
};

Day.prototype.getNotes = function () {
	this.calculateNumbers();
	return this.notes;
};

Day.prototype.getColor = function (i) {
	this.calculateNumbers();
	return Array.isArray(this.color) ? this.color[i || 0] : this.color;
};

Day.prototype.getText = function (type, hora) {
	var part;
	this.calculateNumbers();
	switch (this.getPart()) {
	case 0: part = ''; break;
	case 1: part = this.getSubPart() < 3 ? 'adventus' : 'nativitatis'; break;
	case 2: part = 'quadragesimae'; break;
	case 3: part = 'paschale';
	}
	return Day.getText(this.special, type, hora, part);
};

function DayEve (day) {
	this.day = day;
	this.next = day.next();
}

DayEve.prototype.getYear = function () {
	return this.day.getYear();
};

DayEve.prototype.getMonth = function () {
	return this.day.getMonth();
};

DayEve.prototype.getDate = function () {
	return this.day.getDate();
};

DayEve.prototype.getDay = function () {
	return this.day.getDay();
};

DayEve.prototype.format = function (format) {
	return this.day.format(format);
};

DayEve.prototype.getCurrentHora = function () {
	return this.day.getCurrentHora();
};

DayEve.prototype.getOrder = function () {
	return this.day.getOrder();
};

DayEve.prototype.getEve = function () {
	return this;
};

DayEve.prototype.isEve = function () {
	return true;
};

DayEve.prototype.getType = function () {
	return this.next.getType();
};

DayEve.prototype.hasTeDeum = function () {
	return this.next.hasTeDeum();
};

DayEve.prototype.hasSpecialCompletorium = function () {
	return this.next.hasSpecialCompletorium();
};

DayEve.prototype.getDayInChristmasSequence = function (mod) {
	return this.day.getDayInChristmasSequence(mod);
};

DayEve.prototype.getDayInSequence = function (mod) {
	mod = mod || 28;
	if (mod < 0) {
		return this.next.getDayInSequence(mod) - 1;
	}
	return (this.next.getDayInSequence(mod) + mod - 1) % mod;
};

DayEve.prototype.getPart = function () {
	return this.next.getPart();
};

DayEve.prototype.getSubPart = function () {
	return this.next.getSubPart();
};

DayEve.prototype.getYearLetter = function () {
	return this.next.getYearLetter();
};

DayEve.prototype.getYearLectio = function () {
	return this.next.getYearLectio();
};

DayEve.prototype.isSunday = function () {
	return this.next.isSunday();
};

DayEve.prototype.getSunday = function (eve) {
	var sunday = this.next.getSunday();
	if (sunday && eve) {
		sunday += '-v';
	}
	return sunday;
};

DayEve.prototype.getName = function () {
	return this.next.getName();
};

DayEve.prototype.getAlternatives = function () {
	return this.next.getAlternatives();
};

DayEve.prototype.getOmitted = function () {
	return this.next.getOmitted();
};

DayEve.prototype.getAbout = function () {
	return this.next.getAbout();
};

DayEve.prototype.getNotes = function () {
	return this.next.getNotes();
};

DayEve.prototype.getColor = function (i) {
	return this.next.getColor(i);
};

DayEve.prototype.getText = function (type, hora) {
	return this.next.getText(type, hora + '0');
};

return Day;
})();
