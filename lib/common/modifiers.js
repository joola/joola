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

//prototype additions
Date.prototype.format = function (formatString) {
	var formatDate = this;
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var yyyy = formatDate.getFullYear();
	var yy = yyyy.toString().substring(2);
	var m = formatDate.getMonth() + 1;
	var mm = m < 10 ? "0" + m : m;
	var mmm = months[m - 1];
	var d = formatDate.getDate();
	var dd = d < 10 ? "0" + d : d;
	var fff = formatDate.getMilliseconds().toString();
	fff = (fff < 100 ? fff < 10 ? '00' + fff : +'0' + fff : fff);
	var h = formatDate.getHours();
	var hh = h < 10 ? "0" + h : h;
	var n = formatDate.getMinutes();
	var nn = n < 10 ? "0" + n : n;
	var s = formatDate.getSeconds();
	var ss = s < 10 ? "0" + s : s;

	formatString = formatString.replace(/yyyy/i, yyyy);
	formatString = formatString.replace(/yy/i, yy);
	formatString = formatString.replace(/mmm/i, mmm);
	formatString = formatString.replace(/mm/i, mm);
	formatString = formatString.replace(/m/i, m);
	formatString = formatString.replace(/dd/i, dd);
	formatString = formatString.replace(/d/i, d);
	formatString = formatString.replace(/hh/i, hh);
	//formatString = formatString.replace(/h/i, h);
	formatString = formatString.replace(/nn/i, nn);
	//formatString = formatString.replace(/n/i, n);
	formatString = formatString.replace(/ss/i, ss);
	formatString = formatString.replace(/fff/i, fff);
	//formatString = formatString.replace(/s/i, s);

	return formatString;
};

Object.defineProperty(Error.prototype, 'toJSON', {
	value: function () {
		var alt = {};

		Object.getOwnPropertyNames(this).forEach(function (key) {
			alt[key] = this[key];
		}, this);

		return alt;
	},
	configurable: true
});