
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

});
