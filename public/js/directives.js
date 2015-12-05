(function(ng_app) {
  ng_app.directive("href", function(Keyboard, Search) {
    return {
      compile: function(element) {
        element.attr("target", "_blank");
      }
    };
  });

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

  ng_app.directive("tile", ["Navigate", function(Navigate) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // Navigate to selected index
        element.bind("click", function() { Navigate.to(attrs.index); });
      }
    };
  }]);


  ng_app.directive("search", ["State", function(State) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // Close search overlay when clicked
        element.bind("click", function() { State.changeSubstate("NONE"); });
      }
    };
  }]);

}(ng_pokemon));
