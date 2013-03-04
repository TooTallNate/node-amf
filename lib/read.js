
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
 * @param {Object|Number} info "Options" object, or the byte offset to begin reading from.
 * @return {Object|Array} The decoded AMF object.
 * @api public
 */

function read (buffer, info) {
  if ('number' == typeof info) info = { offset: info };
  if (!info) info = {};
  if (null == info.offset) info.offset = 0;

  // gets reset to 0 on each `read()` call
  info.byteLength = 0;

  // read the "type" byte
  var type = buffer.readUInt8(info.offset);
  bytesUsed(info, 1);

  switch (type) {
    case amf0Types.kNumberType:
      return readNumber(buffer, info);
    case amf0Types.kBooleanType:
      return readBoolean(buffer, info);
    case amf0Types.kStringType:
      return readString(buffer, info);
    case amf0Types.kObjectType:
      return readObject(buffer, info);
    case amf0Types.kNullType:
      return null;
    case amf0Types.kUndefinedType:
      return undefined;
    case amf0Types.kReferenceType:
      return readReference(buffer, info);
    case amf0Types.kECMAArrayType:
      return readECMAArray(buffer, info);
    case amf0Types.kObjectEndType:
      return END_OBJECT;
    case amf0Types.kStrictArrayType:
      return readStrictArray(buffer, info);
    case amf0Types.kDateType:
      return readDate(buffer, info);
    case amf0Types.kTypedObjectType:
      return readTypedObject(buffer, info);
    default:
      throw new Error('"type" not yet implemented: ' + type);
  }
}

function bytesUsed (info, n) {
  info.offset += n;
  info.byteLength += n;
}

// 2.2 Number Type

function readNumber (buffer, info) {
  var offset = info.offset;
  bytesUsed(info, 8);
  return buffer.readDoubleBE(offset);
}

// 2.3 Boolean Type

function readBoolean (buffer, info) {
  var offset = info.offset;
  bytesUsed(info, 1);
  return buffer.readUInt8(offset) !== 0;
}

// 2.4 String Type

function readString (buffer, info) {
  var offset = info.offset;

  var length = buffer.readUInt16BE(offset);
  bytesUsed(info, 2);

  offset = info.offset;
  bytesUsed(info, length);
  return buffer.toString('utf8', offset, offset + length);
}

// 2.5 Object Type

function readObject (buffer, info, object) {
  var key, value;
  if (!object) object = {};

  if (!info.references) info.references = [];
  info.references.push(object);

  var temp = {};
  while (value !== END_OBJECT) {
    temp.offset = info.offset;
    temp.byteLength = 0;
    key = readString(buffer, temp);
    bytesUsed(info, temp.byteLength);

    temp.offset = info.offset;
    temp.references = info.references;
    value = read(buffer, temp);
    bytesUsed(info, temp.byteLength);

    if (value !== END_OBJECT) object[key] = value;
  }
  assert.strictEqual(key, '');
  assert.strictEqual(value, END_OBJECT);

  return object;
}

// 2.6 Movieclip Type
// This type is not supported and is reserved for future use.

// 2.7 null Type

// 2.8 undefined Type

// 2.9 Reference Type

function readReference (buffer, info) {
  var index = buffer.readUInt16BE(info.offset);
  bytesUsed(info, 2);
  return info.references[index];
}

// 2.10 ECMA Array Type

function readECMAArray (buffer, info, array) {
  if (!Array.isArray(array)) array = [];

  // ignored, and can't really be relied on since ECMA arrays can have numbered
  // indices, and/or names keys which may or may not be counted here
  var count = buffer.readUInt32BE(info.offset);
  bytesUsed(info, 4);

  // at this point it's the same binary structure as a regular Object
  readObject(buffer, info, array);

  return array;
}

// 2.11 Object End Type

// sentinel object that signifies the "end" of an ECMA Object/Array
var END_OBJECT = { endObject: true };

// 2.12 Strict Array Type

function readStrictArray (buffer, info, array) {
  var value, temp;
  if (!Array.isArray(array)) array = [];

  if (!info.references) info.references = [];
  info.references.push(array);

  var count = buffer.readUInt32BE(info.offset);
  bytesUsed(info, 4);

  temp = {};
  for (var i = 0; i < count; i++) {
    temp.offset = info.offset;
    temp.references = info.references;
    value = read(buffer, temp);
    bytesUsed(info, temp.byteLength);
    array.push(value);
  }

  return array;
}

// 2.13 Date Type

function readDate (buffer, info) {
  // number of milliseconds elapsed since the epoch
  // of midnight on 1st Jan 1970 in the UTC time zone
  var millis = buffer.readDoubleBE(info.offset);
  bytesUsed(info, 8);

  // reserved, not supported SHOULD be set to 0x0000 (not enforced)
  var timezone = buffer.readInt16BE(info.offset);
  bytesUsed(info, 2);

  return new Date(millis);
}

// 2.14 Long String Type
// 2.15 Unsupported Type

// 2.16 RecordSet Type
// This type is not supported and is reserved for future use.

// 2.17 XML Document Type

// 2.18 Typed Object Type

function readTypedObject (buffer, info) {
  // "typed" objects are just regular ECMA Objects with a String class name at the
  // beginning
  var name = readString(buffer, info);
  var obj = readObject(buffer, info);
  obj.__className__ = name;
  return obj;
}
