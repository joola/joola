'use strict';

var memory = function () {
  this.content = {};

  this.set = function (key, data, expire) {
    expire = expire || 1000;
    this.remove(key);
    this.content[key] = {
      data: data,
      timer: setTimeout(function () {
        this.remove(key);
      }.bind(this), expire)
    };
  };

  this.get = function (key) {
    if (typeof(this.content[key]) !== "undefined" && this.content[key] !== null && typeof(this.content[key].data) !== "undefined" && this.content[key].data !== null) {
      return this.content[key].data;
    }
    return null;
  };

  this.remove = function (key) {
    if (typeof(this.content[key]) !== "undefined" && this.content[key] !== null && typeof(this.content[key].timer) !== "undefined" && this.content[key].timer !== null) {
      clearTimeout(this.content[key].timer);
      delete this.content[key];
    }
  };

  this.getStoreContent = function () {
    return this.content;
  };
};

module.exports = new memory();