function shuffle(o){
  // Shuffle array o
  for(var j, x, i = o.length;
      i;
      j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

(function(ng_app, viewport) {
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


  ng_app.service("Bootstrap", ["$rootScope", function ($rootScope) {
    var self = this;
    self.state      = "";
    self.last_state = "";
    self.viewport   = viewport;
    self.interval   = 1000;
    self.can_change = true;

    $(document).ready(function() {
      self.state      = viewport.current();
      self.last_state = self.state;

      $(window).resize(function() {
        if(self.can_change) {
          self.can_change = false;
          self.state = viewport.current();

          if(self.state !== self.last_state) {
            self.last_state = self.state;
            $rootScope.$broadcast("onviewportchange");
          }

          setTimeout(function() {
            self.can_change = true;
          }, self.interval);
        }
      });
    });

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
    self.query        = "";
    self.response     = [];
    self.sources      = {};
    self.limit        = 24;

    self.clear         = function() { self.query = ""; }
    self.clearResponse = function() {
      if(self.response.length > 1)  { self.response = self.response.slice(1); }
      else                          { self.response.length = 0;               }
    };
    self.resetSources  = function(sources) {
      // Resets source statuses back to original search
      //   @sources: object containing { "source name": true/false if disabled }
      self.sources = $.extend({}, sources); // Clone object
    }

    self.get = function(query, page, limit) {
      // Where the "magic" happens
      // Requests "get" data; a page is cumulative of all defined sources
      //   @query: optional, self.last_query if blank
      //   @page: page number to check for in each source
      //   @limit: How many records to return for each source

      var new_page    = page || 0;
      self.limit      = limit || self.limit;
      self.last_query = query || self.last_query || self.query;

      $http({
        method: "POST",
        url: "/get/request",
        data:   {
          "tags":    self.last_query,
          "page":    new_page,
          "limit":   self.limit,
          "sources": self.stop_sources
        }
      }).then(
          function success(res) {
            console.log("Server query:", "\"" + self.last_query + "\"",
                        "Page", new_page,
                        "Response", res);

            // Normalize response to new_data
            // { page: #, data: array }
            var new_data = [];
            for(var i = 0; i < res.data.length; i++) {
              // Turn off sources if res.data[i].stop returns true
              if(res.data[i].stop === true) {
                self.sources[res.data[i].name] = false;
              }

              // Sort results before concatenating to new_data.data
              res.data[i].results.sort(function(a, b) {
                // Sort in descending order by date
                return b.date - a.date;
              });
              new_data.push.apply(new_data, res.data[i].results);
            }

            self.response.push({ page: new_page, data: new_data });
          },

          function error(res) {
            self.response.push({ page: null, data: []});
            console.error("Search responses", self.response);
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

    self.initialize = function(limit) {
      // reinitialize values based on page limit
      self.current_limit  =  limit || 3; // How far ahead or behind to buffer
      self.current_index  =  0; // Index of image to be displayed
      self.current_page   =  0;
      self.display_low    =  0 - self.current_limit; // How far ahead to buffer
      self.display_high   =  0 + self.current_limit; // How far behind to buffer

      self.can_page       = false; // If next/prev page can execute
      self.last_page      = false; // Disables next page
      self.listing_buffer = []; // Contains entire listing data
      self.page_sizes     = []; // Used for searching indices
    }
    self.initialize(3); // Default limit of 3



    self.append = function(response) {
      // Append a search resposne to self.listing_buffer
      // Response should be in the format { page: n, data: chunk }

      if(response === null || response === undefined) {
        console.error("response is null or undefined");
      }
      // TODO: check if response follows format

      // Already exists in listing_buffer
      // TODO: check actual page number
      if(self.listing_buffer[response.page] !== undefined) { return false; }

      // Determine start index
      var start_index = 0;
      if(self.listing_buffer.length > 0) {
        // Get index of last item...
        var last_buffer = self.listing_buffer[self.listing_buffer.length - 1].data;
        start_index = last_buffer[last_buffer.length - 1].index + 1;
      } // else index starts zero

      // Process response data
      for(var i = 0; i < response.data.length; i++) {
        // set zoom flag based on aspect ratio
        // also prevent divide by zero for height...
        var aspect = response.data[i].width / (response.data[i].height || 1);

        // if aspect ratio is ~ 1:2 or thinner...
        if(aspect < 0.5) response.data[i].zoom = true;
        else               response.data[i].zoom = false;

        // Index item
        response.data[i].index = start_index + i;
      }

      // Add response to listing_buffer
      self.listing_buffer.push(response);
      // Add size of response to page_sizes + previous size, or 0 if it doesn't exist
      self.page_sizes.push(response.data.length +
        (self.page_sizes[self.page_sizes.length - 1] || 0));

      if(self.listing_buffer.length === 1) { self.broadcast("onnavigatepop"); }
      //console.log("Navigation Page Sizes", self.page_sizes);
      //console.log("Navigation Buffer",     self.listing_buffer);

      self.broadcast("onnavigateappend");
    };

    self.checkDisplay = function(n) {
      // Check if page is within display range of current page...
      if(n < self.display_high && n > self.display_low) {
        return true;
      } else { return false; }
    };

    self.next = function() {
      if((self.index + 1) < self.listing_buffer.length) {
        self.index += 1; self.broadcast("onnavigate"); return true;
      } else { return false; }
    };

    self.to = function(n) {
      if(n >= 0 && n < self.page_sizes[self.page_sizes.length - 1])  {
        self.index = n; self.broadcast("onnavigate"); return true;
      } else { return false; }
    };

    self.nextPage = function() {
      if(!self.last_page && self.can_page) {
        self.can_page = false;
        self._calcPage(++self.current_page);
        self.broadcast("onnavigatepage");
      }
    };

    self.getDisplay = function(buffer) {
      // Return list of display to show
      // TODO: replace with more efficient method (slicing end/beginning)
      var retval = [];
      var low  = self.display_low;
      var high = self.display_high;

      if(self.display_low < 0) low = 0;
      // There is no high ceiling for array.slice
      retval = buffer.slice(low, high);

      return retval;
    }

    self.getPageByIndex = function(n) {
      // Return page number of item
      // warning: can return 0 or null. be explicit when checking
      //   @n: index of item
      if(index < self.page_sizes[0]) { return 0; } // first page
      else {
        for(var i = 1; i < self.page_sizes.length; i++) {
          if(self.page_sizes[i] > index) { return i; }
        }

        return null; // Index not within page ranges
      }
    };

    self.findByIndex = function(index) {
      // Return item in listing_buffer based on index
      if(index > self.page_sizes[0]) {

        for(var i = 1; i < self.page_sizes.length; i++) {
          if(self.page_sizes[i] > index) {
            var sub_index = index - self.page_sizes[i - 1];
            return self.listing_buffer[i].data[sub_index];
          }
        }

      } else {
        return self.listing_buffer[0].data[index];
      }
    };

    self._calcPage = function(page) {
      // Calculates current_low and display_high
      self.display_low  = page - self.current_limit;
      if(self.display_low <= 0) self.display_low = 0;
      self.display_high = page + self.current_limit;
    };

    self.broadcast = function(ev) { $rootScope.$broadcast(ev); }

  }]);
}(ng_hound, ResponsiveBootstrapToolkit));
