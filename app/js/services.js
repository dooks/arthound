(function(ng_app, viewport) {
  ng_app.service("State", ["$rootScope", function($rootScope) {
    // TODO: why does initializing this make it persistent....?
    var self = this;
    self.state     = "DEFAULT"; // DEFAULT | ACTIVE
    self.substates = { "FULL":    false,
                       "SEARCH":  false,
                       "LIST":    false,
                       "LOAD":    false,
                       "OVERLAY": false
                     };

    self.changeState = function(state) {
      switch(state) {
        case "DEFAULT":
        case "ACTIVE":
          self.state = state;
          $rootScope.$apply();
          $rootScope.$broadcast("onstatechange");
          break;
      }
    };

    self.changeSubstate = function(substate, value) {
      switch(substate) {
        case "FULL":
        case "SEARCH":
        case "LOAD":
        case "OVERLAY":
        case "LIST":
          self.substates[substate] = (!!value); // Evaluate value as boolean
          $rootScope.$apply();
          $rootScope.$broadcast("onsubstatechange");
          break;
      }
    };

    self.toggleSubstate = function(substate) {
      switch(substate) {
        case "FULL":
        case "SEARCH":
        case "LOAD":
        case "OVERLAY":
        case "LIST":
          self.substates[substate] = (!self.substates[substate]); // Evaluate value as boolean
          $rootScope.$apply();
          $rootScope.$broadcast("onsubstatechange");
          break;
      }
    };

    // Responsive Bootstrap Toolkit
    self.view_state      = "";
    self.view_last_state = "";
    self.viewport   = viewport;
    self.view_interval   = 200;
    self.view_can_change = true;

    // Initialize Bootstrap states
    $(document).ready(function() {
      self.view_state      = viewport.current();
      self.view_last_state = self.view_state;
      $rootScope.$broadcast("onviewportchange");

      // If "xs", switch to FULL substate
      if(self.view_state === "xs") { self.changeSubstate("FULL", true); }
      if(self.view_state === "sm" || self.view_state === "md" || self.view_state === "lg") {
        self.changeSubstate("FULL", false);
      }

      $(window).resize(function() {
        if(self.view_can_change) {
          self.view_can_change = false;
          self.view_state = viewport.current();

          if(self.view_state !== self.view_last_state) {
            self.view_last_state = self.view_state;

            // If "xs", switch to FULL substate
            if(self.view_state === "xs") { self.changeSubstate("FULL", true); }
            if(self.view_state === "sm" || self.view_state === "md" || self.view_state === "lg") {
              self.changeSubstate("FULL", false);
            }
          }

          setTimeout(function() {
            self.view_can_change = true;
          }, self.view_interval);
        }
      });
    });
  }]);


  ng_app.service("Keyboard", ["$rootScope", function($rootScope) {
    var self = this;
    self.key = '';
    self.ord = null;

    self.getKey = function(key_code) {
      // Broadcasts proper event based on key_code
      //  @key_code: event.keyCode
      //  @shift: event.shiftKey
      self.key = key_code;

      if(key_code === 32 || key_code >= 48 && key_code <= 122)
                               { self.ord = String.fromCharCode(key_code); }
      else if(key_code === 37) { self.ord = "LEFT";      }
      else if(key_code === 38) { self.ord = "UP";        }
      else if(key_code === 39) { self.ord = "RIGHT";     }
      else if(key_code === 40) { self.ord = "DOWN";      }
      else if(key_code === 13) { self.ord = "ENTER";     }
      else if(key_code === 27) { self.ord = "ESCAPE";    }
      else                     { self.ord = null;        }
      self.broadcast();
    }

    self.broadcast = function() {
      switch(self.ord) {
        case "LEFT":
        case "UP":
        case "RIGHT":
        case "DOWN":
          $rootScope.$broadcast("onkeyarrow");
          break;
        case "ESCAPE":
          $rootScope.$broadcast("onkeyesc");
          break;
        case "ENTER":
          $rootScope.$broadcast("onkeyenter");
          break;
        case "BACKSPACE":
          $rootScope.$broadcast("onkeybackspace");
          break;
        case null:
          // Do not do anything
          break;
        default:
          $rootScope.$broadcast("onkeyup");
          break;
      }
    };

  }]);

  ng_app.service("Search", ["$rootScope", "$http", function($rootScope, $http) {
    var self = this;
    self.query        = "";
    self.response     = [];
    self.sources      = {};
    self.limit        = 24;

    self.clear         = function() { self.query = ""; };
    self.clearResponse = function() {
      if(self.response.length > 1)  { self.response = self.response.slice(1); }
      else                          { self.response.length = 0;               }

      if(self.response.length === 0) $rootScope.$broadcast("onsearchend");
    };

    self.disableSource  = function(source) {
      // Resets source statuses back to original search
      //   @sources: object containing { "source name": true/false if disabled }
      self.sources[source] = false;

      var ignore = false;
      for(var key in self.sources) {
        if(source === key) self.sources[key] = false;
        else if (self.sources[key]) ignore = true;
      }

      if(ignore) {
        $rootScope.$broadcast("onnosources");
      }
    };

    self.resetSources  = function(sources) {
      // Resets source statuses back to original search
      //   @sources: object containing { "source name": true/false if disabled }
      self.sources = $.extend({}, sources); // Clone object
    };

    self.get = function(query, page, limit) {
      // Where the "magic" happens
      // Requests "get" data; a page is cumulative of all defined sources
      //   @query: optional, self.last_query if blank. This should already be encoded
      //   @page: page number to check for in each source
      //   @limit: How many records to return for each source
      var new_page    = page || 0;
      self.last_query = query || self.last_query;

      function request(url, data_type, source, options, headers) {
        $.ajax({
          method:   "GET",
          dataType: data_type,
          url:      url,
          data:     options,
          headers:  headers || {},
        }).then(
          function success(res) {
            // Normalize returned data, or not
            console.log("Search Response", query, source, res);
            if(res === undefined) res = [];
            if(res.query) {
              var item = res.query.results.rss.channel.item || [];
              if(Array.isArray(item)) res = item;
              else res = [item];
            }
            if(res.data)  { res = res.data || [];                             }
            if(res.length === 0) { return $.Deferred().resolve([]).promise(); }
            console.log("Search Response", query, source, res);

            if(res.length > self.limit) {
              // Split response in half if too big...
              return ($.when(
                $.ajax({ method: "POST", url: "http://dev.stardust.red:7050/get/normalize",
                  data: { source: source, body: res.slice(0, res.length/2) }
                }),
                $.ajax({ method: "POST", url: "http://dev.stardust.red:7050/get/normalize",
                  data: { source: source, body: res.slice(res.length/2) }
                })
              ).then(function success(res1, res2) {
                var res_concat = res1[0].concat(res2[0]);
                return res_concat;
              }));

            } else {
              return $.ajax({
                method: "POST",
                url: "http://dev.stardust.red:7050/get/normalize",
                data: { source: source, body: res }
              });
            }
          }
        ).then(
          function success(res) {
            // Broadcast search returned
            self.response.push({ source: source, page: new_page, data: res});
            $rootScope.$broadcast("onsearchreturned");
          }
        );
      }

      for(var key in self.sources) {
        if(self.sources[key]) {
          switch(key) {
            case "e926":
              var options = {
                "tags":  self.last_query, // TODO: normalize query
                "page":  new_page + 1, // e926 starts paging at 1....
                "limit": self.limit,
              }
              request("https://e926.net/post/index.json", "jsonp", "e926", options);

              break;

            case "deviantart":
              var options = [
                "?q=boost%3apopular%20" + self.last_query,
                "&limit="  + self.limit,
                "&offset=" + new_page * self.limit,
                "&order=9" // browse, sorted by popularity
              ].join("");

              // Use Yahoo API as a proxy to retrieve rss.xml as a JSON
              var url = "http://backend.deviantart.com/rss.xml" + options;
              var yqlURL = [
                "http://query.yahooapis.com/v1/public/yql",
                "?q=" + encodeURIComponent("select * from xml where url='" + url + "'"),
                "&format=json&callback=?"
              ].join("");

              request(yqlURL, "json", "deviantart");

              break;

            case "imgur":
              var options = {
                "sort": "viral",
                "q":    "tag:"+ decodeURIComponent(self.last_query),
                "page": new_page,
              }
              var headers = { "Authorization": "Client-ID 1f63c77eaec2b1c" };
              request("https://api.imgur.com/3/gallery/search/", "json",
                      "imgur", options, headers);

              break;
          }
        }
      }

      return;
    }; // end of search function
  }]);




  ng_app.service("Navigate", ["$rootScope", function($rootScope) {
    // Navigation service
    // Contains navigation listing
    // Listing data must be { "{{Page #}}": chunk }
    var self = this;

    self.initialize = function(limit) {
      // reinitialize values based on page limit
      self.current        = {};
      self.current_limit  = limit || 3; // How far ahead or behind to buffer
      self.current_index  = 0; // Index of image to be displayed
      self.current_page   = 0;
      self.index          = 0;
      self.last_index     = 0; // Last index
      self.display_low    = 0 - self.current_limit; // How far ahead to buffer
      self.display_high   = 0 + self.current_limit; // How far behind to buffer

      self.can_page       = false; // If next/prev page can execute
      self.listing_buffer = []; // Contains entire listing data
      self.page_sizes     = []; // Used for searching indices
    }
    self.initialize();

    self.append = function(response) {
      if(response === null || response === undefined) {
        console.error("Response is null or undefined");
      }

      // Check if page number exists in listing_buffer
      if(self.listing_buffer[response.page]) {
        // Concat array
        self.listing_buffer[response.page].data.concat(response.data);
      } else {
        self.listing_buffer[response.page] = { page: response.page, data: response.data };
      }
    };

    self.reindex = function() {
      var start_index = 0;

      // Reindex buffer from beginning, updating page sizes
      for(var i = 0; i < self.listing_buffer.length; i++) {
        // self.listing_buffer[i] = { page: 0, data: {} }
        if(self.listing_buffer[i]) { // Paging may not start at 1
          var b = self.listing_buffer[i];

          if(i > 0) {
            self.page_sizes[b.page] = b.data.length + self.page_sizes[i-1];
          } else {
            self.page_sizes[b.page] = b.data.length;
          }

          for(var j = 0; j < b.data.length; j++) {
            b.data[j].index = start_index++;
          }
        } else {
          self.page_sizes[i]     = 0;
          self.listing_buffer[i] = { page: i, data: [] };
        }
      }

      self.last_index = start_index;
    }

    self.checkDisplay = function(n) {
      // Check if page is within display range of current page...
      if(n < self.display_high && n > self.display_low) {
        return true;
      } else { return false; }
    };

    self.next = function() {
      if(self.index + 1 < self.last_index) {
        self.index += 1;
        self.current = self.findByIndex(self.index);
        self.broadcast("onnavigate");
        return true;
      } else if((self.index + 1) === self.last_index) {
        self.nextPage();
      }
      else { return false; }
    };

    self.prev = function() {
      if((self.index - 1) >= 0) {
        self.index -= 1;
        self.current = self.findByIndex(self.index);
        self.broadcast("onnavigate");
        return true;
      } else { return false; }
    };

    self.to = function(n) {
      // Note: +n, because n might be a string!
      n = Number(n);
      if(n >= 0 && n < self.page_sizes[self.page_sizes.length - 1])  {
        self.index = n;
        self.current = self.findByIndex(self.index);
        self.broadcast("onnavigate");
        return true;
      } else { return false; }
    };

    self.prevPage = function() {
      if(!self.first_page && self.can_page) {
        self.can_page = false;

        if(self.last_page) self.last_page = false;
        self._calcPage(--self.current_page);
        self.broadcast("onnavigatepage");
      }
    };

    self.nextPage = function() {
      if(!self.last_page && self.can_page) {
        self.can_page = false;

        if(self.first_page) self.first_page = false;
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
      if(index >= self.page_sizes[0]) {

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
