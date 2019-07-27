/*global Audio*/
(function () {
"use strict";

var audio = new Audio(null, document.getElementById('output'));

function show () {
	var notes = document.getElementById('input').value;
	if (notes) {
		audio.init(notes);
	}
}

function play () {
	audio.play(function () {
	});
}

function changeStyle () {
	audio.setConfig('style', document.getElementById('style').value);
}

document.getElementById('show').onclick = show;
document.getElementById('play').onclick = play;
document.getElementById('style').onchange = changeStyle;
})();