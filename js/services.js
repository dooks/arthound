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
        case "ACTIVE":
          $rootScope.$broadcast("onstatechange");
          break;
      }
    };

    state.changeSubstate = function(substate) {
      state.substate = substate;

      switch(substate) {
        case "NONE":
        case "INPUT":
          $rootScope.$broadcast("onsubstatechange");
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

    search.clear = function() {
      this.query = "";
    }

    search.search = function(query) {
      // Where the "magic" happens, Performs HTTP search
      //   @query: optional, search query to perform. Uses this.query if blank
      this.broadcast();
    };

    search.broadcast = function() {
      $rootScope.$broadcast("onsearch");
    };

    return search;
  });
}(ng_pokemon));
