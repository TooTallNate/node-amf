
/**
 * Module dependencies.
 */

var assert = require('assert');
var constants = require('./constants');
var amf0Types = constants.amf0Types;

/**
 * Module exports.
 */

module.exports = read;

/**
 * Reads an AMF object from the specified Buffer at the specified offset.
 *
 * @param {Buffer} buffer The Buffer instance to read from.
 * @param {Number} offset The byte offset to begin reading from.
 * @return {Object|Array} The decoded AMF object.
 * @api public
 */

function read (buffer, offset, d) {
  if (!d) d = { byteLength: 0 };
  var i = offset | 0;
  var type = buffer.readUInt8(i);
  i += 1;
  d.byteLength += 1;

  switch (type) {
    case amf0Types.kNumberType:
      return readNumber(buffer, i, d);
    case amf0Types.kBooleanType:
      return readBoolean(buffer, i, d);
    case amf0Types.kStringType:
      return readString(buffer, i, d);
    case amf0Types.kObjectType:
      return readObject(buffer, i, d);
    case amf0Types.kNullType:
      return null;
    case amf0Types.kUndefinedType:
      return undefined;
    case amf0Types.kECMAArrayType:
      return readECMAArray(buffer, i, d);
    case amf0Types.kObjectEndType:
      return END_OBJECT;
    default:
      throw new Error('"type" not yet implemented: ' + type);
  }
}

function readNumber (buffer, offset, b) {
  var i = offset | 0;
  b.byteLength += 8;
  return buffer.readDoubleBE(i);
}

function readBoolean (buffer, offset, b) {
  var i = offset | 0;
  b.byteLength += 1;
  return buffer.readUInt8(i) !== 0;
}

function readString (buffer, offset, b) {
  var i = offset | 0;
  var len = buffer.readUInt16BE(i);
  i += 2;
  b.byteLength += 2 + len;
  return buffer.toString('utf8', i, i + len);
}

// sentinel object that signifies the "end" of an Object
var END_OBJECT = { endObject: true };

function readObject (buffer, offset, b, o) {
  var i = offset | 0;
  if (!o) o = {};
  var d;
  var key, value;

  while (key != '' && value !== END_OBJECT) {

    d = { byteLength: 0 };
    key = readString(buffer, i, d);
    i += d.byteLength;
    b.byteLength += d.byteLength;

    d = { byteLength: 0 };
    value = read(buffer, i, d);
    i += d.byteLength;
    b.byteLength += d.byteLength;

    //console.error(0, key, value, d);

    if (key != '') o[key] = value;
  }

  return o;
}

function readECMAArray (buffer, offset, b) {
  var off = offset | 0;
  var a = [];
  var d = { byteLength: 0 };
  var key, value;
  var count = buffer.readUInt32BE(off);
  off += 4;
  b.byteLength += 4;

  // +1 because there's a final empty string, END_OBJECT entry as well
  for (var i = 0; i < count + 1; i++) {

    d.byteLength = 0;
    key = readString(buffer, off, d);
    off += d.byteLength;
    b.byteLength += d.byteLength;

    d.byteLength = 0;
    value = read(buffer, off, d);
    off += d.byteLength;
    b.byteLength += d.byteLength;

    //console.error(0, key, value, d);

    if (key != '') a[key] = value;
  }
  assert.strictEqual(key, '');
  assert.strictEqual(value, END_OBJECT);

  return a;
}
