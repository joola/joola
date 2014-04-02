/**
 *  joola.io
 *
 *  Copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 *
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 */


describe("common-dateformat", function () {
  it("should format a date correctly yyyy-mm-dd", function () {
    var date = new Date();

    var yyyy = date.getFullYear(), m = (date.getMonth() + 1), d = date.getDate();

    var mm = m < 10 ? "0" + m : m;
    var dd = d < 10 ? "0" + d : d;

    var expected = yyyy + '-' + mm + '-' + dd;
    var actual = date.format('yyyy-mm-dd');
    expect(actual).to.equal(expected);
  });

  it("should format a date correctly yyyy-mm-dd hh:nn:ss", function () {
    var date = new Date();

    var yyyy = date.getFullYear(), m = (date.getMonth() + 1), d = date.getDate(), h = date.getHours(), n = date.getMinutes(), s = date.getSeconds();

    var mm = m < 10 ? "0" + m : m;
    var dd = d < 10 ? "0" + d : d;
    var hh = h < 10 ? "0" + h : h;
    var nn = n < 10 ? "0" + n : n;
    var ss = s < 10 ? "0" + s : s;

    var expected = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss;
    var actual = date.format('yyyy-mm-dd hh:nn:ss');
    expect(actual).to.equal(expected);
  });

  it("should format a date correctly yyyy-mm-dd hh:nn:ss.fff", function () {
    var date = new Date();

    var yyyy = date.getFullYear(), m = (date.getMonth() + 1), d = date.getDate(), h = date.getHours(), n = date.getMinutes(), s = date.getSeconds(), f = date.getMilliseconds();

    var mm = m < 10 ? "0" + m : m;
    var dd = d < 10 ? "0" + d : d;
    var hh = h < 10 ? "0" + h : h;
    var nn = n < 10 ? "0" + n : n;
    var ss = s < 10 ? "0" + s : s;
    var ff = f < 10 ? "0" + f : f;
    var fff = ff < 100 ? "0" + ff : ff;

    var expected = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + nn + ':' + ss + '.' + fff;
    var actual = date.format('yyyy-mm-dd hh:nn:ss.fff');
    expect(actual).to.equal(expected);
  });
});