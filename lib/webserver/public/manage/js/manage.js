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
  baseUrl + 'nodes.js',
  baseUrl + 'logger.js',
  baseUrl + 'dispatch.js'
];

//The magic starts only after the document is loaded and joola.io framework is loaded.
$(document).ready(function () {
  define(["require"], function (require) {
    require(frameworkBin, function () {
      angular.bootstrap(document, ['ngjoola']);
      require(manageBin, function () {
        $(window).trigger('page-ready');
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
});

$('#addRoleBtn').on('click', function () {
  clearDialog('addRoleDialog');
  $('#addRoleDialog').modal();
});

$('#addOrgBtn').on('click', function () {
  clearDialog('addOrgDialog');
  $('#addOrgDialog').modal();
});


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
};


function clearDialog(container) {
  $('#' + container + ' input:text').val("");
  $('#' + container + ' input:checkbox').prop('checked', false);
  $('#' + container + ' .spinner').css('display', 'none');
  $('#' + container + ':disabled').attr('disabled', '');
}

function clearNgDialog(container) {
  $('#' + container + ' .spinner').css('display', 'none');
  $('#' + container + ' .btn').prop('disabled', false);
}

var sessionExpiredTimer = 0;

var waitForIdle = function () {
  location.href = '/logout';
};

$(document).on('click', function () {
  clearTimeout(sessionExpiredTimer);
  sessionExpiredTimer = setTimeout(waitForIdle, 20 * 60 * 1000 /* 20 minutes */);
});

sessionExpiredTimer = setTimeout(waitForIdle, 20 * 60 * 1000 /* 20 minutes */);

var buildWidget = function (container, name, value, className, icon, url, urlText) {
  var $panel = $('<div class="panel panel-info"></div>');
  var $heading = $('<div class="panel-heading"></div>');
  var $toprow = $('<div class="row"></div>');
  var $1col = $('<div class="col-xs-1"></div>');
  var $2col = $('<div class="col-xs-7" style="padding-left:10px;padding-right:0"></div>');
  var $3col = $('<div class="col-xs-3" style="padding-right:0;"></div>');
  var $icon = $('<i class="fa fa-1x"></i>');
  var $title = $('<p class="announcement-text"></p>');
  var $value = $('<p class="announcement-text text-right"></p>');

  $panel.append($heading);
  $heading.append($toprow);
  $toprow.append($1col);
  $1col.append($icon);
  $toprow.append($2col);
  $2col.append($title);
  $toprow.append($3col);
  $3col.append($value);

  $icon.addClass(icon);
  $title.html(name);
  $value.html(value);
  $value.addClass(className);

  var $panelfooter = $('<div class="panel-footer announcement-bottom"></div>');
  var $url = $('<a href="' + url + '"></a>');

  var $rowbottom = $('<div class="row"></div>');
  $panelfooter.append($rowbottom);
  $rowbottom.append('<div class="col-xs-8">' + urlText + '</div>');
  $rowbottom.append('<div class="col-xs-4 text-right"><i class="fa fa-arrow-circle-right"></i></div>');
  $url.append($rowbottom);
  $panelfooter.append($url);
  //$panel.append($panelfooter);
  container.append($panel);
  return $panel;
};

$(document).ready(function () {
  var $widget_nodes = $('.widget.widget-nodes');
  if ($widget_nodes)
    buildWidget($widget_nodes, 'Node count', '--', 'manage-dashboard-metric-nodes', 'fa-power-off', '/manage/dashboard/nodes', 'Node Management');
  var $widget_systemload = $('.widget.widget-sytstemload');
  if ($widget_systemload)
    buildWidget($widget_systemload, 'System Load', '--', 'manage-dashboard-metric-load', 'fa-tasks', '/manage/dashboard/nodes', 'Node Management');
  var $widget_systemload = $('.widget.widget-cachehits');
  if ($widget_systemload)
    buildWidget($widget_systemload, 'Cache hit %', '--', 'manage-dashboard-metric-cachehits', 'fa-bullseye', '/manage/dashboard/nodes', 'System Perfomance');
  var $widget_systemload = $('.widget.widget-querytime');
  if ($widget_systemload)
    buildWidget($widget_systemload, 'Query time', '--', 'manage-dashboard-metric-querytime', 'fa-bolt', '/manage/dashboard/nodes', 'System Perfomance');
  var $widget_systemload = $('.widget.widget-eps');
  if ($widget_systemload)
    buildWidget($widget_systemload, 'EPS', '--', 'manage-dashboard-metric-eps', 'fa-signal', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_systemload = $('.widget.widget-fulfilled');
  if ($widget_systemload)
    buildWidget($widget_systemload, 'Fulfilled %', '--', 'manage-dashboard-metric-fulfilled', 'fa-check', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_systemload = $('.widget.widget-elb');
  if ($widget_systemload)
    buildWidget($widget_systemload, 'Dead locks', '--', 'manage-dashboard-metric-elb', 'fa-lock', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_exceptions = $('.widget.widget-exceptions');
  if ($widget_exceptions)
    buildWidget($widget_exceptions, 'Exceptions', '--', 'manage-dashboard-metric-exceptions', 'fa-lock', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_roundtrip = $('.widget.widget-roundtrip');
  if ($widget_roundtrip)
    buildWidget($widget_roundtrip, 'Roundtrip', '--', 'manage-dashboard-metric-roundtrip', 'fa-bolt', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_tokens = $('.widget.widget-tokens');
  if ($widget_tokens)
    buildWidget($widget_tokens, 'Tokens', '--', 'manage-dashboard-metric-tokens', 'fa-users', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_fulfilltime = $('.widget.widget-fulfilltime');
  if ($widget_fulfilltime)
    buildWidget($widget_fulfilltime, 'Fulfill time', '--', 'manage-dashboard-metric-fulfilltime', 'fa-bolt', '/manage/dashboard/nodes', 'Dispatch Overview');
  var $widget_waittime = $('.widget.widget-waittime');
  if ($widget_waittime)
    buildWidget($widget_waittime, 'Wait time', '--', 'manage-dashboard-metric-waittime', 'fa-bolt', '/manage/dashboard/nodes', 'Dispatch Overview');


});