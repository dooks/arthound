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

  ng_app.factory("Search", ["$rootScope", "$http", function($rootScope, $http) {
    var search = {};
    search.query = "";
    search.response = {};

    // Search DEFAULTS
    search.limit   = 10;
    search.mature  = false;

    search.clear = function() { search.query = ""; }

    search.search = function(query) {
      // Where the "magic" happens, Performs HTTP search
      //   @query: optional, search query to perform. Uses search.query if blank

      // Form GET request
      // Example REST query for deviantart...
      // https://www.deviantart.com/api/v1/oauth2/browse/tags?tag=charizard&limit=10&mature_content=false
      // Requires OAuth
      $rootScope.$broadcast("onsearching");
      $http( {method: "GET", url: "tests/charizard.json"}).finally(
        // Broadcast that search has been returned
        function returned() { $rootScope.$broadcast("onsearchreturned"); }
      ).then(
        function success(res) {
          search.response = res.data;
          console.log(res);
        },
        function error(res) {
          search.response = {}; // TODO: null, or empty object
          console.log(res);
        }
      );
    };

    return search;
  }]);
}(ng_pokemon));
