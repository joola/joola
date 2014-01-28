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
  baseUrl + 'dispatch.js',
  baseUrl + 'POC.js'
];

joolaio.init({});

//The magic starts only after the document is loaded and joola.io framework is loaded.
//$(document).ready(function () {

define(["require"], function (require) {
  joolaio.events.on('core.init.finish', function () {
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

function validateForm(container, elements) {
  var pass = true;
  $('#' + container + ' .form-group').removeClass('has-error');
  elements.forEach(function (el) {
    if (el.type == 'text') {
      var jel = $('#' + container + ' #' + el.id);
      if ($(jel).val().length < el.minlength) {
        $(jel).closest('.form-group').addClass('has-error');
        pass = false;
      }
    }

    else if (el.type == 'checkbox' || el.type == 'radio') {
      var jel = $('#' + container + ' input[name=' + el.id + ']');
      if (el.minlength > 0 && !$(jel).is(':checked')) {
        $(jel).closest('.form-group').addClass('has-error');
        pass = false;
      }
    }
  })
  return pass;
}

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

function clearColors(elem) {
  elem.removeClass('panel-info');
  elem.removeClass('panel-primary');
  elem.removeClass('panel-warn');
  elem.removeClass('panel-success');
  elem.removeClass('panel-danger');
}

function setup_dispatch() {
  joolaio.io.socket.on('stats', function (message) {
    switch (message.id) {
      case 'stats:usage-current':
        var cpuAvg = message.data[0].cpu;
        cpuAvg = Math.round(cpuAvg);
        var $metric = $('.manage-dashboard-metric-load');
        var $panel = $metric.parentsUntil('.panel').parent();

        $metric.text(cpuAvg + '%');

        clearColors($panel);
        if (cpuAvg >= 90)
          $panel.addClass('panel-danger');
        else if (cpuAvg >= 50)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;
      case 'stats:nodecount-current':
        var nodes;
        if (message.data.length > 0)
          nodes = message.data[0].nodes;
        else
          nodes = 0;
        $('.manage-dashboard-metric-nodes').text(nodes);
        break;
      case 'stats:eventlooplocks-current':
        var eventlooplocks;
        if (message.data.length > 0)
          eventlooplocks = message.data[0].eventlooplocks;
        else
          eventlooplocks = 0;

        var $metric = $('.manage-dashboard-metric-elb');
        var $panel = $metric.parentsUntil('.panel').parent();
        $metric.text(eventlooplocks);

        clearColors($panel);
        if (eventlooplocks >= 5)
          $panel.addClass('panel-danger');
        else if (eventlooplocks >= 1)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;
      case 'stats:waittime-current':
        var waittime;
        if (message.data.length > 0)
          waittime = Math.round(message.data[0].waittime * 100) / 100;
        else
          waittime = 0;

        var $metric = $('.manage-dashboard-metric-waittime');
        var $panel = $metric.parentsUntil('.panel').parent();
        $metric.html(waittime + '<span style="text-transform:none">ms</span>');

        clearColors($panel);
        if (waittime >= 1000)
          $panel.addClass('panel-danger');
        else if (waittime >= 100)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;
      case 'stats:querytime-current':
        var querytime;
        if (message.data.length > 0)
          querytime = Math.round(message.data[0].querytime * 100) / 100;
        else
          querytime = 0;

        var $metric = $('.manage-dashboard-metric-querytime');
        var $panel = $metric.parentsUntil('.panel').parent();
        $metric.html(querytime + '<span style="text-transform:none">ms</span>');

        clearColors($panel);
        if (querytime >= 1000)
          $panel.addClass('panel-danger');
        else if (querytime >= 100)
          $panel.addClass('panel-warning');
        else
          $panel.addClass('panel-success');
        break;

      case 'stats:eventlooplocks-lasthour':
        break;

      case 'stats:events-current':
        var events;
        if (message.data.length > 0)
          events = message.data[0].events;
        else
          events = 0;

        var $metric = $('.manage-dashboard-metric-eps');

        $metric.text(events);
        break;
      case 'stats:tokens-current':
        var tokens;
        if (message.data.length > 0)
          tokens = message.data[0].tokens;
        else
          tokens = 0;

        var $metric = $('.manage-dashboard-metric-tokens');

        $metric.text(tokens);
        break;
      case 'stats:fulfillment-current':
        var fulfillment;
        if (message.data.length > 0)
          fulfillment = message.data[0].fulfillment;
        else
          fulfillment = -1;

        var $metric = $('.manage-dashboard-metric-fulfilled');

        if (fulfillment > -1)
          $metric.text(fulfillment + '%');
        else
          $metric.text('--');
        break;
      case 'stats:fulfillment-time':
        var fulfilledtime;
        if (message.data.length > 0)
          fulfilledtime = Math.round(message.data[0].fulfilledtime * 10) / 10;
        else
          fulfilledtime = -1;

        var $metric = $('.manage-dashboard-metric-fulfilltime');

        if (fulfilledtime == -1)
          $metric.html('--');
        else
          $metric.html(fulfilledtime + '<span style="text-transform:none">ms</span>');
        break;
      case 'stats:roundtrip-current':
        var roundtrip;
        if (message.data.length > 0)
          roundtrip = message.data[0].roundtrip;
        else
          roundtrip = -1;

        var $metric = $('.manage-dashboard-metric-roundtrip');

        if (roundtrip == -1)
          $metric.html('--');
        else
          $metric.html(roundtrip + '<span style="text-transform:none">ms</span>');
        break;

      default:
        break;
    }
  });
}
//Left nav js
$(document).ready(function () {
  window.prettyPrint && prettyPrint()
});

$('.topicheader').on('click', function () {
  $(this).parent().find('ul').slideToggle();
});
if (location.pathname == '/manage/dashboard/index') {
  $('.topic-dashboards').addClass('active');
  $('#dashboard-overview').addClass('active');
}
if (location.pathname == '/manage/dashboard/nodes') {
  $('.topic-dashboards').addClass('active');
  $('#nodes').addClass('active');
}
if (location.pathname == '/manage/dashboard/dispatch') {
  $('.topic-dashboards').addClass('active');
  $('#dispatch').addClass('active');
}

if (location.pathname == '/manage/users/index') {
  $('.topic-usermanagement').addClass('active');
  $('#users').addClass('active');
}
if (location.pathname == '/manage/users/roles') {
  $('.topic-usermanagement').addClass('active');
  $('#roles').addClass('active');
}
if (location.pathname == '/manage/users/organizations') {
  $('.topic-usermanagement').addClass('active');
  $('#orgs').addClass('active');
}

if (location.pathname == '/manage/settings/index') {
  $('.topic-settings').addClass('active');
}

if (location.pathname == '/manage/users/index') {
  usersOpen = true;
  users_users = true;
}
if (location.pathname == '/manage/users/roles') {
  usersOpen = true;
  users_roles = true;
}
if (location.pathname == '/manage/users/organizations') {
  usersOpen = true;
  users_orgs = true;
}