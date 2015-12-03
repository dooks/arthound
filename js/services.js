(function(ng_app) {
  ng_app.factory("State", function($rootScope) {
    var state = {};
    state.state    = "DEFAULT"; // DEFAULT | SEARCHING | ACTIVE
    state.substate = "NONE";    //    NONE | INPUT

    state.changeState = function(state) {
      state.state = state;

      switch(state) {
        case "DEFAULT":
        case "SEARCHING":
          // Clear image list
          // hide base_searches
          ng_app.base_searches.addClass("hidden");
          // hide base_overlay_container
          ng_app.base_overlay_container.addClass("hidden");

          $rootScope.$broadcast("onstatechange");
          break;

        case "ACTIVE":
          // show base_searches
          ng_app.base_searches.removeClass("hidden");
          // show base_overlay_container
          ng_app.base_overlay_container.removeClass("hidden");
          $rootScope.$broadcast("onstatechange");
          break;

        default:
          break;
      }
    };

    state.changeSubstate = function(substate) {
      state.substate = substate;

      switch(substate) {
        case "NONE":
          // hide base_searchbar
          self.substate = "NONE";
          ng_app.base_searchbar.addClass("hidden");
          $rootScope.$broadcast("onsubstatechange");
          break;

        case "INPUT":
          // Show base_searchbar
          self.substate = "INPUT";
          ng_app.base_searchbar.removeClass("hidden");
          $rootScope.$broadcast("onsubstatechange");
          break;

        default:
          break;
      }
    };

    return state;
  });

  ng_app.factory("Keyboard", function($rootScope) {
    var keyboard = {};
    keyboard.key = '';
    keyboard.ord = null;

    keyboard.getKey = function(key_code) {
      keyboard.key = key_code;

      // If keycode is within alphabet
      if((key_code >= 65 && key_code <= 90) || // a-z A-Z
         (key_code === 32) || // space
         (key_code ===  8)) { // backspace
        keyboard.ord = String.fromCharCode(key_code);
      } else if(key_code === 13) {
        keyboard.ord = "ENTER";
      } else if(key_code === 27) {
        keyboard.ord = "ESCAPE";
      } else {
        keyboard.ord = null;
      }

      this.broadcast();
    }

    keyboard.broadcast = function() {
      if(keyboard.ord === "ESCAPE") {
        $rootScope.$broadcast("onkeyesc");
      } else if(keyboard.ord === "ENTER") {
        $rootScope.$broadcast("onkeyenter");
      } else if(keyboard.ord) {
        $rootScope.$broadcast("onkeyup");
      } else {
        // Do not broadcast anything
      }
    };

    return keyboard;
  });

  ng_app.factory("Search", function($rootScope) {
    var search = {};
    search.query = "";

    search.search = function(query) {
      this.broadcast();
    };

    search.broadcast = function() {
      $rootScope.$broadcast("onsearch");
    };

    return search;
  });
}(ng_pokemon));
