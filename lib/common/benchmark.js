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

benchmark.byteCount = function (s) {
  return encodeURI(s).split(/%..|./).length - 1;
};

benchmark.setup = function () {
  var str = "";

  var i = 100000;
  while (i--) {
    str += " This is a test.";
  }

  return str;
};