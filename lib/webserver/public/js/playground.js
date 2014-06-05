joolaio.events.on('ready', function () {
  /*
   $(function () {
   $(".sortable").sortable({
   start: function () {
   $('.dimensionpickers').show();
   },
   stop: function () {
   $('.dimensionpickers').hide();
   },
   placeholder: "ui-state-highlight"
   });
   $(".sortable").disableSelection();
   });*/

  drawCollections(function (err) {
    if (err)
      throw err;
  });

  build(function (err) {
    if (err)
      throw err;
  });
});

var dlasttarget = null;
var mlasttarget = null;
function build(callback) {
  function checkDimensionPickers() {
    var length = $('.dimensionpicker').length;
    if (length <= 0)
      addDimensionPicker(length);
    else {
      var lengthActive = $('.dimensionpicker.active').length;
      if (lengthActive >= length)
        addDimensionPicker(length + 1);
    }
  }

  function addDimensionPicker(index) {
    var $picker = $('<div id="dplaceholder-' + index + '" class="dimensionpicker">+ add dimension</div>');
    $('.dimensionpickers').append($picker);
  }


  function checkMetricPickers() {
    var length = $('.metricpicker').length;
    if (length <= 0)
      addMetricPicker(length);
    else {
      var lengthActive = $('.metricpicker.active').length;
      if (lengthActive >= length)
        addMetricPicker(length + 1);
    }
  }

  function addMetricPicker(index) {
    var $picker = $('<div id="mplaceholder-' + index + '" class="metricpicker">+ add metric</div>');
    $('.metricpickers').append($picker);
  }

  var $dimensionsPopup = $('.dimensionsPopup');
  var $metricsPopup = $('.metricsPopup');
  joolaio.collections.list(function (err, collections) {
    if (err)
      return callback(err);

    collections.forEach(function (collection) {
      var $ul = $('<ul class="collectionOption"><b class="caret"></b> ' + collection.name + '</ul>');
      $metricsPopup.append($ul);
      collection.metrics.forEach(function (metric) {
        var $li = $('<li class="metricOption" data-member="' + collection.key + '.' + metric.key + '">' + metric.name + '</li>');
        $li.on('click', function (e) {
          e.stopPropagation();
          var $placeholder = $('#' + $metricsPopup.attr('data-target'));
          $placeholder.attr('data-selected', collection.key + '.' + metric.key);

          var $content = metric.name + ' <button type="button" class="close">&times;</button>';
          $placeholder.html($content);
          $placeholder.find('button').on('click', function () {
            e.stopPropagation();
            $placeholder.remove();
            mSkipOne = true;
            checkMetricPickers();
          });
          $placeholder.addClass('active');
          $('.metricsPopup').removeClass('active');
          mOpen = false;
          mlasttarget = null;

          checkMetricPickers();
        });
        $ul.append($li);
      });
      $ul.on('click', function (e) {
        console.log('click');
        e.stopPropagation();
        $ul.toggleClass('active');
      });

      var $dul = $('<ul class="collectionOption"><b class="caret"></b> ' + collection.name + '</ul>');
      $dimensionsPopup.append($dul);
      collection.dimensions.forEach(function (dimension) {
        var $li = $('<li class="dimensionOption" data-member="' + collection.key + '.' + dimension.key + '">' + dimension.name + '</li>');
        $li.on('click', function (e) {
          e.stopPropagation();
          var $placeholder = $('#' + $dimensionsPopup.attr('data-target'));
          $placeholder.attr('data-selected', collection.key + '.' + dimension.key);

          var $content = dimension.name + ' <button type="button" class="close">&times;</button>';
          $placeholder.html($content);
          $placeholder.find('button').on('click', function () {
            e.stopPropagation();
            $placeholder.remove();
            dSkipOne = true;
            checkDimensionPickers();
          });
          $placeholder.addClass('active');
          $('.dimensionsPopup').removeClass('active');
          dOpen = false;
          dlasttarget = null;

          checkDimensionPickers();
        });
        $dul.append($li);
      });
      $dul.on('click', function (e) {
        e.stopPropagation();
        $dul.toggleClass('active');
      });
    });
  });

  var dOpen = false;
  var dSkipOne = false;
  $(document).on('click', '.dimensionpicker', function (e) {
    var $this = $(this);
    e.stopPropagation();
    if (dOpen && dlasttarget == this.id) {
      $('.dimensionsPopup').removeClass('active');
      dlasttarget = null;
      dOpen = false;
    }
    else if (dSkipOne) {
      $('.dimensionsPopup').removeClass('active');
      dlasttarget = null;
      dOpen = false;
      dSkipOne = false;
    }
    else {
      $('.dimensionsPopup').addClass('active');
      dlasttarget = this.id;
      dOpen = true;
    }
    var offset = $this.offset();
    $('.dimensionsPopup').css('top', offset.top + $(this).outerHeight() - 1);
    $('.dimensionsPopup').css('left', offset.left);
    $('.dimensionsPopup').find('ul.active').removeClass('active');

    $('.dimensionsPopup').attr('data-target', this.id);

    //set selected
    $dimensionsPopup.find('li').removeClass('active');
    if ($this.attr('data-selected') && $this.attr('data-selected').length > 0) {
      var $li = $($dimensionsPopup.find('li[data-member="' + $this.attr('data-selected') + '"]')[0]);
      $li.addClass('active');
      $li.parent().addClass('active');
    }
  });

  var mOpen = false;
  var mSkipOne = false;
  $(document).on('click', '.metricpicker', function (e) {
    var $this = $(this);
    e.stopPropagation();
    if (mOpen && mlasttarget == this.id) {
      $('.metricsPopup').removeClass('active');
      mlasttarget = null;
      mOpen = false;
    }
    else if (mSkipOne) {
      $('.metricsPopup').removeClass('active');
      mlasttarget = null;
      mOpen = false;
      mSkipOne = false;
    }
    else {
      $('.metricsPopup').addClass('active');
      mlasttarget = this.id;
      mOpen = true;
    }
    var offset = $this.offset();
    $('.metricsPopup').css('top', offset.top + $(this).outerHeight() - 1);
    $('.metricsPopup').css('left', offset.left);
    $('.metricsPopup').find('ul.active').removeClass('active');

    $('.metricsPopup').attr('data-target', this.id);

    //set selected
    $metricsPopup.find('li').removeClass('active');
    if ($this.attr('data-selected') && $this.attr('data-selected').length > 0) {
      var $li = $($metricsPopup.find('li[data-member="' + $this.attr('data-selected') + '"]')[0]);
      $li.addClass('active');
      $li.parent().addClass('active');
    }
  });

  $('.dimensionsPopup').on('click', function (e) {
    e.stopPropagation();
  });

  $('.metricsPopup').on('click', function (e) {
    e.stopPropagation();
  });

  $('body').on('click', function () {
    $('.dimensionsPopup').removeClass('active');
    $('.metricsPopup').removeClass('active');
  });

  checkDimensionPickers();
  checkMetricPickers();
}

function drawCollections(callback) {
  joolaio.collections.list(function (err, collections) {
    if (err)
      return callback(err);
    var $picker = $('#collectionPicker');
    $picker.empty();
    collections.forEach(function (collection) {
      var $option = $('<li role="presentation"><a href="#" role="menuitem">' + collection.name + '</a></li>');
      $option.find('a').on('click', function () {
        var $button = $($picker.parent().find('button'));
        $button.html(collection.name + ' <span class="caret"></span>');
        $button.click();
        return populate(collection.key, function (err) {
          if (err)
            throw err;
        });
      });
      $picker.append($option);
    });

    demo();

    return callback(null);
  });
}

function populate(collectionKey, callback) {
  joolaio.collections.get(collectionKey, function (err, collection) {
    if (err)
      return callback(err);

    var $dimensionsContainer = $('#dimensionsList');
    $dimensionsContainer.empty();
    collection.dimensions.forEach(function (dimension) {
      var $item = $('<div class="dimensionpicker">' + dimension.name + '</div>');
      $item.on('click', function () {
        var $this = $(this);
        $this.toggleClass('active');
      });
      $dimensionsContainer.append($item);
    });

    var $metricsContainer = $('#metricsList');
    $metricsContainer.empty();
    collection.metrics.forEach(function (metric) {
      var $item = $('<div class="metricpicker">' + metric.name + '</div>');
      $item.on('click', function () {
        var $this = $(this);
        $this.toggleClass('active');
      });
      $metricsContainer.append($item);
    });
  });
}


function demo() {
  var $picker = $('#collectionPicker');
  $picker.parent().find('button').html('demo-mousemoves <span class="caret"></span>');
  populate('demo-mousemoves');
};


jQuery.fn.screencenter = function () {
  this.css("position", "absolute");
  this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
  this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  return this;
}