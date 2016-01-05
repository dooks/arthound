(function(ng_app) {
  ng_app.directive("href", function(Keyboard, Search) {
    return {
      compile: function(element) {
        element.attr("target", "_blank");
      }
    };
  });

  ng_app.directive("search", ["State", function(State) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        element.bind("click", function(ev) {
          if(ev.target !== this) { return; } // if haven't click children...
          else { State.changeSubstate("SEARCH", false); }
        });
      }
    };
  }]);

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

  ng_app.directive("mouse", function() {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // TODO: find better way to parse attrs...
        var property = attrs.mouse.split(".");
        element.bind("wheel", scope[property[0]][property[1]]);
      }
    };
  });

  ng_app.directive("navclick",
    ["$rootScope", "State", "Search", "Navigate",
    function($rootScope, State, Search, Navigate) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var func = null;

        switch(attrs.navclick) {
          case "zoom":
            func = function() {
              Navigate.current.zoom = !Navigate.current.zoom;
              Navigate.to(Navigate.current.index);
            };
            break;
          case "tile":
            func = function() { Navigate.to(attrs.index); };
            break;
          case "overlay":
            func = function() { State.toggleSubstate("OVERLAY"); };
            break;
          case "search":
            func = function() { $rootScope.$broadcast("onkeyenter"); };
            break;
          case "search_overlay":
            func = function() {
              State.toggleSubstate("SEARCH");
              ng_app.searchbar_search.focus();
            };
            break;
          case "grid":
            func = function() { State.toggleSubstate("LIST"); }
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
          case "info":
            func = function() { ng_app.modal_info.modal({ keyboard: true }); };
            break;
          case "options":
            func = function() { ng_app.modal_options.modal({ keyboard: true }); };
            break;
          case "help":
            func = function() { ng_app.modal_help.modal({ keyboard: true }); };
            break;
          case "about":
            func = function() { ng_app.modal_about.modal({ keyboard: true }); };
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
