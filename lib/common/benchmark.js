/**
 *  @title joola.io/lib/common/benchmark
 *  @overview Provides benchmark facility for joola.io. This is mainly used for testing, but not only.
 *  @description
 *  Response time and overall system performance is an important and integral part of joola.io. We use `benchmark`
 *  to evaluate system performance as part of the test suite, but also during runtime to ensure system effectiveness.
 *  @copyright (c) Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>. Some rights reserved. See LICENSE, AUTHORS
 **/

var benchmark = exports;

benchmark.byteCount = function (object) {

  var objectList = [];
  var stack = [ object ];
  var bytes = 0;

  while (stack.length) {
    var value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    }
    else if (typeof value === 'string') {
      bytes += value.length * 2;
    }
    else if (typeof value === 'number') {
      bytes += 8;
    }
    else if
      (
      typeof value === 'object'
        && objectList.indexOf(value) === -1
      ) {
      objectList.push(value);

      for (i in value) {
        stack.push(value[ i ]);
      }
    }
  }
  return bytes;
};

benchmark.setup = function () {
  var str = "";

  var i = 1200000;
  while (i--) {
    str += " This is a test.";
  }
  return str;
};