/*jslint nodejs:true */

function arbBool() {
	return Math.random() > 0.5;
}

exports.arbBool = arbBool;

function arbSign() {
	return arbBool() ? 1 : -1;
}

exports.arbSign = arbSign;

function arbDouble() {
	var sign = arbSign();
	return sign * Math.random() * Number.MAX_VALUE;
}

exports.arbDouble = arbDouble;

function arbInt() {
	var sign = arbSign();
	return sign * Math.floor(arbDouble());
}

exports.arbInt = arbInt;

function arbIntBetween(n, m) {
    if (!n) n = 0;
    if (!m) m = 1;               // default range starts at 1
    var max = n > m ? n : m;     // doesn't matter which value is min or max
    var min = n === max ? m : n; // min is value that is not max
    var delta = max - min + 1;   // distribution range
    return Math.floor(Math.random() * delta + min);
}

exports.arbIntBetween = arbIntBetween;

function arbByte() {
	return arbIntBetween(0, 255);
}

exports.arbByte = arbByte;

function arbChar() {
	return String.fromCharCode(arbByte());
}

exports.arbChar = arbChar;

function arbHex() {
	return arbByte().toString(16);
}

exports.arbHex = arbHex;

function arbArray(generator) {
	var
		len = Math.floor(Math.random() * 100),
		args = Array.prototype.slice.call(arguments, 1),
		array = [],
		i;

	for (i = 0; i < len; i++) {
		array.push(generator.apply(null, args));
	}

	return array;
}

exports.arbArray = arbArray;

function arbString() {
	return arbArray(arbChar).join("");
}

exports.arbString = arbString;

function forAll(property) {
	var
		generators = Array.prototype.slice.call(arguments, 1),
		fn = function (f) { return f(); },
		i,
		values;

	for (i = 0; i < 100; i ++) {
		values = generators.map(fn);

		if (!property.apply(null, values)) {
			console.log("*** Failed!\n" + values);
			return;
		}
	}

	console.log("+++ OK, passed 100 tests.");
}

exports.forAll = forAll;

function forAllSilent() {
	console.oldLog = console.log;
	console.log = function () {};

	var result = forAll.apply(null, arguments);

	console.log = console.oldLog;

	return result;
}

exports.forAllSilent = forAllSilent;

// Test quickcheck itself
function test() {
	var
		propertyEven,
		propertyNumber,
		propertyTrue;

	propertyEven = function (x) { return x % 2 === 0; };
	console.assert(!forAllSilent(propertyEven, arbByte));

	propertyNumber = function (x) { return typeof(x) === "number"; };
	console.assert(forAllSilent(propertyNumber, arbInt));

	propertyTrue = function (x) { return x; };
	console.assert(!forAllSilent(propertyTrue, arbBool));

	return true;
}

exports.test = test;
