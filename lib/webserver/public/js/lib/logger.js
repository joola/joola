/*
joolaio.objects.logger.fetch(function(err,data) {
  var log = data.logger;
  $(log).each(function(index,value) {
    var row = $("<tr>");
    var logobject = $('#logtbody');
    row.append("<td>" + value.time +"</td>");
    row.append("<td>" + value.hostname +"</td>");
    row.append("<td>" + value.level +"</td>");
    row.append("<td>" + value.pid +"</td>");
    row.append("<td>" + value.msg +"</td>");
    logobject.append(row);
  })
})
  */