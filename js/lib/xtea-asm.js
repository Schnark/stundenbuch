xtea =
(function () {
"use strict";

//based on https://github.com/anonyco/FastestSmallestTextEncoderDecoder
(function(e){function p(b){var a=b.charCodeAt(0)<<24,c=q(~a)|0,d=0,e=b.length|0,g="";if(5>c&&e>=c){a=a<<c>>>24+c;for(d=1;d<c;d=d+1|0)a=a<<6|b.charCodeAt(d)&63;65535>=a?g+=f(a):1114111>=a?(a=a-65536|0,g+=f((a>>10)+55296|0,(a&1023)+56320|0)):d=0}for(;d<e;d=d+1|0)g+="\ufffd";return g}function l(){}function r(b){var a=b.charCodeAt(0)|0;if(55296<=a&&56319>=a){var c=b.charCodeAt(1)|0;if(c===c&&56320<=c&&57343>=c){if(a=(a-55296<<10)+c-56320+65536|0,65535<a)return f(240|a>>>18,128|a>>>12&63,
128|a>>>6&63,128|a&63)}else return f(239,191,189)}return 127>=a?b:2047>=a?f(192|a>>>6,128|a&63):f(224|a>>>12,128|a>>>6&63,128|a&63)}function m(){}var t=Math.log,u=Math.LN2,q=Math.clz32||function(b){return 31-(t(b>>>0)/u|0)},k=e.Uint8Array,f=String.fromCharCode;l.prototype.decode=function(b){b=new k(b);for(var a="",c=0,d=b.length|0;c<d;c=c+32768|0)a+=f.apply(0,b.subarray(c,c+32768|0));return a.replace(/[\xc0-\xff][\x80-\xbf]*/g,p)};e.TextDecoder||(e.TextDecoder=l);m.prototype.encode=function(b){b=void 0===b?"":(""+b).replace(/[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,r);for(var a=b.length|0,c=new k(a),d=0;d<a;d=d+1|0)c[d]=b.charCodeAt(d);return c};e.TextEncoder||(e.TextEncoder=m)})(window);

function getAsmXor (stdlib, foreign, buffer) {
"use asm";
var data = new stdlib.Uint32Array(buffer);
//0 - 1: working space
//2 - 5: key
//6 - 7: nonce
//8 - ...: data

function xtea () {
	var v0 = 0,
		v1 = 0,
		sum = 0,
		i = 0,
		j = 0,
		ROUNDS = 32,
		DELTA = 0x9E3779B9;
	v0 = data[0]|0;
	v1 = data[1]|0;
	for (; (i|0) < (ROUNDS|0); i = (i + 1)|0) {
		j = (((sum & 3) + 2)|0) << 2; //sum & 3 from algorithm, +2 for offset, << 2 for 32 bit
		v0 = (v0 + (((((v1 << 4) ^ (v1 >>> 5)) + v1)|0) ^ ((sum + (data[j >> 2]|0))|0)))|0;
		sum = (sum + DELTA)|0;
		j = ((((sum >> 11) & 3) + 2)|0) << 2; //(sum >> 11) & 3 from algorithm, rest as above
		v1 = (v1 + (((((v0 << 4) ^ (v0 >>> 5)) + v0)|0) ^ ((sum + (data[j >> 2]|0))|0)))|0;
	}
	data[0] = v0|0;
	data[1] = v1|0;
}

function getCTR (counter) {
	counter = counter|0;
	data[0] = data[6] ^ (counter >>> 32);
	data[1] = data[7] ^ (counter & 0xFFFF);
	xtea();
}

function doXor (l) {
	l = l|0;
	var i = 0,
		j = 0;
	for (; (i|0) < (l|0); i = (i + 1)|0) {
		getCTR(i|0);
		j = ((i + 4)|0) << 3;
		data[j >> 2] = data[j >> 2] ^ data[0];
		data[((j + 4)|0) >> 2] = data[((j + 4)|0) >> 2] ^ data[1];
	}
}

return {
	doXor: doXor
};

}

//data: Uint8Array: 16 bytes key, 8 bytes nonce, rest data
function doXor (data) {
	var l = Math.ceil((data.length - 24) / 8), //data length in 64bit blocks
		bufferLength = l * 8 + 32 < 16777216 ?
			Math.pow(2, Math.ceil(Math.log(l * 8 + 32) / Math.log(2))) :
			Math.ceil((l * 8 + 32) / 16777216) * 16777216,
		heap = new ArrayBuffer(bufferLength),
		int8 = new Uint8Array(heap);

	int8.set(data, 8);
	getAsmXor(window, null, heap).doXor(l);
	data.set(int8.subarray(8, data.length + 8));
}

function parseKey (key) {
	/*DO NOT use this unless your key has enough entropy!
	Ideally it should contain 32 letters from a to p, all with
	equal probability. Anything that deviates much from this is
	NOT SECURE.
	*/
	var output = new Uint8Array(16);
	while (key.length < 32) { //shouldn't happen
		key = key + key;
	}
	//now take only the last 4 bits of each char, only these are random
	output[0] = ((key.charCodeAt(0) & 0xF) << 4) | (key.charCodeAt(1) & 0xF);
	output[1] = ((key.charCodeAt(2) & 0xF) << 4) | (key.charCodeAt(3) & 0xF);
	output[2] = ((key.charCodeAt(4) & 0xF) << 4) | (key.charCodeAt(5) & 0xF);
	output[3] = ((key.charCodeAt(6) & 0xF) << 4) | (key.charCodeAt(7) & 0xF);
	output[4] = ((key.charCodeAt(8) & 0xF) << 4) | (key.charCodeAt(9) & 0xF);
	output[5] = ((key.charCodeAt(10) & 0xF) << 4) | (key.charCodeAt(11) & 0xF);
	output[6] = ((key.charCodeAt(12) & 0xF) << 4) | (key.charCodeAt(13) & 0xF);
	output[7] = ((key.charCodeAt(14) & 0xF) << 4) | (key.charCodeAt(15) & 0xF);
	output[8] = ((key.charCodeAt(16) & 0xF) << 4) | (key.charCodeAt(17) & 0xF);
	output[9] = ((key.charCodeAt(18) & 0xF) << 4) | (key.charCodeAt(19) & 0xF);
	output[10] = ((key.charCodeAt(20) & 0xF) << 4) | (key.charCodeAt(21) & 0xF);
	output[11] = ((key.charCodeAt(22) & 0xF) << 4) | (key.charCodeAt(23) & 0xF);
	output[12] = ((key.charCodeAt(24) & 0xF) << 4) | (key.charCodeAt(25) & 0xF);
	output[13] = ((key.charCodeAt(26) & 0xF) << 4) | (key.charCodeAt(27) & 0xF);
	output[14] = ((key.charCodeAt(28) & 0xF) << 4) | (key.charCodeAt(29) & 0xF);
	output[15] = ((key.charCodeAt(30) & 0xF) << 4) | (key.charCodeAt(31) & 0xF);
	return output;
}

function encrypt (text, key) {
	var data, iv;
	text = pako.deflateRaw((new TextEncoder()).encode(text), {level: 9});
	data = new Uint8Array(24 + text.length);
	iv = new Uint8Array(8);
	try {
		crypto.getRandomValues(iv);
	} catch (e) {
		iv[0] = Math.random() * 0xFF;
		iv[1] = Math.random() * 0xFF;
		iv[2] = Math.random() * 0xFF;
		iv[3] = Math.random() * 0xFF;
		iv[4] = Math.random() * 0xFF;
		iv[5] = Math.random() * 0xFF;
		iv[6] = Math.random() * 0xFF;
		iv[7] = Math.random() * 0xFF;
	}
	data.set(parseKey(key));
	data.set(iv, 16);
	data.set(text, 24);
	doXor(data);
	return data.subarray(16);
}

function decrypt (input, key) {
	var data = new Uint8Array(16 + input.length);
	data.set(parseKey(key));
	data.set(input, 16);
	doXor(data);
	return (new TextDecoder()).decode(pako.inflateRaw(data.subarray(24)));
}

return {
	encrypt: encrypt,
	decrypt: decrypt
};
})();

/*
getText('de.txt', function (text) {
	var blob = new Blob([xtea.encrypt(text, 'abc')], {'content-type': 'application/octet-stream'});
	location.href = URL.createObjectURL(blob);
});
*/
