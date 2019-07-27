/*global schnarkDiff*/
(function () {
"use strict";

var in1, in2, out;

function showDiff () {
	out.innerHTML = schnarkDiff.htmlDiff(in1.value, in2.value);
}

function init () {
	document.getElementById('diff-style').textContent = schnarkDiff.getCSS();
	in1 = document.getElementById('in1');
	in2 = document.getElementById('in2');
	out = document.getElementById('out');
	in1.addEventListener('input', showDiff);
	in2.addEventListener('input', showDiff);
}

init();

})();