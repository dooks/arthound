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
    self.query      = "";
    self.last_query = "";
    self.response   = {};
    self.sources    = [ "deviantart" ];

    self.clear         = function() { self.query = ""; }
    self.clearResponse = function() { delete self.response; self.response = {}; }

    self.suggestions = function(query) {
      // Provide list of similar Pokemon queries to aid with mispellings
    };

    self.queue = function(query, page, limit) {
      // Where the "magic" happens, Performs HTTP search
      // Appends to search.response per chunk
      //   @query: optional, search query to perform. Uses search.query if blank
      var new_page = page || 0;
      self.last_query = self.query; // Store previous query

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
            self.response = { page: new_page, data: res.data };
            console.log("Search response", self.response);
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
    // Navigation service
    // Contains navigation listing
    // Listing data must be { "{{Page #}}": chunk }
    var self = this;
    var listing_limit =  3; // How many pages away from median to load
    self.limit        = 24; // Query limit
    self.listing      = []; // Contains listing data
    self.page_sizes   = []; // Variable page sizes, used for indexing
    self.index        =  0; // Index of image to be displayed
    self.current_page =  0; // Current page median
    self.current_low  =  0; // Current page minimum
    self.current_high =  3; // Current page maximum

    self.append = function(obj) {
      // Append to self.listing and broadcast event
      // Obj should be in the search response format { page: n, data: chunk }
      if(obj) { self.listing.push(obj); }

      // If page number doesn't exist in self.page_sizes...
      if(self.page_sizes[obj.page] === undefined) {
        if(obj.page !==0) {
          // Add obj.data.length to previous element
          self.page_sizes.push(obj.data.length + self.pages_sizes[obj.page - 1]);
        } else {
          self.page_sizes.push(obj.data.length);
        }
      }
      console.log("Navigation", self.listing);

      self.broadcast("onnavigateappend");
    };

    self.next = function() {
      if((self.index + 1) < self.listing.length) {
        self.index += 1; self.broadcast("onnavigate"); return true;
      } else { return false; }
    };

    self.prev = function() {
      if((self.index - 1) >= 0) {
        self.index -= 1; self.broadcast("onnavigate"); return true;
      } else { return false; }
    };

    self.to = function(n) {
      if(n >= 0 && n < self.page_sizes[self.page_sizes.length - 1])  {
        self.index = n; self.broadcast("onnavigate"); return true;
      } else { return false; }
    };

    self.nextPage = function() {
      if((self.current_page + 1 - self.current_low) > listing_limit) {
        // Lop off beginning of listing
        self.listing.slice(self.current_low, self.current_low + 1);
      }
      self._calcPage(++self.current_page);
      self.broadcast("onnavigatenext");
    };

    self.prevPage = function() {
      if(self.current_high - (self.current_page - 1) > listing_limit) {
        // Lop off end of listing
        self.listing.slice(self.current_high);
      }
      self._calcPage(--self.current_page);
      self.broadcast("onnavigateprev");
    };

    self.findByIndex = function(index) {
      // Return item in listing based on index
      if(index > self.page_sizes[0]) {

        // Start with second listing index
        for(var i = 1; i < self.page_sizes.length; i++) {
          if(self.page_sizes[i] > index) {
            var sub_index = index - page_sizes[i - 1];
            return self.listing[i].data[sub_index];
          }
        }

      } else {
        return self.listing[0].data[index];
      }
    };

    self._calcPage = function(page) {
      // Calculates current_low and current_high
      self.current_low  = page - 3;
      if(self.current_low <= 0) self.current_low = 0;
      self.current_high = page + 3;
    };

    self.broadcast = function(ev) { $rootScope.$broadcast(ev); }

  }]);
}(ng_pokemon));
