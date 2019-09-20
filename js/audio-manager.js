/*global audioManager: true, Audio, util*/
audioManager =
(function () {
"use strict";

var dom = {}, audio, currentData, currentMap;

function setReady () {
	dom.play.style.display = '';
	dom.stop.style.display = 'none';
	dom.select0.disabled = false;
	dom.select1.disabled = false;
}

function onPlay () {
	dom.play.style.display = 'none';
	dom.stop.style.display = '';
	dom.select0.disabled = true;
	dom.select1.disabled = true;
	audio.play(setReady);
}

function onStop () {
	audio.stop();
}

function onVolumeChange () {
	audio.setVolume(dom.volume.value);
}

function onCategoryChange () {
	dom.select1.innerHTML = currentData[dom.select0.value].data.map(function (entry) {
		if (!entry.data) {
			return '<optgroup label="' + util.htmlEscape(entry.title) + '">';
		}
		return '<option value="' + util.htmlEscape(entry.data) + '">' + util.htmlEscape(entry.title) + '</option>';
	}).join('');
	onDataChange();
}

function onDataChange () {
	dom.play.disabled = !audio.init(dom.select1.value);
}

function setLang (lang) {
	audio.setConfig('lang', lang);
	onDataChange(); //to update dom.play.disabled
}

function onConfigChange (key, val) {
	if (key === 'notesStyle') {
		audio.setConfig('style', val);
	} else if (key === 'audioSpeed') {
		audio.setConfig('speed', val);
	}
}

function mapKey (key, extra) {
	var map = currentMap.filter(function (mapEntry) {
		return mapEntry.re.test(key + ',' + extra);
	});
	if (map.length === 0) {
		return false;
	}
	map.sort(function (a, b) {
		return b.weight - a.weight;
	});
	return map[0].index;
}

function selectIndex (index) {
	dom.select0.value = index[0];
	onCategoryChange();
	dom.select1.value = index[1];
	onDataChange();
}

function addData (data) {
	if (!data) {
		return;
	}
	currentData = data.data;
	currentMap = data.map;
	dom.select0.innerHTML = currentData.map(function (entry, i) {
		return '<option value="' + i + '">' + util.htmlEscape(entry.title) + '</option>';
	}).join('');
	onCategoryChange();
}

function init (config) {
	var vol;
	audio = new Audio (document.getElementById('main'), document.getElementById('audio-output'));
	dom.play = document.getElementById('audio-play');
	dom.stop = document.getElementById('audio-stop');
	dom.volume = document.getElementById('audio-volume');
	dom.select0 = document.getElementById('audio-select-0');
	dom.select1 = document.getElementById('audio-select-1');

	vol = config.get('volume');
	dom.volume.value = vol;
	audio.setVolume(vol);
	audio.setConfig('style', config.get('notesStyle'));
	audio.setConfig('speed', config.get('audioSpeed'));

	dom.play.addEventListener('click', onPlay);
	dom.stop.addEventListener('click', onStop);
	dom.volume.addEventListener('change', onVolumeChange);
	dom.select0.addEventListener('change', onCategoryChange);
	dom.select1.addEventListener('change', onDataChange);
	setReady();
}

function parse (data) {
	var ret = [], map = [], title, i, line;

	function addMapEntry (pattern) {
		var r = ret.length - 1;
		if (pattern.indexOf(',') === -1) {
			pattern += ',*';
		}
		map.push({
			re: new RegExp('^' + pattern.replace('|', '\\|').replace(/\*/g, '.*') + '$'),
			weight: pattern.length,
			index: [r, ret[r].data[ret[r].data.length - 1].data]
		});
	}

	function append (line) {
		var r = ret.length - 1,
			d = ret[r].data.length - 1,
			old = ret[r].data[d].data;
		if (old) {
			old += '\n';
		}
		old += line;
		ret[r].data[d].data = old;
	}

	if (data.charAt(0) !== '=') {
		return null;
	}

	data = data.split('\n');
	for (i = 0; i < data.length; i++) {
		line = data[i];
		if (line.charAt(0) === '=') {
			ret.push({title: line.slice(1), data: []});
			title = true;
		} else if (line) {
			if (title) {
				ret[ret.length - 1].data.push({title: line, data: ''});
				title = false;
			} else if (line.charAt(0) === '!') {
				addMapEntry(line.slice(1));
			} else {
				append(line);
			}
		} else {
			title = true;
		}
	}
	return {
		data: ret,
		map: map
	};
}

return {
	init: init,
	onConfigChange: onConfigChange,
	addData: addData,
	setLang: setLang,
	parse: parse,
	mapKey: mapKey,
	selectIndex: selectIndex
};

})();