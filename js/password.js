/*global passwordManager: true*/
passwordManager =
(function () {
"use strict";

var PW_CHECKSUM = 57,
	SPECIAL_PW = {
		'~~local~~': '',
		'~~none~~': 'none',
		'~~raw~~': 'raw'
	},
	PW_KEY = 'stundenbuch-password';

function loadPassword () {
	try {
		return localStorage.getItem(PW_KEY);
	} catch (e) {
	}
	return '';
}

function storePassword (pw) {
	try {
		return localStorage.setItem(PW_KEY, pw);
	} catch (e) {
	}
}

function clearPassword () {
	try {
		localStorage.removeItem(PW_KEY);
	} catch (e) {
	}
}

function checksum (str) {
	return str.split('').map(function (c, i) {
			return (i + 1) * (c.charCodeAt(0) - 97);
		}).reduce(function (a, b) {
			return a + b;
		}, 0) % 101;
}

function isValidPassword (pw) {
	return (
		pw in SPECIAL_PW || (
			/^[a-z]{32}$/.test(pw) &&
			checksum(pw) === PW_CHECKSUM
		)
	);
}

function normalizePassword (pw) {
	return pw.toLowerCase().replace(/\s+/g, '');
}

function normalizeSpecialPassword (pw) {
	if (pw in SPECIAL_PW) {
		return SPECIAL_PW[pw];
	}
	return pw;
}

function showPasswordPrompt (container, prompt, callback) {
	var oldHtml = container.innerHTML, input;
	container.innerHTML = prompt + '<p><textarea id="password-input" rows="3"></textarea></p>';
	input = document.getElementById('password-input');
	input.addEventListener('input', function () {
		var pw = normalizePassword(input.value);
		if (isValidPassword(pw)) {
			input.blur();
			container.innerHTML = oldHtml;
			callback(pw);
		}
	});
}

function waitForPassword (container, prompt, callback) {
	var pw = loadPassword();
	if (isValidPassword(pw)) {
		callback(normalizeSpecialPassword(pw));
	} else {
		showPasswordPrompt(container, prompt, function (pw) {
			storePassword(pw);
			callback(normalizeSpecialPassword(pw));
		});
	}
}

return {
	clear: clearPassword,
	wait: waitForPassword
};

})();