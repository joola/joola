"use strict";

var
	path = require('path');

global.sinon = require('sinon');
global.should = require('should');
global.assert = require('assert');
global._ = require("underscore");

var chai = require('chai');
chai.use(require('sinon-chai'));
global.expect = chai.expect;

global.common = exports;

global._joolaio = null;
global._sdk = null;
global.nolog = true;

process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //allow node-request to deal with Error: DEPTH_ZERO_SELF_SIGNED_CERT

global.hook_stdout = function (callback) {
	var old_write = process.stdout.write;

	process.stdout.write = (function (write) {
		return function (string, encoding, fd) {
			//write.apply(process.stdout, arguments);
			callback(string, encoding, fd);
		}
	})(process.stdout.write);

	return function () {
		process.stdout.write = old_write;
	}
};