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
          var key = ev.which || ev.keyCode;
          if(key === 27 || key === 13 || (key >= 37 && key <= 40)) Keyboard.getKey(key);
        });

        element.bind("keypress", function(ev) {
          var key = ev.which || ev.keyCode;
          if(key === 32 || key >= 48 && key <= 122) Keyboard.getKey(key);
        });
      }
    };
  });

  ng_app.directive("tile", ["State", "Navigate", function(State, Navigate) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // Navigate to selected index
        element.bind("click", function() { Navigate.to(attrs.index); });
      }
    };
  }]);

  ng_app.directive("navclick", ["State", "Search", "Navigate", function(State, Search, Navigate) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var func = null;

        switch(attrs.navclick) {
          case "overlay":
            func = function() { State.toggleSubstate("OVERLAY"); };
            break;
          case "search":
            func = function() { State.changeSubstate("LOAD", true); Search.get(); };
            break;
          case "search_overlay":
            func = function() { State.toggleSubstate("SEARCH"); };
            break;
          case "mini":
            func = function() { /* do nothing */ };
            break;
          case "list":
            func = function() {
              State.toggleSubstate("LIST");
              /* do nothing */ }
            break;
          case "full":
            func = function() {
              State.toggleSubstate("FULL");
              if(State.substates["LIST"]) State.changeSubstate("LIST", false);
            };
            break;
          case "next":
            func = function() { Navigate.next(); };
            break;
          case "prev":
            func = function() { Navigate.prev(); };
            break;
          case "page_next":
            func = function() { Navigate.nextPage(); };
            break;
          case "page_prev":
            func = function() { Navigate.prevPage(); };
            break;
          case "save":
            func = function() { /* do nothing */ };
            break;
          case "info":
            func = function() { /* do nothing */ };
            break;
          default:
            func = function() { /* do nothing */ };
            break;
        }

        // Close search overlay when clicked
        element.bind("click", func);
      }
    };
  }]);

}(ng_hound));
