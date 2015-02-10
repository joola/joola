jQuery(document).ready(function () {
  prettyPrint();
  jQuery('abbr.timeago').timeago();
  $('#tipue_search_input').tipuesearch({
    'mode': 'json',
    'contentLocation': 'search_index.json',
    showURL:false,
    highlightTerms:true
  });
});