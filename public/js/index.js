// Wrap IIFE around your code
(function($, viewport, ng_app) {

  $(document).ready(function() {

    // Prevent backspace from going back a page...
    $(this).on("keydown", function(ev) {
      if (ev.which === 8) { // backspace
        ev.preventDefault();
      }
    });
  });

})(jQuery, ResponsiveBootstrapToolkit, ng_hound);
