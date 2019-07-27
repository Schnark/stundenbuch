/*global waitForPassword: true*/
waitForPassword =
(function () {
"use strict";

var PW_HASH = 57;

function hasRawAccess () {
	return location.protocol === 'file:';
}

function loadPassword (key) {
	try {
		return localStorage.getItem(key);
	} catch (e) {
	}
	return '';
}

function storePassword (key, pw) {
	try {
		return localStorage.setItem(key, pw);
	} catch (e) {
	}
}

function isValidPassword (pw) {
	return (
		/^[a-z]{32}$/.test(pw) &&
		pw.split('').map(function (c, i) {
			return (i + 1) * (c.charCodeAt(0) - 97);
		}).reduce(function (a, b) {
			return a + b;
		}, 0) % 101 === PW_HASH
	);
}

function showPasswordPrompt (container, prompt, callback) {
	var oldHtml = container.innerHTML, input;
	container.innerHTML = prompt + '<p><textarea id="password-input" rows="3"></textarea></p>';
	input = document.getElementById('password-input');
	input.addEventListener('input', function () {
		var pw = input.value.replace(/\s+/g, '');
		if (isValidPassword(pw)) {
			input.blur();
			container.innerHTML = oldHtml;
			callback(pw);
		}
	});
}

function waitForPassword (key, container, prompt, callback) {
	var pw = loadPassword(key);
	if (hasRawAccess()) {
		callback('');
	} else if (isValidPassword(pw)) {
		callback(pw);
	} else {
		showPasswordPrompt(container, prompt, function (pw) {
			storePassword(key, pw);
			callback(pw);
		});
	}
}

return waitForPassword;

})();