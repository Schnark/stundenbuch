/*global Audio: true*/
/*Audio is actually the constructor for <audio> elements,
but we don't need it, so let's re-use its name for our purpose.
*/
/*global AudioContext, SpeechSynthesisUtterance, speechSynthesis*/
Audio =
(function () {
"use strict";

/*
Noten: a-n
Typen: +?~. (~ nicht implementiert)
Akzente: '>/
Trenner: ,;:|*\n
Notenschlüssel: 0-6, x
*/

function parseNotes (notes) {
	var re1 = /((?:[a-n][+?~.]?)+)(['>\/]?)|([,;:|*\nx0-6])/g,
		re2 = /([a-n])([+?~.]?)/g,
		match, n, t,
		text = [],
		ret = [];
	notes = notes.replace(/(^|\n)"((?:[^\n"]+|"?\n")*)"?(\n|$)/g, function (all, pre, t, post) {
		text = text.concat(t.replace(/[\n"]/g, ' ').split(/ +/));
		return pre && post ? '\n' : '';
	});
	while ((match = re1.exec(notes))) {
		n = match[1];
		if (n) {
			t = text.shift();
			ret.push({notes: [], accent: match[2] || ''});
			if (t && t !== '_') {
				ret[ret.length - 1].text = t;
			}
			while ((match = re2.exec(n))) {
				ret[ret.length - 1].notes.push([match[1], match[2] || '']);
			}
		} else {
			ret.push({notes: [[match[3], '']], accent: ''});
		}
	}
	if (!(/[0-6]/.test(ret[0].notes[0]))) {
		ret.unshift({notes: [['0', '']], accent: ''});
	}
	if (ret.length > 1 && ret[1].notes[0][0] === 'x') {
		ret[1].notes[0][0] = ret[0].notes[0][0] + 'x';
		ret.shift();
	}
	return ret;
}

//Anzeige
function Renderer (style) {
	this.setStyle(style || 'modern');
}

Renderer.prototype.setStyle = function (style) {
	this.style = style;
	if (style === 'gregorian') {
		this.barHeight = 30;
		this.gutter = 12;
		this.lines = 4;
		this.bottom = 'd';
	} else {
		this.barHeight = 32;
		this.gutter = 12;
		this.lines = 5;
		this.bottom = 'e';
	}
	this.height = this.barHeight + 2 * this.gutter;
	this.lineHeight = this.barHeight / (this.lines - 1);
};

Renderer.prototype.getLine = function (note) {
	return (note.charCodeAt(0) - this.bottom.charCodeAt(0)) / 2;
};

Renderer.prototype.getHeight = function (l) {
	return this.height - this.gutter - l * this.lineHeight;
};

Renderer.prototype.wrapSvg = function (w, image) {
	if (w) {
		return '<svg width="' + (w / 14) + 'em" height="' + (this.height / 14) + 'em"' +
			' viewBox="0 0 ' + w + ' ' + this.height + '"' +
			' stroke="currentColor" fill="none">' + image + '</svg>';
	}
	return '<svg class="background" width="0.07em" height="' + (this.height / 14) + 'em" viewBox="0 0 1 ' + this.height + '"' +
		' preserveAspectRatio="none" stroke="currentColor" fill="none">' + image + '</svg>';
};

Renderer.prototype.renderNoteHead = function (x, y, w, h, full) {
	var tag;
	if (this.style === 'modern') {
		tag = '<ellipse cx="' + (x + w / 2) + '" cy="' + y + '" rx="' + (w / 2) + '" ry="' + (h / 2) + '"';
	} else {
		tag = '<rect x="' + x + '" y="' + (y - h / 2) + '" rx="1" ry="1" width="' + w + '" height="' + h + '"';
	}
	if (full) {
		tag += ' stroke="none" fill="currentColor"';
	}
	return tag + ' />';
};

Renderer.prototype.renderDot = function (x, note) {
	var l = this.getLine(note), y = this.getHeight(l);
	if (Math.floor(l) === l) {
		y -= 2.5;
	} else {
		y -= 1;
	}
	return '<circle cx="' + x + '" cy="' + y + '" r="1" stroke="none" fill="currentColor" />';
};

Renderer.prototype.renderSingleNote = function (x, note, type, prev) {
	if (this.style === 'modern') {
		return this.renderSingleNoteModern(x, note, type);
	}
	return this.renderSingleNoteGregorian(x, note, type, prev);
};

Renderer.prototype.renderExtraLines = function (note, x, w) {
	var l = this.getLine(note), i, y, image = '';
	if (l <= -1) {
		for (i = -1; i >= l; i--) {
			y = this.getHeight(i);
			image += '<line x1="' + (x - 3) + '" y1="' + y + '" x2="' + (x + w + 3) + '" y2="' + y + '" />';
		}
	} else if (l >= this.lines) {
		for (i = this.lines; i <= l; i++) {
			y = this.getHeight(i);
			image += '<line x1="' + (x - 3) + '" y1="' + y + '" x2="' + (x + w + 3) + '" y2="' + y + '" />';
		}
	}
	return image;
};

Renderer.prototype.renderSingleNoteModern = function (x, note, type) {
	var y = this.getHeight(this.getLine(note)),
		h = this.lineHeight - 2, w = h * 1.5,
		image;
	if (type === '?') {
		x += 5;
	}
	image = this.renderNoteHead(x, y, w, h, type !== '+');
	image += this.renderExtraLines(note, x, w);
	h += 2;
	switch (type) {
	case '+':
		image +=
			'<line x1="' + x + '" y1="' + (y - 2 * h / 3) + '" x2="' + x + '" y2="' + (y + 2 * h / 3) + '" />' +
			'<line x1="' + (x + w) + '" y1="' + (y - 2 * h / 3) + '" x2="' + (x + w) + '" y2="' + (y + 2 * h / 3) + '" />';
		break;
	case '.':
		image += this.renderDot(x + w + 3, note);
		w += 7;
		break;
	case '?':
		image =
			'<path d="M' + (x - 2) + ',' + (y - 3 * h / 4) +
				' q-' + (h / 2) + ',' + (3 * h / 4) + ' 0,' + (3 * h / 2) + '" />' +
			image +
			'<path d="M' + (x + w + 2) + ',' + (y - 3 * h / 4) +
				' q' + (h / 2) + ',' + (3 * h / 4) + ' 0,' + (3 * h / 2) + '" />';
		w += 5;
	}
	return {
		image: image,
		w: x + w
	};
};

Renderer.prototype.renderSingleNoteGregorian = function (x, note, type/*, prev*/) {
	var y = this.getHeight(this.getLine(note)),
		h = 2 * this.lineHeight / 3, w = h, //h = this.lineHeight / 2 - 1 ?
		image;
	/*if (prev && prev < note) { //TODO
		x -= w;
	}*/
	if (type === '+') {
		w *= 3;
	}
	image = this.renderNoteHead(x, y, w, h, type !== '?');
	image += this.renderExtraLines(note, x, w);
	switch (type) {
	case '+':
		image +=
			'<line x1="' + x + '" y1="' + (y - h) + '" x2="' + x + '" y2="' + (y + h) + '" />' +
			'<line x1="' + (x + w) + '" y1="' + (y - h) + '" x2="' + (x + w) + '" y2="' + (y + h) + '" />';
		break;
	case '.':
		image += this.renderDot(x + w + 3, note);
		w += 7;
	}
	return {
		image: image,
		w: x + w
	};
};

Renderer.prototype.renderBackground = function (w) {
	var svg = [], i, y;
	for (i = 0; i < this.lines; i++) {
		y = this.getHeight(i);
		svg.push('<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '" />');
	}
	return svg.join('');
};

Renderer.prototype.renderSharp = function (x, line) {
	var y = this.getHeight(line);
	return '<line x1="' + (x + this.lineHeight / 2) + '" y1="' + (y - 2 * this.lineHeight / 3) + '" ' +
			'x2="' + (x + this.lineHeight / 2) + '" y2="' + (y + this.lineHeight) + '" />' +
		'<line x1="' + (x + this.lineHeight) + '" y1="' + (y - this.lineHeight) + '" ' +
			'x2="' + (x + this.lineHeight) + '" y2="' + (y + 2 * this.lineHeight / 3) + '" />' +
		'<line x1="' + x + '" y1="' + y + '" ' +
			'x2="' + (x + 3 * this.lineHeight / 2) + '" y2="' + (y - 2 * this.lineHeight / 3) + '" />' +
		'<line x1="' + x + '" y1="' + (y + 2 * this.lineHeight / 3) + '" ' +
			'x2="' + (x + 3 * this.lineHeight / 2) + '" y2="' + y + '" />';
};

Renderer.prototype.renderB = function (x, line) {
	var y = this.getHeight(line);
	if (this.style === 'modern') {
		return '<path d="M' + x + ',' + (y - 3 * this.lineHeight / 2) +
			' l0,' + (2 * this.lineHeight) +
			' q' + this.lineHeight + ',-' + (this.lineHeight / 2) + ' 0,-' + this.lineHeight + '" />';
	}
	return '<path d="M' + x + ',' + (y - 3 * this.lineHeight / 4) +
		' l0,' + this.lineHeight +
		' q' + (this.lineHeight / 2) + ',-' + (this.lineHeight / 4) + ' 0,-' + (this.lineHeight / 2) + '" />';
};

Renderer.prototype.renderSignModern = function (shift, b) {
	var w = 5, key = '';
	if (b) {
		if (shift !== 3) { //a-moll
			key += this.renderB(w, 2);
			w += this.lineHeight;
			if (shift !== 0) { //d-moll
				key += this.renderB(w, 3.5);
				w += this.lineHeight;
				if (shift !== 4) { //g-moll
					key += this.renderB(w, 1.5);
					w += this.lineHeight;
					if (shift !== 1) { //c-moll
						key += this.renderB(w, 3);
						w += this.lineHeight;
						if (shift !== 5) { //f-moll
							key += this.renderB(w, 1);
							w += this.lineHeight;
							if (shift !== 2) { //b-moll
								key += this.renderB(w, 2.5);
								w += this.lineHeight;
							} //es-moll
						}
					}
				}
			}
		}
	} else {
		if (shift !== 0) { //C-Dur
			key += this.renderSharp(w, 4);
			w += this.lineHeight;
			if (shift !== 3) { //G-Dur
				key += this.renderSharp(w, 2.5);
				w += this.lineHeight;
				if (shift !== 6) { //D-Dur
					key += this.renderSharp(w, 4.5);
					w += this.lineHeight;
					if (shift !== 2) { //A-Dur
						key += this.renderSharp(w, 3);
						w += this.lineHeight;
						if (shift !== 5) { //E-Dur
							key += this.renderSharp(w, 1.5);
							w += this.lineHeight;
							if (shift !== 1) { //H-Dur
								key += this.renderSharp(w, 3.5);
								w += this.lineHeight;
							} //Fis-Dur
						}
					}
				}
			}
		}
		w += 0.5 * this.lineHeight;
	}
	if (key) {
		key = this.wrapSvg(w, key + this.renderBackground(w));
	}
	w = 8 + 1.5 * this.lineHeight;
	return this.wrapSvg(w,
		'<path d="M5,' + (this.gutter + 3 * this.lineHeight) +
			' c0,-' + this.lineHeight + ' ' + (1.5 * this.lineHeight) + ',-' + this.lineHeight +
				' ' + (1.5 * this.lineHeight) + ',0' +
			' c0,' + this.lineHeight + ' -' + (1.5 * this.lineHeight + 4) + ',' + this.lineHeight +
				' -' + (1.5 * this.lineHeight + 4) + ',0' +
			' c0,-' + (0.5 * this.lineHeight) + ' ' + (-0.25 * this.lineHeight + 4) + ',-' + (0.75 * this.lineHeight) +
				' ' + (0.75 * this.lineHeight + 4) + ',-' + (2 * this.lineHeight) +
			' c' + this.lineHeight + ',-' + (0.75 * this.lineHeight) + ' 0,-' + (3 * this.lineHeight) +
				' 0,-' + this.lineHeight +
			' l0,' + (5 * this.lineHeight) +
			' c0,' + (this.lineHeight / 2) + ' -' + this.lineHeight + ',' + (this.lineHeight / 2) +
				' -' + this.lineHeight + ',0" />' +
		this.renderBackground(w)) + key;
};

Renderer.prototype.renderSignGregorian = function (shift, b) {
	var w, h, x;
	if (b) {
		w = this.lineHeight / 2 + 1;
		b = this.wrapSvg(w,
			this.renderB(2, this.getLine('i') % 3.5) + this.renderBackground(w)
		);
	} else {
		b = '';
	}
	h = this.getLine('j');
	x = 1;
	if (h !== Math.floor(h)) {
		h = this.getLine('m');
		x = 5;
	}
	//TODO bad placement for shift === 1, but is there a better?
	h = this.getHeight(h);
	return this.wrapSvg(x + 6,
		'<line x1="' + x + '" y1="' + (h - 3 * this.lineHeight / 4) + '" ' +
			'x2="' + x + '" y2="' + (h + 3 * this.lineHeight / 4) + '" stroke-width="2" />' +
		'<rect x="' + (x + 1) + '" y="' + (h - 3 * this.lineHeight / 4) + '" width="4" height="4" ' +
			'stroke="none" fill="currentColor" />' +
		(x === 1 ? '' : '<rect x="' + (x - 5) + '" y="' + (h - 2) + '" width="4" height="4" ' +
			'stroke="none" fill="currentColor" />') +
		'<rect x="' + (x + 1) + '" y="' + (h + 3 * this.lineHeight / 4 - 4) + '" width="4" height="4" ' +
			'stroke="none" fill="currentColor" />' +
		this.renderBackground(x + 6)
	) + b;
};

Renderer.prototype.renderBar = function (bar) {
	switch (bar) {
	case '[':
		return this.wrapSvg(5,
			'<line x1="1.5" y1="' + this.gutter + '" x2="1.5" y2="' + (this.height - this.gutter) + '" stroke-width="3" />' +
			this.renderBackground(5)
		);
	case ']':
		return this.wrapSvg(5,
			'<line x1="3.5" y1="' + this.gutter + '" x2="3.5" y2="' + (this.height - this.gutter) + '" stroke-width="3" />' +
			this.renderBackground(5)
		);
	case '\n':
		return '<br>';
	case '|':
		return this.wrapSvg(10,
			'<line x1="5" y1="' + this.gutter + '" x2="5" y2="' + (this.height - this.gutter) + '" />' +
			this.renderBackground(10)
		) + '<wbr>';
	case ':':
		return this.wrapSvg(10,
			'<line x1="5" y1="' + this.gutter + '" ' +
			'x2="5" y2="' + (this.height - this.gutter) + '" stroke-dasharray="1,1" />' +
			this.renderBackground(10)
		);
	case '*':
		return this.wrapSvg(10,
			'<line x1="5" y1="' + this.gutter + '" x2="5" y2="' + (this.height - this.gutter) + '" />' +
			'<text x="5" y="' + (this.height + 3) + '" text-anchor="middle" ' +
			'stroke="none" fill="currentColor">*</text>' +
			this.renderBackground(10)
		) + '<wbr>';
	case ',':
		return this.wrapSvg(10,
			'<line x1="5" y1="' + (this.gutter - this.lineHeight / 2) + '" ' +
			'x2="5" y2="' + (this.gutter + this.lineHeight / 2) + '" />' +
			this.renderBackground(10)
		) + '<wbr>';
	case ';':
		return this.wrapSvg(10,
			'<line x1="5" y1="' + (this.height / 2 - this.lineHeight) + '" ' +
			'x2="5" y2="' + (this.height / 2 + this.lineHeight) + '" />' +
			this.renderBackground(10)
		) + '<wbr>';
	}
};

Renderer.prototype.renderCluster = function (notes) {
	var image = '', i, w = 5, ret;
	for (i = 0; i < notes.length; i++) {
		ret = this.renderSingleNote(w, notes[i][0], notes[i][1], notes[i - 1] ? notes[i - 1][0] : '');
		image += ret.image;
		w = ret.w;
	}
	w += 5;
	w = Math.round(w);
	image += this.renderBackground(w);
	return {
		image: image,
		width: w
	};
};

Renderer.prototype.renderAccent = function (data, accent, text) {
	var image = data.image;
	switch (accent) {
		case '/':
			image += '<line x1="' + (data.width / 2 - 1) + '" y1="' + (this.height - 2) + '" ' +
				'x2="' + (data.width / 2 + 1) + '" y2="' + (this.height - 8) + '" />';
			break;
		case '>':
			image +=
				'<line x1="0" y1="4" x2="' + (data.width / 2 - 1) + '" y2="4" />' +
				'<line x1="' + (data.width / 2 - 1) + '" y1="4" x2="' + (data.width / 2 - 4) + '" y2="1" />' +
				'<line x1="' + (data.width / 2 - 1) + '" y1="4" x2="' + (data.width / 2 - 4) + '" y2="7" />';
			break;
		case '\'':
			image += '<line x1="' + (data.width / 2 - 1) + '" y1="7" x2="' + (data.width / 2 + 2) + '" y2="2" />';
	}
	if (text) { //TODO 7px?, besser platzieren
		image += '<text x="' + (data.width / 2) + '" y="' + (this.height - 1) + '" text-anchor="middle" font-size="6px" ' +
			'stroke="none" fill="currentColor">' + text + '</text>';
	}
	return this.wrapSvg(data.width, image);
};

Renderer.prototype.renderNote = function (note, index) {
	var firstNote = note.notes[0][0], shift, b;
	if (index === 0) {
		shift = Number(firstNote.charAt(0));
		b = firstNote.charAt(1) === 'x';
		this.bottom = String.fromCharCode(this.bottom.charCodeAt(0) + shift);
		if (this.style === 'modern') {
			return this.renderSignModern(shift, b);
		}
		return this.renderSignGregorian(shift, b);
	}
	if (firstNote < 'a' || firstNote > 'n') {
		return this.renderBar(firstNote);
	}
	return this.renderAccent(this.renderCluster(note.notes), note.accent, note.text);
};

Renderer.prototype.renderNotes = function (notes) {
	this.setStyle(this.style); //reset
	var background = this.wrapSvg(false, this.renderBackground(1)), svg;
	svg = '<span class="notes"><span class="notes-part">' + this.renderBar('[') +
		(
			'<!--background-->' +
			parseNotes(notes).map(this.renderNote.bind(this)).join('<!--background-->') +
			'<!--background-->'
		)
			.replace(/<wbr>/g, '<!--background--><wbr>')
			.replace(/<wbr><!--background--><br>/g, '<br>')
			.replace(/<br>/g, '</span><br></span><span class="notes"><span class="notes-part">')
			.replace(/<wbr>/g, '</span><wbr><span class="notes-part">') +
		this.renderBar(']') + '</span></span>';
	svg = svg
		.split('<span class="notes-part">')
		.map(function (part, i) {
			var n;
			if (i === 0) {
				return part;
			}
			n = part.split('<!--background-->').length - 1;
			return '<span class="notes-part" ' +
				'style="flex-grow: ' + n + '; ' +
				'max-width: ' + (n * (this.style === 'modern' ? 45 : 35) / 14) + 'em;">' +
				part;
		}.bind(this)).join('');
	return svg.replace(/<!--background-->/g, background);
};

//Audio
function Instrument () {
	this.baseFreq = 440;
	this.repeat = 4;
	this.setSpeed(1);
	this.setVolume(5);
}

Instrument.isAvailable = function () {
	return !!window.AudioContext;
};

Instrument.prototype.init = function () {
	var i, waveForm;

	if (this.ready) {
		return;
	}
	this.ready = true;

	this.context = new AudioContext();
	this.mainGain = this.context.createGain();
	this.mainGain.gain.value = this.volume / 100;
	this.mainGain.connect(this.context.destination);
	this.nextTime = 0;

	waveForm = this.context.createPeriodicWave(
		new Float32Array([0, 0.2, 0.15, 0.05]),
		new Float32Array(4)
	);

	this.nodes = [];
	for (i = 0; i < 2; i++) {
		this.nodes.push(this.createNode(waveForm));
	}
	this.currentNode = 0;
};

Instrument.prototype.createNode = function (waveForm) {
	var oscillator = this.context.createOscillator(),
		gain = this.context.createGain();

	gain.gain.value = 0;
	oscillator.setPeriodicWave(waveForm);
	oscillator.connect(gain);
	gain.connect(this.mainGain);
	oscillator.start();
	return {oscillator: oscillator, gain: gain};
};

Instrument.prototype.play = function (freq, duration) {
	duration = duration || 1;
	duration = duration * this.duration;
	if (this.context.currentTime > this.nextTime) {
		this.nextTime = this.context.currentTime;
	}

	this.nodes[this.currentNode].oscillator.frequency.setValueAtTime(freq, this.nextTime);
	this.nodes[this.currentNode].gain.gain.setValueAtTime(0, this.nextTime);
	this.nodes[this.currentNode].gain.gain.linearRampToValueAtTime(1, this.nextTime + duration * 0.5);
	this.nodes[this.currentNode].gain.gain.setValueAtTime(1, this.nextTime + duration * 0.7);
	this.nodes[this.currentNode].gain.gain.linearRampToValueAtTime(0, this.nextTime + duration * 1.2);

	this.currentNode = (this.currentNode + 1) % this.nodes.length;
	this.nextTime += duration;
};

Instrument.prototype.pause = function (duration) {
	if (this.context.currentTime > this.nextTime) {
		this.nextTime = this.context.currentTime;
	}
	this.nextTime += duration * this.duration;
};

Instrument.prototype.isPlaying = function () {
	return this.nextTime > this.context.currentTime;
};

Instrument.prototype.stop = function () {
	var i;
	for (i = 0; i < this.nodes.length; i++) {
		this.nodes[i].oscillator.frequency.cancelScheduledValues(0);
		this.nodes[i].gain.gain.cancelScheduledValues(0);
		this.nodes[i].gain.gain.value = 0;
	}
	this.nextTime = this.context.currentTime;
};

Instrument.prototype.setSpeed = function (speed) {
	this.duration = 0.5 / speed;
};

Instrument.prototype.setVolume = function (volume) {
	this.volume = volume;
	if (this.ready) {
		this.mainGain.gain.value = this.volume / 100;
	}
};

Instrument.prototype.setShift = function (shift, b) {
	if (b) {
		this.shiftB = true;
		this.shiftAll = [0, 2, 4, 5, 7, 9, 11][shift];
	} else {
		this.shiftB = false;
		this.shiftAll = [0, 1, 3, 5, 6, 8, 10][shift];
	}
};

Instrument.prototype.playNote = function (note, type) {
	var pause = {
			'\n': 0,
			':': 0,
			',': 0.5,
			';': 1,
			'|': 1.5,
			'*': 2
		},
		notes = {
			a: -12,
			b: -10,
			c: -9,
			d: -7,
			e: -5,
			f: -4,
			g: -2,
			h: 0,
			i: 2,
			j: 3,
			k: 5,
			l: 7,
			m: 8,
			n: 10
		}, freq, i;
	if (note in pause) {
		this.pause(pause[note]);
		return;
	}
	if (this.shiftB) {
		notes.b--;
		notes.i--;
	}
	freq = this.baseFreq * Math.pow(2, (notes[note] - this.shiftAll) / 12);
	if (type === '+') {
		for (i = 0; i < this.repeat; i++) {
			this.play(freq);
		}
	} else {
		this.play(freq, type === '.' ? 1.5 : 1);
	}
};

Instrument.prototype.playNotes = function (notes) {
	parseNotes(notes).forEach(function (note, i) {
		if (i === 0) {
			this.setShift(Number(note.notes[0][0].charAt(0)), note.notes[0][0].charAt(1) === 'x');
			return;
		}
		note.notes.forEach(function (n) {
			this.playNote(n[0], n[1]);
		}.bind(this));
	}.bind(this));
};

Instrument.prototype.setInterval = function (callback) {
	return setInterval(callback, this.duration * 500);
};

function Reader (el) {
	this.main = el;
	this.volume = 5;
	this.pauseSmall = 700;
	this.pause = 1200;
	this.setLang('');
	this.setSpeed(1);
}

Reader.isAvailable = function () {
	return !!window.speechSynthesis;
};

Reader.prototype.isEnabled = function () {
	return !!this.lang;
};

Reader.prototype.setLang = function (lang) {
	this.lang = lang.replace(/^la(-|$)/, 'it$1'); //we (probably) don't have "la", so use "it" instead
	this.rate = 60; //TODO sprachabhängig
};

Reader.prototype.setSpeed = function (speed) {
	this.speed = speed;
};

Reader.prototype.getTopElement = function () {
	var el = this.getNextElement(), bb;
	while (true) {
		if (!el) {
			return this.main.lastChild;
		}
		bb = el.getBoundingClientRect();
		if (bb.top >= 0 && bb.height > 0) {
			return el;
		}
		el = this.getNextElement(el);
	}
};

Reader.prototype.getNextElement = function (prev) {
	var next = prev ? prev.nextSibling : this.main.firstChild;
	if (prev && !next && prev.parentNode.nodeName === 'TD') {
		next = prev.parentNode.parentNode.nextSibling;
	}
	while (
		next && (
			(next.nodeName === 'TABLE' && next.className === 'twolang') ||
			next.nodeName === 'TBODY' ||
			next.nodeName === 'TR' ||
			next.nodeName === 'TD'
		)
	) {
		next = next[next.nodeName === 'TR' ? 'lastChild' : 'firstChild'];
	}
	return next;
};

Reader.prototype.getElementType = function (el) {
	var node = el.nodeName,
		cls = (el.className || '').replace(/ .*/, ''),
		nodeToType = {
			'#text': 'text',
			H2: 'silent',
			H3: 'silent',
			CITE: 'ignore',
			HR: 'pause-small',
			BR: 'space',
			SELECT: 'ignore'
			//TABLE: 'ignore' TODO?
		},
		classToType = {
			title: 'ignore',
			link: 'ignore',
			versus: 'ignore',
			additamentum: 'silent',
			'antiphona-1': 'ignore',
			flexa: 'ignore',
			asteriscus: 'pause',
			solidus: 'ignore',
			versiculum: 'ignore',
			responsum: 'ignore' //TODO pause-small?
		};
	return nodeToType[node] || classToType[cls] || 'children';
};

Reader.prototype.getDataFromElement = function (el) {
	var type = this.getElementType(el), ret;
	switch (type) {
	case 'ignore': return '';
	case 'space': return ' ';
	case 'silent': return el.textContent.length * this.rate / this.speed;
	case 'pause-small': return this.pauseSmall / this.speed;
	case 'pause': return this.pause / this.speed;
	case 'text': return el.textContent;
	case 'children':
		ret = [].map.call(el.childNodes, this.getDataFromElement.bind(this))
			.reduce(function (array, element) {
				if (Array.isArray(element)) {
					array = array.concat(element);
				} else if (typeof array[array.length - 1] === typeof element) {
					array[array.length - 1] += element;
				} else {
					array.push(element);
				}
				return array;
			}, []);
		if (ret.length === 0) {
			ret = '';
		} else if (ret.length === 1) {
			ret = ret[0];
		}
		return ret;
	}
};

Reader.prototype.read = function (callback, start) {
	this.callback = callback;
	this.skipWait = true;
	this.aborted = false;
	this.currentNode = start === true ? this.getTopElement() : (start || this.main.firstChild);
	this.readCurrentNode();
};

Reader.prototype.readCurrentNode = function () {
	if (this.currentNode) {
		this.speak(this.getDataFromElement(this.currentNode), function () {
			if (!this.aborted) {
				this.currentNode = this.getNextElement(this.currentNode);
				this.readCurrentNode();
			}
		}.bind(this));
	} else {
		this.callback();
	}
};

Reader.prototype.speak = function (data, callback) {
	if (Array.isArray(data)) {
		if (data.length === 1) {
			data = data[0];
		} else {
			this.speak(data.shift(), function () {
				if (!this.aborted) {
					this.speak(data, callback);
				}
			}.bind(this));
			return;
		}
	}
	if (!data) {
		data = 0;
	}
	if (typeof data === 'number') {
		this.timeout = setTimeout(callback, this.skipWait ? 0 : data);
	} else {
		this.skipWait = false;
		this.speakText(data, callback);
	}
};

Reader.prototype.speakText = function (text, callback) {
	var utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = this.lang;
	utterance.volume = this.volume / 20;
	utterance.rate = this.speed;
	utterance.onend = callback;
	speechSynthesis.speak(utterance);
};

Reader.prototype.stop = function () {
	this.aborted = true;
	speechSynthesis.cancel();
	clearTimeout(this.timeout);
	this.callback();
};

Reader.prototype.setVolume = function (volume) {
	this.volume = volume;
};

function Audio (input, output) {
	this.output = output;
	this.renderer = new Renderer();
	this.reader = new Reader(input);
	this.instrument = new Instrument();
	this.isPlaying = false;
}

Audio.prototype.init = function (notes) {
	this.readStart = true;
	if (notes === 'tts-start') {
		this.readStart = false;
		notes = '';
	} else if (notes === 'tts-visible') {
		notes = '';
	}
	this.notes = notes;
	if (notes) {
		this.output.innerHTML = this.renderer.renderNotes(notes);
		this.output.scrollTop = 0;
		return Instrument.isAvailable();
	}
	this.output.innerHTML = '';
	return this.reader.isEnabled() && Reader.isAvailable();
};

Audio.prototype.play = function (onEnd) {
	this.isPlaying = true;
	if (this.notes) {
		this.instrument.init();
		this.instrument.playNotes(this.notes);
		this.onEnd = onEnd;
		this.interval = this.instrument.setInterval(function () {
			if (!this.instrument.isPlaying()) {
				clearInterval(this.interval);
				this.isPlaying = false;
				onEnd();
			}
		}.bind(this));
	} else {
		this.reader.read(function () {
			this.isPlaying = false;
			onEnd();
		}.bind(this), this.readStart);
	}
};

Audio.prototype.stop = function () {
	if (this.notes) {
		clearInterval(this.interval);
		this.isPlaying = false;
		this.onEnd();
		this.instrument.stop();
	} else {
		this.reader.stop();
	}
};

Audio.prototype.setVolume = function (vol) {
	this.instrument.setVolume(vol);
	this.reader.setVolume(vol);
};

Audio.prototype.setConfig = function (key, val) {
	switch (key) {
	case 'style':
		this.renderer.setStyle(val);
		if (this.notes) {
			this.output.innerHTML = this.renderer.renderNotes(this.notes);
		}
		break;
	case 'lang':
		if (this.isPlaying) {
			this.stop();
		}
		this.reader.setLang(val);
		break;
	case 'speed':
		this.instrument.setSpeed(val);
		this.reader.setSpeed(val);
	}
};

return Audio;
})();