(function(ng_app) {
  ng_app.controller("ViewCtrl", ["$scope", "State",
    function($scope, State) {
    // Handles the title container
    var self       = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });
  }]);

  ng_app.controller("LoadingCtrl", ["$scope", "State",
    function($scope, State) {
    var self = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state = State.state;     });
    $scope.$on("onsubstatechange", function() {
      self.substates = State.substates;
      if(!$scope.$$phase) { $scope.$apply(); /* TODO: anti-pattern, hack */ }
    });
  }]);

  ng_app.controller("TitleCtrl", ["$scope", "State",
    function($scope, State) {
    // Handles the title container
    var self       = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });
  }]);

  ng_app.controller("SearchbarCtrl",
    ["$scope", "State", "Keyboard", "Search", "Navigate", "$location",
    function($scope, State, Keyboard, Search, Navigate, $location) {
    // Handles the searching overlay
    // Searching overlay appears when beginning to type
    var self = this;
    self.query     = "";
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state = State.state; });
    $scope.$on("onsubstatechange", function() {
      self.substates = State.substates;
      if(!$scope.$$phase) { $scope.$apply(); /* TODO: anti-pattern, hack */ }
    });

    // Initialize search query on page load, if exists
    $(document).ready(function() {
      var query = $location.search();
      if(query.q) {
        if(query.page) Navigate.current_page = query.page;

        Search.resetSources();
        State.changeSubstate("LOAD", true);
        Search.get(query.q, query.page || undefined, query.limit || undefined)
      }
    });

    $scope.$on("onkeyarrow", function() {
      if(State.substates["SEARCH"]) {
        if(Keyboard.ord === "UP") {
          self.query = Search.last_query;
          if(!$scope.$$phase) { $scope.$apply(); /* TODO: anti-pattern, hack */ }
        } else {
          ng_app.searchbar_search.focus();
        }
      }
    });

    $scope.$on("onkeyup", function() {
      ng_app.searchbar_search.focus();

      if(!State.substates["SEARCH"]) {
        if(!$scope.$$phase) { $scope.$apply(); /* TODO: anti-pattern, hack */ }
        State.changeSubstate("SEARCH", true);
        ng_app.searchbar_search.focus();
      }
    });

    $scope.$on("onkeybackspace", function() {
      if(self.query === "") State.changeSubstates("SEARCH", false);
      if(!$scope.$$phase) { $scope.$apply(); /* TODO: anti-pattern, hack */ }
    });

    $scope.$on("onkeyenter", function() {
      if(State.substates["SEARCH"] && State.state !== "LOAD") {
        State.changeSubstate("FIRST", false);
        State.changeSubstate("LAST", false);
        State.changeSubstate("LOAD", true);
        $location.search({ "q": self.query, "limit": Search.limit });
        ng_app.searchbar_search.blur();

        // this is a new search, so...
        // clear the old listing_buffer
        Navigate.initialize();

        // Reset sources
        Search.resetSources();

        // Initiate search
        Search.get(self.query);
      } else {
        State.changeSubstate("SEARCH", true);
        ng_app.searchbar_search.focus();
      }
    });

    $scope.$on("onkeyesc", function() {
      if(State.substates["SEARCH"]) {
        // clear search
        Search.clear();
        self.query = "";

        // switch to NONE substate
        State.changeSubstate("SEARCH", false);
      }
    });

    /* TODO: fix response timings
    $scope.$on("onsearchend", function() {
      if(Navigate.listing_buffer.length === 0) {
        State.changeSubstate("LOAD", false);
        State.changeSubstate("SEARCH", true);
        self.query = "No search results...";
      } else {
        State.changeSubstate("LOAD", false);
        State.changeSubstate("SEARCH", false);
        Search.query = "";
        self.query = "";
      }
    });
    */

    $scope.$on("onnosources", function() {
      if(Navigate.listing_buffer.length === 0) {
        State.changeSubstate("LOAD", false);
        State.changeSubstate("SEARCH", true);
        self.query = "No search results...";
      } else {
        State.changeSubstate("LOAD", false);
        State.changeSubstate("SEARCH", false);
        self.query = "";
      }
    });
  }]);

  ng_app.controller("ListingCtrl",
    ["$scope", "State", "Search", "Navigate", "$location",
    function($scope, State, Search, Navigate, $location) {
    // Handles the searchlist overlay, which contains a grid list of searches found
    var self = this;
    self.listing   = [];
    self.index     =  0;
    self.state     = State.state;
    self.substates = State.substates;
    self.last_page = false;

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });


    $scope.$on("onkeyesc", function() {
      if(State.substates["LIST"] && State.substates["FULL"]) {
        State.changeSubstate("LIST", false);
      }
    });

    $scope.$on("onnosources", function() {
      State.changeSubstate("LAST", true);
      Navigate.last_page = true;
    });

    $scope.$on("onnavigate", function() {
      self.current = Navigate.index;
      if(State.substates["FULL"]) { State.changeSubstate("LIST", false); }
    });

    $scope.$on("onnavigatepage", function() {
      if(State.state !== "LOAD") {
        self.can_page = false;
        State.changeSubstate("LOAD", true);
        Search.get(Search.last_query, Navigate.current_page);
      }
    });

    $scope.$on("onsearchreturned", function() {
      if(Search.response[0].data.length === 0) {
        // Turn off this source
        Search.disableSource(Search.response[0].source);
      } else {
        Navigate.append(Search.response[0]);
        self.listing = Navigate.getDisplay(Navigate.listing_buffer);
      }

      Search.clearResponse();
    });

    $scope.$on("onsearchend", function() {
      Navigate.reindex(); // Re-index all pages

      if(Navigate.listing_buffer.length === 0) {
        // Change state to ACTIVE and LIST
        State.changeState("DEFAULT");
        State.changeState("SEARCH", true); // TODO: change response timing
        State.changeSubstate("LIST", false);
        Navigate.listing_buffer.length = 0;
        self.listing.length            = 0;
      } else {
        State.changeSubstate("LOAD", false); // TODO: move to a LoadCtrl
        State.changeSubstate("SEARCH", false); // TODO: move to a LoadCtrl

        // Allow paging again
        Navigate.can_page = true;
        self.can_page     = true;

        // If this is the first page...
        if(Navigate.page_sizes[0] !== 0 && !self.substates["LAST"]) {
          State.changeSubstate("FIRST", true);
        }

        // Update page URL only if page was not the last one...
        // Otherwise, update page first/last flags
        if(!self.substates["LAST"])  { $location.search("page", Navigate.current_page); }
        else                         { Navigate.last_page = true;                       }
        if( self.substates["FIRST"]) { Navigate.first_page = true;                      }

        // Change state to ACTIVE and LIST, and navigate to current item
        State.changeState("ACTIVE");
        State.changeSubstate("LIST", true);
        Navigate.to(Navigate.index);

        // Update listing display
        //self.listing = Navigate.getDisplay(Navigate.listing_buffer);
        self.listing = Navigate.listing_buffer;
        //console.log("Listing", self.listing);
      }
    });
  }]);

  ng_app.controller("OverlayCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    var self = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });
    $scope.$on("onsearchreturned", function() { State.changeSubstate("OVERLAY", true); });
  }]);

  ng_app.controller("InfoCtrl",
    ["$scope", "Navigate", "State",
    function($scope, Navigate, State) {
    // Handles display info for current image
    // How many images got returned
    var self       = this;
    self.current   =   {};
    self.date      =    0;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

    $scope.$on("onnavigate", function() {
      // Update image info box
      self.current = Navigate.findByIndex(Navigate.index);

      if(self.current) {
        // Convert date to readable Date
        var date = new Date(self.current.date * 1000);
        self.date = date.toDateString();
      }

      if(!$scope.$$phase) { $scope.$apply(); /* TODO: anti-pattern, hack */ }
    });
  }]);

  ng_app.controller("OptionsCtrl",
    ["$scope", "Search",
    function($scope, Search) {
    // Toggles for search options
    var self = this;
    self.Search  = Search;

    self.limit_options = {
      ceil: 100,
      hideLimitLabels: true
    };

    $scope.$broadcast("rzSliderForceRender");
  }]);


  ng_app.controller("ImageCtrl",
    ["$scope", "State", "Navigate", "Keyboard",
    function($scope, State, Navigate, Keyboard) {
    // Handles current image being shown
    var self = this;
    self.buffer    = new Deque(5);
    self.state     = State.state;
    self.substates = State.substates;

    self.image_center = {
      css: function()    {},
      width: function()  { return 0; },
      height: function() { return 0; }
    };
    self.reset = function() {
      self.base_width   =  self.image_center.width();
      self.base_height  = self.image_center.height();
      self.trim_x       = 0;
      self.trim_y       = 0;
      self.touch_x      = 0;
      self.touch_y      = 0;
      self.new_x        = 0;
      self.new_y        = 0;
      self.touch_scale  = 1;
      self.max_scale    = 3;
      self.touch_x_over = 0;
      self.new_scale    = 1;
      self.new_size     = 1;

      self.image_center.css({
        "transform": "translate3d(0, 0, 0) scale(1, 1)",
"-webkit-transform": "translate3d(0, 0, 0) scale(1, 1)",
   "-moz-transform": "translate3d(0, 0, 0) scale(1, 1)"
      });
    };
    self.reset();

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });


    self.onTap = function(ev) {
      switch(ev.tapCount) {
        case 1:
          // Toggle overlay
          State.toggleSubstate("OVERLAY");
          break;
        case 2:
          window.scrollTo(0, 1); // Hide address bar on mobile....

          // Toggle zoom
          if(self.touch_scale > 1) {
            self.touch_x = 0;
            self.touch_y = 0;
            self.touch_scale = 1;
          } else if(self.touch_scale <= 1) {
            self.touch_scale = self.max_scale;
          }

          self.image_center.css({
            "transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
    "-webkit-transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
       "-moz-transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")"
          });
          break;
      }
    }

    self.onPress = function(ev) {
    }

    self.onPinch = function(ev) {
      switch(ev.type) {
        case "pinchstart":
          self.last_pinch = "pinchstart"; // Hammer.js is firing extraneous pinch event
          ng_app.image_images.addClass("inanimate");
          break;

        case "pinchin":
        case "pinchout":
          // Prevent jump: there is one last pinch event after pinchend for some reason
          if(self.last_pinch !== "pinchend") {
            self.new_scale = self.touch_scale * ev.scale;

            if(self.new_scale < 1) { self.new_scale = 1; self.touch_x = 0; self.touch_y = 0; }

            self.image_center.css({
              "transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                           "scale(" + self.new_scale + ", " + self.new_scale + ")",
      "-webkit-transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                           "scale(" + self.new_scale + ", " + self.new_scale + ")",
         "-moz-transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                           "scale(" + self.new_scale + ", " + self.new_scale + ")"
            });
          }
          break;

        case "pinchend":
          self.last_pinch = "pinchend";

          ng_app.image_images.removeClass("inanimate");
          self.touch_scale = self.new_scale;
          break;
      }
    };

    self.onPan = function(ev) {
      switch(ev.type) {
        case "panstart":
          ng_app.image_containers.addClass("inanimate");
          ng_app.image_images.addClass("inanimate");
          self.image_width  =  self.image_center.width();
          self.image_height = self.image_center.height();
          self.base_width   =  ng_app.base_image.width();
          self.base_height  = ng_app.base_image.height();
          self.trim_x       = ((self.image_width  * self.touch_scale) -  self.base_width) / 2;
          self.trim_y       = ((self.image_height * self.touch_scale) - self.base_height) / 2;
          break;

        case "panmove":
          if(self.image_height * self.touch_scale >= self.base_height) {
            self.new_y = self.touch_y + ev.deltaY;

            // Keep self.new_y within trim_y limits
            self.new_y = self.new_y <=  self.trim_y ?
                           self.new_y >= -self.trim_y ?
                             self.new_y : -self.trim_y  : self.trim_y;
          } else {
            self.new_y = 0;
          }

          self.new_x = self.touch_x + ev.deltaX;

          // If image is scaled
          if(self.image_width * self.touch_scale >= self.base_width) {
            // Transfer excess into touch_x_over, and limit new_x within trim_x limits
            if(self.new_x <= -self.trim_x)      { self.touch_x_over = self.new_x + self.trim_x; }
            else if(self.new_x >=  self.trim_x) { self.touch_x_over = self.new_x - self.trim_x; }
            else                                { self.touch_x_over = 0; }

            // Keep self.new_x within trim_x limits
            self.new_x = self.new_x <=  self.trim_x ?
                           self.new_x >= -self.trim_x ?
                             self.new_x : -self.trim_x  : self.trim_x;
          } else {
            // Only translate parent
            self.touch_x_over = self.new_x;
            self.new_x = 0;
          }

          ng_app.image_containers.css({"left": self.touch_x_over + "px"});
          self.image_center.css({
            "transform": "translate3d(" + self.new_x + "px, " + self.new_y + "px, 0px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
    "-webkit-transform": "translate3d(" + self.new_x + "px, " + self.new_y + "px, 0px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
       "-moz-transform": "translate3d(" + self.new_x + "px, " + self.new_y + "px, 0px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")"
          });
          break;

        case "panend":
          ng_app.image_containers.removeClass("inanimate");
          ng_app.image_images.removeClass("inanimate");
          self.touch_x = self.new_x;
          self.touch_y = self.new_y;

          // Only switch to next if panned more than 3/4 of the way through
          if(self.touch_x_over <= -ev.target.offsetWidth / 2)
            Navigate.next();
          if(self.touch_x_over >=  ev.target.offsetWidth / 2)
            Navigate.prev();
          self.touch_x_over = 0;
          ng_app.image_containers.css({"left": "0px"});
          break;
      }
    };

    self.onSwipe = function(ev) {
      switch(ev.type) {
        case "swipeleft":
          Navigate.next();
          break;
        case "swiperight":
          Navigate.prev();
          break;
      }
    };

    self.onScroll = function(ev) {
      self.new_scale = self.touch_scale;
      if(ev.originalEvent.deltaY > 0)      { self.new_scale -= 0.1; }
      else if(ev.originalEvent.deltaY < 0) { self.new_scale += 0.1; }

      if(self.new_scale < 1) { self.new_scale = 1; self.touch_x = 0; self.touch_y = 0; }
      self.touch_scale = self.new_scale;

      self.image_center.css({
         "transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                      "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
 "-webkit-transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                      "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
    "-moz-transform": "translate3d(" + self.touch_x + "px, " + self.touch_y + "px, 0px) " +
                      "scale(" + self.touch_scale + ", " + self.touch_scale + ")"
      });
    };

    self.wrap = function(dir, class_lt2, class_lft, class_ctr, class_rgt, class_rt2) {
      var left2  = $("." + class_lt2);
      var left   = $("." + class_lft);
      var center = $("." + class_ctr);
      var right  = $("." + class_rgt);
      var right2 = $("." + class_rt2);

      // Reset values
      self.reset();

      switch(dir) {
        case "LEFT":
           left2.removeClass(class_lt2);
            left.removeClass(class_lft + " inanimate");
          center.removeClass(class_ctr);
           right.removeClass(class_rgt + " inanimate");
          right2.removeClass(class_rt2);
           left2.addClass(class_rt2 + " inanimate");
            left.addClass(class_lt2);
          center.addClass(class_lft);
           right.addClass(class_ctr);
          right2.addClass(class_rgt + " inanimate");
          break;

        case "RIGHT":
           left2.removeClass(class_lt2);
            left.removeClass(class_lft + " inanimate");
          center.removeClass(class_ctr);
           right.removeClass(class_rgt + " inanimate");
          right2.removeClass(class_rt2);
           left2.addClass(class_lft + " inanimate");
            left.addClass(class_ctr);
          center.addClass(class_rgt);
           right.addClass(class_rt2);
          right2.addClass(class_lt2 + " inanimate");
          break;
      }

      self.image_center = $(".image_ctr > div > div > img");
    };

    self.initSlide = function(jq, buffer) { jq.attr("src", buffer); };

    $scope.$on("onkeyarrow", function() {
      if(!State.substates["SEARCH"]) {
        switch(Keyboard.ord) {
          case "LEFT":  Navigate.prev(); break;
          case "RIGHT": Navigate.next(); break;
        }
      }
    });

    $scope.$on("onnavigate", function() {
      // Return ["content"] or ["preview"] depending on viewport
      var content = self.substates["FULL"] ? "preview" : "content";

      // Get left, center, and right content...
      if(Navigate.direction === "LEFT") {
        self.wrap("LEFT",  "image_lt2", "image_lft", "image_ctr", "image_rgt", "image_rt2");
        self.buffer.push(Navigate.findByIndex(Navigate.index + 2));
        self.buffer.shift();
        self.initSlide($(".image_rt2 > div > div > img"), self.buffer.get(4)[content]);

      } else if(Navigate.direction === "RIGHT") {
        self.wrap("RIGHT", "image_lt2", "image_lft", "image_ctr", "image_rgt", "image_rt2");
        self.buffer.unshift(Navigate.findByIndex(Navigate.index - 2));
        self.buffer.pop();
        self.initSlide($(".image_lt2 > div > div > img"), self.buffer.get(0)[content]);
      } else {
        // Get left, center, and right content...
        self.buffer.clear();
        self.buffer.push(Navigate.findByIndex(Navigate.index - 2),
                          Navigate.findByIndex(Navigate.index - 1),
                          Navigate.findByIndex(Navigate.index),
                          Navigate.findByIndex(Navigate.index + 1),
                          Navigate.findByIndex(Navigate.index + 2));

        self.initSlide($(".image_lt2 > div > div > img"), self.buffer.get(0)[content]);
        self.initSlide($(".image_lft > div > div > img"), self.buffer.get(1)[content]);
        self.initSlide($(".image_ctr > div > div > img"), self.buffer.get(2)[content]);
        self.initSlide($(".image_rgt > div > div > img"), self.buffer.get(3)[content]);
        self.initSlide($(".image_rt2 > div > div > img"), self.buffer.get(4)[content]);
        self.reset();
      }

      self.image_center = $(".image_ctr > div > div > img");
    });
  }]);

}(ng_hound));
