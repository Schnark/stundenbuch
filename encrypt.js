//yes, I should just use node instead of phantomjs,
//but changing a broken system makes things usually just worse
pako = require('./js/lib/pako.min.js');
require('./js/lib/xtea-asm.js');
var fs = require('fs'),
	system = require('system'),
	encrypted, encStr = '', i;

encrypted = xtea.encrypt(
	fs.read(system.args[1]),
	system.args[2]
);

for (i = 0; i < encrypted.length; i += 32768) {
	encStr += String.fromCharCode.apply(String, Array.prototype.slice.apply(encrypted.subarray(i, i + 32768)));
}

console.log(btoa(encStr));

phantom.exit();