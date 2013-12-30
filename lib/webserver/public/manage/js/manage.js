var baseUrl = require.toUrl('./');

var frameworkBin = [
  baseUrl + 'angular/app.js',
  baseUrl + 'angular/services.js',
  baseUrl + 'angular/controllers.js',
  baseUrl + 'angular/directives.js',
  baseUrl + 'angular/filters.js'
];

var manageBin = [
  baseUrl + 'dashboard.js',
  baseUrl + 'nodes.js'
];

//The magic starts only after the document is loaded and joola.io framework is loaded.
$(document).ready(function () {
  joolaio.events.on('core.init.browser-finish', function () {
    define(["require"], function (require) {
      require(frameworkBin, function () {
        angular.bootstrap(document, ['ngjoola']);
        require(manageBin, function () {
          $(window).trigger('page-ready');
        });
      });
    });
  });
});

$.fn.serializeObject = function () {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

$('#addUserBtn').on('click', function () {
  clearDialog('addUserDialog');
  $('#addUserDialog').modal();
})

$.fn.arrayToList = function () {
  var html = '';
  $(this).each(function (i, val) {
    html += "<div class='checkbox'>" +
      "<label>" +
      "<input type='checkbox' value='" + val + "'>" +
      val +
      "</label>" +
      "</div>"
  })
  return html;
}


function clearDialog(container) {
  $('#' + container + ' input:text').val("");
  $('#' + container + ' input:checkbox').prop('checked', false);
  $('#' + container + ' .spinner').css('display', 'none');
}