$(document).ready(function() {
  // render scrollbar
  $(".scrollbar-inner").scrollbar();

  // Prevent backspace from going back a page...
  $(this).on("keydown", function(ev) {
    if (ev.which === 8) { // backspace
      ev.preventDefault();
    }
  });
});
