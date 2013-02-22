node-amf
========
### "Action Message Format" read() and write() functions for Buffers
[![Build Status](https://travis-ci.org/TooTallNate/node-amf.png?branch=master)](https://travis-ci.org/TooTallNate/node-amf)

This module reads and writes AMF (Action Message Format, commonly used with
Adobe products) data types with Buffer instances.


Installation
------------

Install through npm:

``` bash
$ npm install amf
```


Example
-------

``` javascript
var amf = require('amf');

// this is an AMF-encoded Object...
var data = new Buffer('03 00 03 66 6f 6f 02 00 03 62 61 72 00 00 09'.replace(/ /g, ''), 'hex');

// read the Object out from the Buffer
var obj = amf.read(data, 0);

console.log(obj);
// { foo: 'bar' }
```


API
---

Coming soon!
