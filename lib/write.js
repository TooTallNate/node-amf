
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
      return writeNumber(buffer, value, info);
    case amf0Types.kBooleanType:
      return writeBoolean(buffer, value, info);
    case amf0Types.kStringType:
      return writeString(buffer, value, info);
    case amf0Types.kObjectType:
      return writeObject(buffer, value, info);
    case amf0Types.kNullType:
      return null;
    case amf0Types.kUndefinedType:
      return undefined;
    case amf0Types.kReferenceType:
      return writeReference(buffer, value, info);
    case amf0Types.kECMAArrayType:
      return writeECMAArray(buffer, value, info);
    case amf0Types.kObjectEndType:
      return END_OBJECT;
    case amf0Types.kStrictArrayType:
      return writeStrictArray(buffer, value, info);
    case amf0Types.kDateType:
      return writeDate(buffer, value, info);
    case amf0Types.kTypedObjectType:
      return writeTypedObject(buffer, value, info);
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
  var type = typeof value;
  if ('number' === type) return amf0Types.kNumberType;
  if ('boolean' === type) return amf0Types.kBooleanType;
  if ('string`' === type) return amf0Types.kStringType;

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
