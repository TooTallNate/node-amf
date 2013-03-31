
/**
 * Module dependencies.
 */

var assert = require('assert');
var constants = require('./constants');
var amf0Types = constants.amf0Types;

/**
 * Module exports.
 */

module.exports = write;

/**
 * Writes an AMF value to the specified Buffer at the specified offset.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {?} value the value to serialize as AMF data in `buffer`.
 * @param {Object|Number} info "Options" object, or the byte offset to begin reading from.
 * @api public
 */

function write (buffer, value, info) {
  if ('number' == typeof info) info = { offset: info };
  if (!info) info = {};
  if (null == info.offset) info.offset = 0;
  var type = null == info.type ? getType(value, info) : info.type;

  // gets reset to 0 on each `write()` call
  info.byteLength = 0;

  // write the "type" byte
  buffer.writeUInt8(type, info.offset);
  bytesUsed(info, 1);

  switch (type) {
    case amf0Types.kNumberType:
      writeNumber(buffer, value, info);
      break;
    case amf0Types.kBooleanType:
      writeBoolean(buffer, value, info);
      break;
    case amf0Types.kStringType:
      writeString(buffer, value, info);
      break;
    case amf0Types.kObjectType:
      writeObject(buffer, value, info);
      break;
    case amf0Types.kNullType:
    case amf0Types.kUndefinedType:
      break; // nothing to do for these two...
    case amf0Types.kReferenceType:
      writeReference(buffer, value, info);
      break;
    case amf0Types.kECMAArrayType:
      writeECMAArray(buffer, value, info);
      break;
    case amf0Types.kObjectEndType:
      break; // nothing to do...
    case amf0Types.kStrictArrayType:
      writeStrictArray(buffer, value, info);
      break;
    case amf0Types.kDateType:
      writeDate(buffer, value, info);
      break;
    case amf0Types.kTypedObjectType:
      writeTypedObject(buffer, value, info);
      break;
    default:
      throw new Error('"type" not yet implemented: ' + type);
  }
}

function bytesUsed (info, n) {
  info.offset += n;
  info.byteLength += n;
}

function getType (value, info) {
  if (null === value) return amf0Types.kNullType;
  if (undefined === value) return amf0Types.kUndefinedType;
  if (END_OBJECT === value) return amf0Types.kObjectEndType;
  var type = typeof value;
  if ('number' === type) return amf0Types.kNumberType;
  if ('boolean' === type) return amf0Types.kBooleanType;
  if ('string' === type) return amf0Types.kStringType;
  if ('object' === type) {
    if (isReference(value, info)) return amf0Types.kReferenceType;
    if (Array.isArray(value)) return amf0Types.kECMAArrayType;
    return amf0Types.kObjectType;
  }
  throw new Error('could not infer AMF "type" for ' + value);
}

function getType0 (value) {

}

function getType3 (value) {

}

// 2.2 Number Type

function writeNumber (buffer, value, info) {
  var offset = info.offset;
  bytesUsed(info, 8);
  return buffer.writeDoubleBE(value, offset);
}

// 2.3 Boolean Type

function writeBoolean (buffer, value, info) {
  var offset = info.offset;
  bytesUsed(info, 1);
  return buffer.writeUInt8(value ? 1 : 0, offset);
}

// 2.4 String Type

function writeString (buffer, value, info) {
  var offset = info.offset;
  var encoding = 'utf8';

  // first write the byte length of the utf8 string
  var length = Buffer.byteLength(value, encoding);
  buffer.writeUInt16BE(length, offset);
  bytesUsed(info, 2);

  // second write the utf8 string bytes
  offset = info.offset;
  bytesUsed(info, length);
  var b = buffer.write(value, offset, length, encoding);
  assert.equal(b, length, 'failed to write entire String ' +
      JSON.stringify(value) + ' to Buffer with length ' + buffer.length +
      ' at offset ' + offset + '. Wrote ' + b + ' bytes, expected ' + length);
  return b;
}

// 2.5 Object Type

function writeObject (buffer, object, info) {
  var keys = Object.keys(object);
  var key, value;

  if (!info.references) info.references = [];
  info.references.push(object);

  // loop through all the keys and write their keys ana values
  var temp = {};
  for (var i = 0; i < keys.length; i++) {
    // write the "key"
    temp.offset = info.offset;
    temp.byteLength = 0;
    key = keys[i];
    writeString(buffer, key, temp);
    bytesUsed(info, temp.byteLength);

    // write the "value"
    temp.offset = info.offset;
    temp.references = info.references;
    value = object[key];
    write(buffer, value, temp);
    bytesUsed(info, temp.byteLength);
  }

  // now write the "end object" marker
  temp.offset = info.offset;
  temp.byteLength = 0;
  writeString(buffer, '', temp);
  bytesUsed(info, temp.byteLength);

  temp.offset = info.offset;
  write(buffer, END_OBJECT, temp);
  bytesUsed(info, temp.byteLength);
}

// 2.9 Reference Type

function writeReference (buffer, value, info) {
  var refs = info.references;
  var offset = info.offset;

  // first figure out the index of the reference
  for (var i = 0; i < refs.length; i++) {
    if (refs[i] === value) break;
  }

  bytesUsed(info, 2);
  buffer.writeUInt16BE(i, offset);
}

function isReference (value, info) {
  var rtn = false;
  var refs = info.references;
  if (refs) {
    for (var i = 0; i < refs.length; i++) {
      if (refs[i] === value) {
        rtn = true;
        break;
      }
    }
  }
  return rtn;
}

// 2.11 Object End Type

// sentinel object that signifies the "end" of an ECMA Object/Array
var END_OBJECT = { endObject: true };
