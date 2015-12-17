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
          if(key < 32 && key !== 16) Keyboard.getKey(key);
        });

        element.bind("keypress", function(ev) {
          var key = ev.which || ev.keyCode;
          if(key >= 32 && key <= 122) Keyboard.getKey(key);
        });
      }
    };
  });

  ng_app.directive("tile", ["Navigate", function(Navigate) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // Navigate to selected index
        element.bind("click", function() {
          Navigate.to(attrs.index);
          $("div.image-square-container-selected").removeClass("image-square-container-selected");
          $(this).addClass("image-square-container-selected");
        });
      }
    };
  }]);

  ng_app.directive("pagebutton", ["Navigate", function(Navigate) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // Navigates to next page in listing
        element.bind("click", function(ev) {
          ev.stopPropagation();
          if(attrs.pagebutton === "next") { Navigate.nextPage(); }
        });
      }
    };
  }]);


  ng_app.directive("search", ["State", function(State) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        // Close search overlay when clicked
        element.bind("click", function() { State.changeSubstate("SEARCH", false); });
      }
    };
  }]);

  ng_app.directive("navclick", ["State", function(State) {
    return {
      restrict: "A",
      link: function(scope, element, attrs) {
        var func = null;

        switch(attrs.navclick) {
          case "mini":
            func = function() { /* do nothing */ }
            break;
          case "list":
            func = function() {
              State.toggleSubstate("LIST");
              /* do nothing */ }
            break;
          case "full":
            func = function() {
              State.toggleSubstate("FULL");
            }
            break;
          case "save":
            func = function() { /* do nothing */ }
            break;
          case "info":
            func = function() { /* do nothing */ }
            break;
          default:
            func = function() { /* do nothing */ }
            break;
        }

        // Close search overlay when clicked
        element.bind("click", func);
      }
    };
  }]);

}(ng_hound));
