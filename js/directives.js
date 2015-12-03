(function(ng_app) {
  ng_app.directive("onkey", function(Keyboard, Search) {
    return {
      link: function(scope, element, attrs) {
        element.bind("keyup", function(ev) {
          // Otherwise, send to "keyboard" service
          Keyboard.getKey(ev.keyCode);
        });
      }
    };
  });

  ng_app.directive("tile", function($compile) {
    return {
      restrict: "E",
      link: function(scope, element, attrs) {
        var html = "<div class='" + attrs.class +
                   "'><img src='" + "img/charizard1.jpg" +
                   "' /></div>";
        var e = $compile(html)(scope);

        e.bind("click", function() {
          // Do nothing...
          console.log("Clicked " + attrs.tag);
        });
        element.replaceWith(e);
      }
    };
  });

}(ng_pokemon));
