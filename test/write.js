
/**
 * Module dependencies.
 */

var fs = require('fs');
var amf = require('../');
var path = require('path');
var util = require('util');
var assert = require('assert');

describe('write()', function () {

  it('should write a Number value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-number.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, 3.5, 0);
    assert.deepEqual(data, buf);
  });

  it('should write a Boolean `true` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-boolean-true.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, true, 0);
    assert.deepEqual(data, buf);
  });

  it('should write a Boolean `false` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-boolean-false.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, false, 0);
    assert.deepEqual(data, buf);
  });

  it('should write a String value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-string.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, 'this is a テスト', 0);
    assert.deepEqual(data, buf);
  });

  it('should write an Object value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-object.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, { bar: 3.14, foo: 'baz' }, 0);
    assert.deepEqual(data, buf);
  });

  it('should write the `null` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-null.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, null, 0);
    assert.deepEqual(data, buf);
  });

  it('should write the `undefined` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-undefined.bin'));
    var buf = new Buffer(data.length);
    amf.write(buf, undefined, 0);
    assert.deepEqual(data, buf);
  });

  it('should write a reference object', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-ref-test.bin'));
    var buf = new Buffer(data.length);

    var inner = { bar: 3.14, foo: 'baz' };
    var outer = { 0: inner, 1: inner };
    amf.write(buf, outer, 0);
    assert.deepEqual(data, buf);
  });

});
