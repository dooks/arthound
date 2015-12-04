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

  ng_app.directive("tile", [function() {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        element.bind("click", function() { console.log("Clicked " + attrs.tag); });
      }
    };
  }]);

}(ng_pokemon));
