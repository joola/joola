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

function logger_setup() {

  var keepBottom = true;

  var loadMore = function () {
    joolaio.dispatch.logger.fetchUntil(firstTimestamp, function (err, logs) {
      if (logs.length == 0)
        return;
      firstTimestamp = logs[logs.length - 1].time;
      pushLog(logs, true);

      $('.logger .historyLink img').hide();
      $('.logger').scrollTop(logs.length * 27);
    });
  };

  var loadInitial = function () {
    var arr = [];
    for (var i = 0; i < 100; i++)
      arr.push(
        {
          timestamp: new Date(),
          node: '1234',
          hostname: 'office-itayarr);',
          message: 'testing log record'
        }
      );

    pushLog(arr)
  };

  var pushLog = function (items, prepend) {
    var $logger = $('.logger');
    var $insertAfter = $('.loadLink');

    if (prepend) {
      $insertAfter.after('<hr>');
    }


    items.forEach(function (item) {
      var $item = $('<div class="logrecord"></div>');

      var $timestamp = $('<div class="timestamp"></div>');
      var $level = $('<div class="level"></div>');
      var $hostname = $('<div class="hostname"></div>');
      var $message = $('<div class="message"></div>');

      $timestamp.text(new Date(item.time).format('hh:nn:ss.fff'));
      $hostname.text(item.hostname);
      var $label = $('<span></span>');
      switch (item.level) {
        case 10:
          $label.addClass('label label-default');
          $label.text('trace');
          break;
        case 20:
          $label.addClass('label label-info');
          $label.text('debug');
          break;
        case 30:
          $label.addClass('label label-primary');
          $label.text('info');
          break;
        case 40:
          $label.addClass('label label-warning');
          $label.text('warn');
          break;
        case 50:
          $label.addClass('label label-danger');
          $label.text('error');
          break;
        case 60:
          $label.addClass('label label-danger');
          $label.text('fatal');
          break;
        default:
          $label.addClass('label label-info');
          $label.text('info');
          break;
      }
      $level.append($label);
      $message.text(item.msg);

      $item.append($timestamp);
      $item.append($level);
      $item.append($hostname);
      $item.append($message);

      if (!prepend)
        $logger.append($item);
      else
        $insertAfter.after($item);

    });
    if (keepBottom) {
      $('.logger').show();
      document.getElementById('logger').scrollTop = document.getElementById('logger').scrollHeight;
    }

  };

  var lastTimestamp, firstTimestamp;

  $('.logger').hide();
  joolaio.dispatch.logger.fetch(function (err, logs) {
    logs.reverse();
    firstTimestamp = logs[0].time;
    lastTimestamp = logs[logs.length - 1].time;
    pushLog(logs);
    $('.logger').show();

    var fetchNew = function () {
      joolaio.dispatch.logger.fetchSince(lastTimestamp, function (err, logs) {
        console.log('new');
        setTimeout(fetchNew, 1000);
        if (logs.length == 0)
          return;
        lastTimestamp = logs[logs.length - 1].time;
        pushLog(logs);

      });
    };
    setTimeout(fetchNew, 0);
  });

  $(document).ready(function () {

    var $body = $('body');
    var $logger = $('#logger');
    var logger = document.getElementById('logger');

    $logger.height($body.innerHeight() - $body.offset().top - $logger.offset().top);
    $body.css('padding-bottom', 0);

    logger.onscroll = function (e) {

      if ($logger.scrollTop() == 0) {
        $('.logger .historyLink img').show();
        loadMore();
      }
      else keepBottom = ($logger.scrollTop() + $logger.innerHeight()) >= logger.scrollHeight;
    };
  });
}