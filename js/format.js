/*global formatSequence: true, audioManager, util, l10n, Config*/
formatSequence =
(function () {
"use strict";

function getFlexaAsteriscus (type, post) {
	var flexaAsteriscus = Config.getConfig().get('flexaAsteriscus') || '+|*|<br>', char;
	flexaAsteriscus = flexaAsteriscus.split('|');
	if (type === 'flexa') {
		char = flexaAsteriscus[0];
	} else {
		char = flexaAsteriscus[1];
	}
	return '<span class="' + type + '"> ' + char + (post || '') + '</span>' + (post === undefined ? flexaAsteriscus[2] : '');
}

function getRV (type) {
	return {
		R: '<span class="responsum">\u211f </span>',
		R2: '<span class="responsum"> – \u211f</span>',
		V: '<span class="versiculum">\u2123 </span>'
	}[type];
}

function formatTitle (data) {
	var title = l10n.get(data.title),
		name,
		additional = [];
	name = data.date.getName();
	additional.push(data.date.format(l10n.get('date-format')));
	l10n.setDynamicData('horaTSN', ['tertia', 'sexta', 'nona'].indexOf(data.title) > -1);
	l10n.setDynamicData('nomen', '');
	if (name) {
		l10n.setDynamicName(name);
		additional.push(
			l10n.get(name, l10n.get('titulus')) +
			(data.date.isEve() ? ' (' + l10n.get('vespera-pridiana') + ')' : '')
		);
	} else if (data.date.isSunday()) {
		additional.push(
			l10n.formatSunday(data.date.getSunday()) +
			(data.date.isEve() ? ' (' + l10n.get('vespera-pridiana') + ')' : '')
		);
	}
	return '<div class="title ' + data.date.getColor(data.eve ? 1 : 0) + '" ' +
		'data-title="' + title + ' – ' + additional.join(' – ') + '">' + //TODO – ?
		'<h1>' + title + '</h1>' +
		'<p>' + additional.join('<br>') + '</p>' +
		'</div>';
}

function formatTitleMonth (data) {
	var title = data.date.format(l10n.get('date-format-month'));
	return '<div class="title ' + data.color + '" data-title="' + title + '">' +
		'<h1>' + title + '</h1>' +
		'</div>';
}

function formatRaw (data) {
	return data.html;
}

function formatLink (data) {
	if (!data.href) {
		return '';
	}
	return '<p class="link"><a href="' + data.href + '"' + (data.cls ? ' class="' + data.cls + '"' : '') + '>' +
		(data.labelHtml || l10n.get(data.label)) + '</a></p>';
}

function formatNotes (data) {
	if (!data.notes || !data.notes.length) {
		return '';
	}
	return '<p class="additamentum">' + data.notes.join('\n').replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</p>';
}

function formatBlock (text, audio, type, easter, debug) {
	var lines, i;

	function addCite (all, cite) {
		return '<cite>(' + cite.split('; ').map(function (cite) {
			if (cite.replace(/\d+\S*/g, '').length > 30) {
				return cite;
			}
			return '<span>' + cite + '</span>';
		}).join('; ') + ')</cite>';
	}

	lines = text.replace(/<([^<>]*)>/g, addCite).split('\n');
	if (lines.length >= 2 && lines[1] === '' && lines[0].charAt(0) !== '!') {
		lines[0] = '<h2>' + lines[0] + '</h2>';
		lines[1] = '<p>';
	} else {
		lines.unshift('', '<p>');
	}
	for (i = 2; i < lines.length; i++) {
		if (lines[i] === '') {
			lines[i] = '</p><p>';
		} else {
			lines[i - 1] += '<br>';
		}
	}
	lines.push('</p>');
	text = lines.join('').replace(/<p><br>/g, '<p>');
	text = text
		.replace(/<p>-<\/p>/g, '<hr>')
		.replace(/<p>!/g, '<p class="additamentum">')
		.replace(/<br>!([^<]*)</g, '<br><span class="additamentum">$1</span><')
		.replace(/<p>=(.*?)<\/p>/g, '<h3>$1</h3>')
		.replace(/__(.*?)__/g, '<em>$1</em>')
		.replace(/ –/g, '&nbsp;–')
		.replace(/ \*/g, getFlexaAsteriscus('asteriscus', ''))
		.replace(/ \/\/ ?/g, ' <span class="solidus"><br></span>')
		.replace(/ \//g, '<span class="solidus"> /</span>')
		.replace(/<p>([1-9]\S* )/g, '<p><sup class="versus">$1</sup>')
		.replace(/<br>([1-9]\S* )/g, (text.indexOf('{antiphona}') > -1 ? '<br>' : ' ') + '<sup class="versus">$1</sup>')
		.replace(/<p>\{antiphona\}<\/p>/g, '')
		.replace(/<p>\{antiphona\}/g, '<p class="antiphona"><span class="antiphona-1">' + l10n.get('antiphona') + ' </span>')
		.replace(/<p>~(\S+) (.*?)<\/p>/g, function (all, msg, label) {
			return formatLink({href: '?catalogus,' + msg, labelHtml: label});
		});
	switch (type) {
	case 'responsorium-lectionis':
		text = formatResponsoriumLectionis(text, easter);
		break;
	case 'responsorium':
		text = formatResponsorium(text, easter);
		break;
	case 'versus':
		text = formatVersus(text, easter);
		break;
	default:
		text = formatRV(text);
	}
	if (audio) {
		text = text.replace('</h2>',
			'&nbsp;<span class="audio" data-audio="' + util.htmlEscape(JSON.stringify(audio)) + '">♪</span></h2>');
	}
	if (debug) {
		text = '<pre>' + debug + '</pre>' + text;
	}
	return text;
}

function formatCanticum (canticum, antiphona, audio, removeAnt, easter, debug) {
	var alleluia = l10n.get('alleluia'),
		flexa = getFlexaAsteriscus('flexa'),
		asteriscus = getFlexaAsteriscus('asteriscus'),
		rePart = '((?:<sup[^<]+>[^<]+<\\/sup>)?[^<]*)',
		html, pos, pos2;

	if (antiphona) {
		antiphona = l10n.get(antiphona);
		if (easter) {
			if (antiphona.slice(-1) === ',') {
				alleluia = alleluia.charAt(0).toLowerCase() + alleluia.slice(1);
			}
			antiphona += ' ' + alleluia;
		}
		antiphona = antiphona.replace(/\|.*$/, ''); //to allow omitting the alleluia
	}
	l10n.setDynamicData('antiphona', antiphona);

	canticum = l10n.get(canticum).replace(
		/\nR: ([^\n]+)/g,
		Config.getConfig().get('rvMode') === 'single' ? '' : '{$1}'
	);
	if (removeAnt) {
		pos = canticum[removeAnt < 0 ? 'lastIndexOf' : 'indexOf']('\n{antiphona}');
		if (pos > -1) {
			pos2 = canticum.indexOf('\n', pos + 1);
			canticum = canticum.slice(0, pos) + (pos2 > -1 ? canticum.slice(pos2 + 1) : '');
		}
	}

	html = formatBlock(canticum, audio)
		.replace(
			new RegExp('<p>' + rePart + '<br>' + rePart + '<br>' + rePart + '</p>', 'g'),
			'<p>$1' + flexa + '$2' + asteriscus + '$3</p>'
		)
		.replace(
			new RegExp('<p>' + rePart + '<br>' + rePart + '</p>', 'g'),
			'<p>$1' + asteriscus + '$2</p>'
		)
		.replace(
			new RegExp('<p>' + rePart + '</p>', 'g'),
			'<p class="canticum-responsum">$1</p>'
		)
		.replace(
			/\{(.+?)\}(.*?)(<br>|<\/p>)/g,
			function (all, resp, rest, html) {
				if (html === '<br>') {
					return rest + '<br><span class="canticum-responsum">' + getRV('R') + resp + '</span><br>';
				}
				return rest + '<br>' + getRV('R') + resp + '</p>';
			}
		);

	if (!Config.getConfig().get('psOratio')) { //last or second-to-last element
		pos = html.lastIndexOf('<p class="additamentum">');
		if (pos !== -1) {
			if (html.indexOf('</p>', pos) === html.length - 4) {
				html = html.slice(0, pos);
			} else {
				pos2 = html.indexOf('</p><p class="antiphona">', pos);
				if (pos2 !== -1 && html.indexOf('</p>', pos2 + 1) === html.length - 4 && html.indexOf('</p>', pos) === pos2) {
					html = html.slice(0, pos) + html.slice(pos2);
				}
			}
		}
	}

	if (debug) {
		html = '<pre>' + debug + '</pre>' + html;
	}
	return html;
}

function formatResponsoriumLectionis (responsorium, easter) {
	var re = /<p>R (.+)<br>(.+)<\/p><p>V (.+)<br>(.+)<\/p>/,
		mode = Config.getConfig().get('rvMode'),
		asteriscus = getFlexaAsteriscus('asteriscus', ' '),
		r = getRV('R'),
		v = getRV('V');
	if (easter) {
		responsorium = responsorium.replace(
			re,
			function (all, one, two, three, four) {
				var alleluia = l10n.get('alleluia');
				if (two.slice(-1) === ',') {
					alleluia = alleluia.charAt(0).toLowerCase() + alleluia.slice(1);
				}
				return '<p>R ' + one + '<br>' + two + ' ' + alleluia + '</p>' +
					'<p>V ' + three + '<br>' + four + ' ' + alleluia + '</p>';
			}
		);
	}
	if (!(/((?:<p>|<br>)[RV] .*){3}/.test(responsorium)) && re.test(responsorium)) {
		switch (mode) {
		case 'single': return responsorium.replace(re,
			'<p>$1<br>$2</p><p>$3<br>$4</p>');
		case 'expand': return responsorium.replace(re,
			'<p>' + v + '$1' + asteriscus + '$2<br>' + r + '$1' + asteriscus + '$2</p>' +
			'<p>' + v + '$3<br>' + r + '$4</p>');
		default: return responsorium.replace(re,
			'<p>' + r + '$1' + asteriscus + '<br>$2</p>' +
			'<p>' + v + '$3' + asteriscus + '<br>$4</p>');
		}
	}

	switch (mode) {
	case 'single': return responsorium.replace(/(<p>|<br>)[RV] /g, '$1');
	case 'expand':
		return responsorium.replace(/<p>R (.*?)<\/p>/, function (all, first) {
			first = first.replace(/<br>/g, asteriscus);
			return '<p>' + v + first + '<!--no ast--><br>' + r + first + '</p>';
		}).replace(/<p>V (.*?)<br>(?:R )?/g, '<p>' + v + '$1<br>' + r)
			.replace(/(<p>|<br>)R /g, '$1' + r)
			.replace(/(<p>|<br>)V /g, '$1' + v)
			.replace(/<br>/g, asteriscus + '<br>')
			.replace(/<!--no ast-->.*?<br>/, '<br>');
	default:
		return responsorium
			.replace(/(<p>|<br>)R /g, '$1' + r)
			.replace(/(<p>|<br>)V /g, '$1' + v)
			.replace(/<br>/g, asteriscus + '<br>');
	}
}

function formatResponsorium (responsorium, easter) {
	var alleluia = l10n.get('alleluia-2'),
		asteriscus = getFlexaAsteriscus('asteriscus', ' '),
		r = getRV('R'),
		r2 = getRV('R2'),
		v = getRV('V'),
		re = /<p>R (.+)<br>(.+) - R<\/p><p>V (.+)<br>(.+)<\/p>/;
	if (easter) {
		if (responsorium.toLowerCase().indexOf('<br>' + l10n.get('alleluia-2').toLowerCase()) === -1) {
			responsorium = responsorium.replace(re,
				'<p>R $1 $2<br>' + alleluia + ' - R</p><p>V $3<br>' + alleluia + '</p>');
		}
	}
	switch (Config.getConfig().get('rvMode')) {
	case 'single': return responsorium.replace(re,
		'<p>$1<br>$2</p><p>$3<br>$4</p><p>' + l10n.get('gloria-patri-1') + '<br>$1<br>$2</p>');
	case 'expand': return responsorium.replace(re,
		'<p>' + v + '$1' + asteriscus + '$2<br>' + r + '$1' + asteriscus + '$2</p>' +
		'<p>' + v + '$3<br>' + r + '$4</p>' +
		'<p>' + v + l10n.get('gloria-patri-1') + '<br>' + r + '$1' + asteriscus + '$2</p>');
	default: return responsorium.replace(re,
		'<p>' + r + '$1' + asteriscus + '<br>$2' + r2 + '</p>' +
		'<p>' + v + '$3' + asteriscus + '<br>$4</p>' +
		'<p>' + l10n.get('gloria-patri-0') + r2 + '</p>');
	}
}

function formatVersus (versus, easter) {
	if (easter) {
		versus = versus.replace(/([^<>]*)(<br>|<\/p>)/g, function (all, line, end) {
			var alleluia = l10n.get('alleluia');
			if (line.slice(-1) === ',') {
				alleluia = alleluia.charAt(0).toLowerCase() + alleluia.slice(1);
			}
			line += ' ' + alleluia;
			return line + end;
		});
	}
	if (Config.getConfig().get('rvMode') !== 'single') {
		versus = versus.replace(/<p>(.+)<br>(.+)<\/p>/,
			'<p>' + getRV('V') + '$1<br>' + getRV('R') + '$2</p>');
	}
	return versus;
}

function formatRV (text) {
	var replaceRV = Config.getConfig().get('rvMode') !== 'single';
	return text.replace(/>([RV]) /g, function (all, c) {
		return '>' + (replaceRV ? getRV(c) : '');
	});
}

function getAudio (key, extra) {
	return Config.getConfig().get('sonus') && audioManager.mapKey(key, extra || '');
}

function formatSequence (seq, time, secondary) {
	var debug = Number(Config.getConfig().get('debug')) === 2;
	return seq.map(function (part) {
		var antiphona, removeAnt = 0, inv;
		if (Array.isArray(part)) {
			if (!part[0]) {
				return '';
			}
			antiphona = 'antiphona';
			if (part[1] && part[1].charAt(0) === '<') {
				removeAnt = -1;
				part[1] = part[1].slice(1);
			} else if (part[1] && part[1].charAt(0) === '>') {
				removeAnt = 1;
				part[1] = part[1].slice(1);
			}
			if (part[1] && part[1].charAt(0) === '!') {
				part[1] = part[1].slice(1);
			} else {
				antiphona += '-' + part[0];
			}
			if (part[1]) {
				antiphona += '-' + part[1];
			}
			if (antiphona === 'antiphona') {
				antiphona = '';
			} else {
				inv = Config.getConfig().get('psalmusInvitatorium') || 'ps-95';
				if (part[0] === 'ps-95') {
					part[0] = inv + '-invitatorium';
				} else if (part[0] === inv || (part[0].indexOf(inv + '-') === 0)) {
					part[0] = 'ps-95';
				}
			}
			return formatCanticum(
				part[0],
				antiphona,
				!secondary && getAudio(part[0] + '|' + antiphona, time),
				removeAnt,
				time === 'p',
				debug && ('[' + part[0] + '] + [' + antiphona + ']')
			);
		}
		if (!part) {
			return '';
		}
		if (part.type && secondary) {
			return false;
		}
		if (part.type === 'title') {
			return formatTitle(part);
		}
		if (part.type === 'month') {
			return formatTitleMonth(part);
		}
		if (part.type === 'raw') {
			return formatRaw(part);
		}
		if (part.type === 'link') {
			return formatLink(part);
		}
		if (part.type === 'notes') {
			return formatNotes(part);
		}
		if (part.indexOf('-defunctus') > -1) {
			time = '';
		}
		return formatBlock(
			l10n.get(part),
			!secondary && getAudio(part, time),
			(part.slice(0, 'responsorium-lectionis-'.length) === 'responsorium-lectionis-' && 'responsorium-lectionis') ||
			(part.slice(0, 'responsorium-'.length) === 'responsorium-' && 'responsorium') ||
			(part.slice(0, 'versus-'.length) === 'versus-' && 'versus'),
			time === 'p',
			debug && ('[' + part + ']')
		);
	});
}

return formatSequence;

})();
