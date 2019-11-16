/*global Day, Config, l10n*/
/*global Event*/
(function () {
"use strict";

var input,
	showButton, cancelButton, insertButton,
	areaAll, areaNote, areaAdd,
	areaSuggestions,
	dayInput, monthInput,
	actionInput,
	noteInput, nameInput,
	rankInput, mainTypeInput, otherTypesInput,
	availableKeys;

function initKeys () {
	var cal;

	function addEntry (entry) {
		if (entry[2]) {
			availableKeys[entry[2]] = entry[0] + '|' + entry[1]; //TODO entry[2] doppelt
		}
	}

	if (availableKeys) {
		return;
	}
	availableKeys = {};
	for (cal in Day.calendars) {
		Day.calendars[cal].getEntries(new Config({})).forEach(addEntry);
	}
}

function matchesPartialName (name, key) {
	return key.indexOf(name) === 0; //TODO
}

function onShowClick () {
	var today = new Day();
	dayInput.value = today.getDate();
	monthInput.value = today.getMonth() + 1;
	actionInput.value = 'note';
	noteInput.value = '';
	nameInput.value = '';
	rankInput.value = '0';
	mainTypeInput.value = 'defunctus';
	onActionChange();
	onNameChange();
	onMainTypeChange();
	areaAll.style.display = '';
	showButton.style.display = 'none';
}

function onCancelClick () {
	areaAll.style.display = 'none';
	showButton.style.display = '';
}

function onInsertClick () {
	var str = dayInput.value + '|' + monthInput.value, types, otherTypesOptions, i, old;
	switch (actionInput.value) {
	case 'note':
		str += '|' + noteInput.value;
		break;
	case 'add':
		types = [mainTypeInput.value];
		otherTypesOptions = otherTypesInput.getElementsByTagName('option');
		for (i = 0; i < otherTypesOptions.length; i++) {
			if (otherTypesOptions[i].selected) {
				types.push(otherTypesOptions[i].value);
			}
		}
		str += '|' + nameInput.value + '|' + rankInput.value + '|' + types.join(',');
	}
	old = input.value.replace(/\s+$/, '');
	if (old) {
		old += '\n';
	}
	input.value = old + str;
	input.dispatchEvent(new Event('change', {bubbles: true}));
	areaAll.style.display = 'none';
	showButton.style.display = '';
}

function onActionChange () {
	areaNote.style.display = actionInput.value === 'note' ? '' : 'none';
	areaAdd.style.display = actionInput.value === 'add' ? '' : 'none';
}

function onNameChange () {
	var key, date = dayInput.value + '|' + monthInput.value, name = nameInput.value, suggestions0 = [], suggestions1 = [];
	for (key in availableKeys) {
		if (!matchesPartialName(name, key)) {
			continue;
		}
		if (availableKeys[key] === date) {
			suggestions0.push(key);
		} else if (name) {
			suggestions1.push(key);
		}
	}
	suggestions0 = suggestions0.concat(suggestions1);
	if (suggestions0.length > 5) {
		suggestions0.length = 5;
	}
	areaSuggestions.innerHTML = suggestions0.map(function (suggestion) {
		return '<code data-suggestion="' + suggestion + '">' + suggestion + '</code>';
	}).join(' – ');
	//TODO
}

function onSuggestionClick (e) {
	if (e.target.dataset.suggestion) {
		nameInput.value = e.target.dataset.suggestion; //TODO auch andere Werte?
		areaSuggestions.innerHTML = '';
	}
}

function onMainTypeChange () {
	var otherTypes;
	switch (mainTypeInput.value) {
	case 'defunctus':
		otherTypes = ['vir', 'mulier', 'plures'];
		break;
	case 'martyr':
		otherTypes = ['vir', 'mulier', 'plures', 'beatus'];
		break;
	case 'ecclesia':
		otherTypes = ['extra'];
		break;
	case 'maria':
		otherTypes = [];
		break;
	case 'apostolus':
	case 'apostolus2':
	case 'evangelista':
		otherTypes = ['martyr', 'plures'];
		break;
	case 'doctor':
		otherTypes = ['martyr', 'misericordia', 'educator', 'plures'];
		break;
	case 'virgo':
	case 'pastor':
	case 'papa':
	case 'episcopus':
	case 'fundator':
	case 'missionarius':
		otherTypes = ['martyr', 'misericordia', 'educator', 'plures', 'beatus'];
		break;
	case 'religiosus':
	case 'abbas':
		otherTypes = ['martyr', 'misericordia', 'educator', 'vir', 'mulier', 'plures', 'beatus'];
		break;
	case 'vir':
	case 'mulier':
		otherTypes = ['misericordia', 'educator', 'plures', 'beatus'];
	}
	otherTypesInput.innerHTML = otherTypes.map(function (type) {
		return '<option value="' + type + '">' + l10n.get('titulus-calendarium-addendum-' + type) + '</option>';
	}).join('');
}

function init () {
	input = document.getElementById('form-additional-input');
	showButton = document.getElementById('form-additional-show');
	cancelButton = document.getElementById('form-additional-cancel');
	insertButton = document.getElementById('form-additional-insert');
	areaAll = document.getElementById('form-additional-all');
	areaNote = document.getElementById('form-additional-note-area');
	areaAdd = document.getElementById('form-additional-add-area');
	areaSuggestions = document.getElementById('form-additional-suggestions');
	dayInput = document.getElementById('form-additional-day');
	monthInput = document.getElementById('form-additional-month');
	actionInput = document.getElementById('form-additional-action');
	noteInput = document.getElementById('form-additional-note');
	nameInput = document.getElementById('form-additional-name');
	rankInput = document.getElementById('form-additional-rank');
	mainTypeInput = document.getElementById('form-additional-main-type');
	otherTypesInput = document.getElementById('form-additional-other-types');

	areaAll.style.display = 'none';
	initKeys();

	showButton.addEventListener('click', onShowClick, false);
	cancelButton.addEventListener('click', onCancelClick, false);
	insertButton.addEventListener('click', onInsertClick, false);
	actionInput.addEventListener('change', onActionChange, false);
	areaSuggestions.addEventListener('click', onSuggestionClick, false);
	dayInput.addEventListener('change', onNameChange, false); //name suggestions depend on date
	monthInput.addEventListener('change', onNameChange, false);
	nameInput.addEventListener('input', onNameChange, false);
	mainTypeInput.addEventListener('change', onMainTypeChange, false);
}

init();

})();