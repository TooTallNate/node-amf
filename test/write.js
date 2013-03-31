
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

});
