
/**
 * Module dependencies.
 */

var fs = require('fs');
var amf = require('../');
var path = require('path');
var assert = require('assert');

describe('read()', function () {

  it('should read a Person object', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'person.amf0'));
    var obj = amf.read(data, 0);
    assert.deepEqual(obj, { name: 'Mike', age: '30', alias: 'Mike' });
  });

  it('should read an FLV metadata object', function () {
    var data = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'metadata.amf'));
    var offset = 0;
    var info = { byteLength: 0 };

    var obj = amf.read(data, offset, info);
    assert.equal('onMetaData', obj);
    assert.equal(13, info.byteLength);

    offset += info.byteLength;
    info.byteLength = 0;

    obj = amf.read(data, offset, info);
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
  });

});
