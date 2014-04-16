jQuery(document).ready(function () {
  prettyPrint();
});

$(document).on('click', '.dropdown-menu li', function (e) {
  e.stopPropagation();
});