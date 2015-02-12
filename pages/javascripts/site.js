function setupSearch() {
  $('#tipue_search_input').tipuesearch({
    'mode': 'json',
    'contentLocation': 'search_index.json',
    showURL: false
  });
  $('#tipue_search_input').attr('placeholder', 'What are you looking for?');
}

function setupDocumentation() {
  if (location.href.toLowerCase().indexOf('rest.html') > -1)
    setupDocumentationREST();
  else
    setupDocumentationNormal();
}

function setupDocumentationNormal() {
  var trailingHeadings = function (elem) {
    var stop = false;
    var counter = 0;
    var sub_items = [];
    var $next = elem;
    while (!stop && ++counter < 100) {
      $next = $($next.next());
      if (!$next)
        stop = true;
      if ($next.prop('tagName') === 'H2') {
        if ($next && $next.text) {
          var anchor = $next.text().replace(/\W+/g, '-').replace(/\s/g, '-');
          $next.attr('id', anchor);
          var $li = $('<li></li>');
          var $a = $('<a></a>');
          $a.attr('href', '#' + anchor);
          $a.text($next.text());
          $li.append($a);
          sub_items.push($li.get(0));
        }
      }
      else if ($next.prop('tagName') === 'H1') {
        stop = true;
      }
    }
    return sub_items;
  };

  var list_items = [];
  $('.page-wrapper h1').each(function (i) {
    var $this = $(this);

    var sub_items = trailingHeadings($this);
    if ($this && $this.text) {
      var anchor = $this.text().replace(/\W+/g, '-').replace(/\s/g, '-');
      $this.attr('id', anchor);
      var $li = $('<li></li>');
      var $a = $('<a></a>');
      $a.attr('href', '#' + anchor);
      $a.text($this.text());
      $li.append($a);
      //if (i === 0)
      // $li.addClass('active');
      if (sub_items.length > 0) {
        var $ul = $('<ul class="nav"></ul>');
        sub_items.forEach(function (item) {
          $ul.append(item);
        });
        $li.append($ul);
      }
      list_items.push($li);
    }
  });
  var $li = $('<li></li>');
  var $a = $('<a></a>');
  $a.attr('href', '#overview');
  $li.addClass('active');
  $a.text('Overview');
  $li.append($a);
  $('#list-items').append($li);
  list_items.forEach(function ($li) {
    $('#list-items').append($li);
  });
}

function setupDocumentationREST() {
  var trailingHeadings = function (elem, tag) {
    var stop = false;
    var counter = 0;
    var sub_items = [];
    var $next = elem;
    while (!stop && ++counter < 100) {
      $next = $($next.next());
      if (!$next)
        stop = true;
      if ($next.prop('tagName') === tag) {
        if ($next && $next.text) {
          var anchor = $next.text().replace(/\W+/g, '-').replace(/\s/g, '-');
          $next.attr('id', anchor);
          var $li = $('<li></li>');
          var $a = $('<a></a>');
          $a.attr('href', '#' + anchor);
          $a.text($next.text());
          $li.append($a);
          sub_items.push($li.get(0));
        }
      }
      else if ($next.prop('tagName') === 'H1') {
        stop = true;
      }
    }
    return sub_items;
  };

  var list_items = [];
  $('.page-wrapper h1').each(function (i) {
    var $this = $(this);
    var sub_items = null;
    if ($this && $this.text) {
      if ($this.text().indexOf('Group') > -1)
        sub_items = trailingHeadings($this, 'H3');
      else
        sub_items = trailingHeadings($this, 'H2');

      var anchor = $this.text().replace(/\W+/g, '-').replace(/\s/g, '-');
      $this.attr('id', anchor);
      var $li = $('<li></li>');
      var $a = $('<a></a>');
      $a.attr('href', '#' + anchor);
      $a.text($this.text().replace('Group ', ''));
      $li.append($a);
      //if (i === 0)
      // $li.addClass('active');
      if (sub_items.length > 0) {
        var $ul = $('<ul class="nav"></ul>');
        sub_items.forEach(function (item) {
          $ul.append(item);
        });
        $li.append($ul);
      }
      list_items.push($li);
    }
  });
  var $li = $('<li></li>');
  var $a = $('<a></a>');
  $a.attr('href', '#overview');
  $li.addClass('active');
  $a.text('Overview');
  $li.append($a);
  $('#list-items').append($li);
  list_items.forEach(function ($li) {
    $('#list-items').append($li);
  });
  $('code.language-text').addClass('prettyprint');
  $('table').addClass('table table-bordered table-striped');
  $('h1').each(function () {
    var $this = $(this);
    var caption = $this.text();
    caption = caption.replace('Group ', '');
    $this.text(caption);
  });
}

function setupAffix() {
  $('#doc-affix').affix({
    offset: {
      top: 310,
      bottom: function () {
        return (this.bottom = $('.footer').outerHeight(true))
      }
    }
  });
  $('body').scrollspy({ target: '#doc-affix' });
  $('[data-spy="scroll"]').each(function () {
    var $spy = $(this).scrollspy('refresh')
  });
}

jQuery(document).ready(function () {
  prettyPrint();
  jQuery('abbr.timeago').timeago();

  setupSearch();
  setupDocumentation();
  setupAffix();
});