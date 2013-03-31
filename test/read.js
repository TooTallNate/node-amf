
/**
 * Module dependencies.
 */

var fs = require('fs');
var amf = require('../');
var path = require('path');
var util = require('util');
var assert = require('assert');

describe('read()', function () {

  it('should read a Number value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-number.bin'));
    var obj = amf.read(data, 0);
    assert.equal(3.5, obj);
  });

  it('should read a Boolean `true` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-boolean-true.bin'));
    var obj = amf.read(data, 0);
    assert.equal(true, obj);
  });

  it('should read a Boolean `false` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-boolean-false.bin'));
    var obj = amf.read(data, 0);
    assert.equal(false, obj);
  });

  it('should read a String value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-string.bin'));
    var obj = amf.read(data, 0);
    assert.equal('this is a テスト', obj);
  });

  it('should read an Object value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-object.bin'));
    var obj = amf.read(data, 0);
    assert.deepEqual({ bar: 3.14, foo: 'baz' }, obj);
  });

  it('should read the `null` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-null.bin'));
    var obj = amf.read(data, 0);
    assert.strictEqual(null, obj);
  });

  it('should read the `undefined` value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-undefined.bin'));
    var obj = amf.read(data, 0);
    assert.strictEqual(undefined, obj);
  });

  it('should read a reference object', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-ref-test.bin'));
    var obj = amf.read(data, 0);
    assert(obj[0] === obj[1]);
    assert.deepEqual(Object.keys(obj), [ '0', '1' ]);
    assert.equal(obj[0].bar, 3.14);
    assert.equal(obj[0].foo, 'baz');
  });

  it('should read an EMCA Array', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-ecma-ordinal-array.bin'));

    var array = amf.read(data, 0);
    assert(Array.isArray(array));
    assert.equal(4, array.length);
    assert.deepEqual(Object.keys(array), [ '0', '1', '2', '3' ]);
    assert.equal('a', array[0]);
    assert.equal('b', array[1]);
    assert.equal('c', array[2]);
    assert.equal('d', array[3]);
  });

  it('should read a "strict array"', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-strict-array.bin'));

    var array = amf.read(data, 0);
    assert(Array.isArray(array));
    assert.equal(4, array.length);
    assert.equal('a', array[0]);
    assert.equal('b', array[1]);
    assert.equal('c', array[2]);
    assert.equal('d', array[3]);
  });

  it('should read a Date value', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-date.bin'));

    var date = amf.read(data, 0);
    assert(util.isDate(date));
    assert.equal(1590796800000, date.getTime());
  });

  it('should read an "untyped object"', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-untyped-object.bin'));

    var obj = amf.read(data, 0);
    assert.deepEqual({ baz: null, foo: 'bar' }, obj);
  });

  it('should read a "typed object"', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-typed-object.bin'));

    var obj = amf.read(data, 0);
    assert.deepEqual({ baz: null, foo: 'bar', __className__: 'org.amf.ASClass' }, obj);
  });

  describe('FLV metadata', function () {

    it('should read a basic "name" and "value" from an FLV metadata packet', function () {
      var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-flv-metadata.bin'));
      var info = { offset: 0 };

      var name = amf.read(data, info);
      assert.equal('onMetaData', name);
      assert.equal(13, info.byteLength);

      var obj = amf.read(data, info);
      assert(Array.isArray(obj));
      assert.equal(0, obj.length);
      assert.equal(7.211, obj.duration);
      assert.equal(187.5, obj.audiodatarate);
      assert.equal(22050, obj.audiosamplerate);
      assert.equal(16, obj.audiosamplesize);
      assert.equal(false, obj.stereo);
      assert.equal(2, obj.audiocodecid);
      assert.equal('Lavf54.29.104', obj.encoder);
      assert.equal(138064, obj.filesize);

      assert.equal(info.offset, data.length);
    });

    it('should read a complex "name" and "value" from an FLV metadata packet', function () {
      var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'amf0-flv-metadata-2.bin'));
      var info = { offset: 0 };

      var name = amf.read(data, info);
      assert.equal('onMetaData', name);
      assert.equal(13, info.byteLength);

      var obj = amf.read(data, info);
      assert(Array.isArray(obj));
      assert.equal(obj.duration, 174.986);
      assert.equal(obj.moovPosition, 32);
      assert.equal(obj.width, 640);
      assert.equal(obj.height, 360);
      assert.equal(obj.videocodecid, 'avc1');
      assert.equal(obj.audiocodecid, 'mp4a');
      assert.equal(obj.avcprofile, 77);
      assert.equal(obj.avclevel, 30);
      assert.equal(obj.aacaot, 2);
      assert.equal(obj.videoframerate, 25);
      assert.equal(obj.audiosamplerate, 44100);
      assert.equal(obj.audiochannels, 2);
      assert.deepEqual(obj.trackinfo, [
        { length: 4374000,
          timescale: 25000,
          language: 'eng',
          sampledescription: [ { sampletype: 'avc1' } ]
        },
        { length: 7716864,
          timescale: 44100,
          language: 'eng',
          sampledescription: [ { sampletype: 'mp4a' } ]
        }
      ]);

      assert.equal(info.offset, data.length);
    });

  });

});
