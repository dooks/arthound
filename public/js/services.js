function shuffle(o){
  // Shuffle array o
  for(var j, x, i = o.length;
      i;
      j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

(function(ng_app) {
  ng_app.service("State", ["$rootScope", function($rootScope) {
    // TODO: why does initializing this make it persistent....?
    var self = this;
    self.state    = "DEFAULT"; // DEFAULT | SEARCHING | ACTIVE
    self.substate = "NONE";    //    NONE | INPUT

    self.changeState = function(state) {
      self.state = state;

      switch(state) {
        case "DEFAULT":
        case "SEARCHING":
        case "ACTIVE":
          $rootScope.$broadcast("onstatechange");
          break;
      }
    };

    self.changeSubstate = function(substate) {
      self.substate = substate;

      switch(substate) {
        case "NONE":
        case "INPUT":
          $rootScope.$broadcast("onsubstatechange");
          break;
      }
    };
  }]);

  ng_app.service("Keyboard", ["$rootScope", function($rootScope) {
    var self = this;
    self.key = '';
    self.ord = null;

    self.getKey = function(key_code) {
      self.key = key_code;

      // If keycode is within alphabet
      if((key_code >= 65 && key_code <= 90) // a-z A-Z
         || (key_code === 32)) {            // space
        self.ord = String.fromCharCode(key_code);        }
      else if(key_code === 8)  { self.ord = "BACKSPACE"; }
      else if(key_code === 13) { self.ord = "ENTER";     }
      else if(key_code === 27) { self.ord = "ESCAPE";    }
      else                     { self.ord = null;        }
      self.broadcast();
    }

    self.broadcast = function() {
      if(self.ord === "ESCAPE") {
        $rootScope.$broadcast("onkeyesc");
      } else if(self.ord === "ENTER") {
        $rootScope.$broadcast("onkeyenter");
      } else if(self.ord === "BACKSPACE") {
        $rootScope.$broadcast("onkeybackspace");
      } else if(self.ord) {
        $rootScope.$broadcast("onkeyup");
      } else {
        // Do not broadcast anything
      }
    };

  }]);

  ng_app.service("Search", ["$rootScope", "$http", function($rootScope, $http) {
    var self = this;
    self.query    = "";
    self.response = {};
    self.sources  = [ "deviantart" ];

    // Search DEFAULTS
    self.limit   = 10;
    self.mature  = false;

    self.clear         = function() { self.query = ""; }
    self.clearResponse = function() { delete self.response; self.response = {}; }
    self.pruneResponse = function() {
      // If greater than 5 chunks, lop off first...
    }

    self.suggestions = function(query) {
      // Provide list of similar Pokemon queries to aid with mispellings
    };

    self.queue = function(query, page, limit) {
      // Where the "magic" happens, Performs HTTP search
      // Appends to search.response per chunk
      //   @query: optional, search query to perform. Uses search.query if blank
      var new_page = page || 0;

      $http({
        method: "GET",
        url: "/get/request",
        params:   {
          "tags":   self.query,
          "page":     new_page,
          "limit": limit || 24 // Server hard limit
        }
      }).then(
          function success(res) {
            // Append to response
            //self.response.push({ new_page : res });
            self.response = res.data;
            console.log(self.response);
          },
          function error(res) {
            this.response = {};
            console.error(res);
          }
      ).finally(
        // Broadcast that search has been returned
        function returned() { $rootScope.$broadcast("onsearchreturned"); }
      );
    }; // end of search function
  }]);

  ng_app.service("Navigate", ["$rootScope", function($rootScope) {
    var self = this;
    self.listing = []; // Contains listing data
    self.current =  0;// Index of image to be displayed

    self.populate = function(obj) {
      // Populate self.listing and broadcast event
      if(obj) self.listing = obj;
      else self.listing = [];

      // Shuffle listing...
      shuffle(self.listing);

      self.broadcastPop();
    };

    self.next = function() {
      if((self.current + 1) < self.listing.length) {
        self.current += 1; self.broadcastNav(); return true;
      } else { return false; }
    };

    self.prev = function() {
      if((self.current - 1) >= 0) {
        self.current -= 1; self.broadcastNav(); return true;
      } else { return false; }
    };

    self.to = function(n) {
      if(n < self.listing.length && n >= 0) {
        self.current = n; self.broadcastNav(); return true;
      } else { return false; }
    };

    self.broadcastNav = function() { $rootScope.$broadcast("onnavigate"); }
    self.broadcastPop = function() { $rootScope.$broadcast("onnavigatepop"); }
  }]);
}(ng_pokemon));
