function setupSearch() {
  if ($('#tipue_search_input').length === 0)
    return;
  var $input = $('#tipue_search_input');
  $input.tipuesearch({
    'mode': 'json',
    'contentLocation': 'search_index.json',
    showURL: false
  });
  $input.attr('placeholder', 'What are you looking for?');
}

function setupDocumentationLinks() {
  ['.markdown-body h1', '.markdown-body h2', '.markdown-body h3'].forEach(function (tag) {
    $(tag).each(function () {
      var $this = $(this);
      if (!$this.attr('id')) {
        var anchor = $this.text().replace(/\W+/g, '-').replace(/\s/g, '-');
        $this.attr('id', anchor);
      }
      var $a = $('<a class="anchor" href="#' + $this.attr('id') + '" aria-hidden="true"><span class="octicon octicon-link"></span></a>');
      $this.prepend($a);
    });
  });
}

function setupDocumentation() {
  setupDocumentationNormal();
  setupDocumentationLinks();
  setupTOC();
}

function setupTOC() {
  if ($('.post-content.no-toc').length > 0)
    return;
  var $toc = $('<ul class="toc"></ul>');
  $('.markdown-body h1').each(function () {
    var $this = $(this);
    var $link = $('<li><a href="#' + $this.attr('id') + '">' + $this.text() + '</a></li>');
    $toc.append($link);
  });
  $($('.markdown-body h1')[0]).before($toc);
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
  $('.markdown-body h1').each(function (i) {
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
  jQuery('abbr.timeago').timeago();

  $('table').addClass('table table-striped table-bordered');

  setupSearch();
  setupDocumentation();
  setupAffix();
});