$(document).ready(function() {
    var fish = 0;
    $('video')[0].onplay = function() { 
      fish++;
      $.post('http://localhost:8080/', '${fish}');
    };
});
