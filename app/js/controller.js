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
      $scope.$apply();
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
      //$scope.$apply();
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
          $scope.$apply();
        } else {
          ng_app.searchbar_search.focus();
        }
      }
    });

    $scope.$on("onkeyup", function() {
      ng_app.searchbar_search.focus();

      if(!State.substates["SEARCH"]) {
        $scope.$apply();
        State.changeSubstate("SEARCH", true);
        ng_app.searchbar_search.focus();
      }
    });

    $scope.$on("onkeybackspace", function() {
      if(self.query === "") State.changeSubstates("SEARCH", false);
      $scope.$apply();
    });

    $scope.$on("onkeyenter", function() {
      if(State.substates["SEARCH"] && State.state !== "LOAD") {
        State.changeSubstate("FIRST", false);
        State.changeSubstate("LAST", false);
        State.changeSubstate("LOAD", true);
        $location.search("q", self.query);
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

    $scope.$on("onnosources", function() { State.changeSubstate("LAST", true); });

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

        if(!self.substates["LAST"]) { $location.search("page", Navigate.current_page); }
        Navigate.to(Navigate.index);
        if(Navigate.page_sizes[0] !== 0 && !self.substates["LAST"]) {
          State.changeSubstate("FIRST", true);
        }

        // Change state to ACTIVE and LIST
        State.changeState("ACTIVE");
        State.changeSubstate("LIST", true);

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

      if(!$scope.$$phase) {
        $scope.$apply(); // TODO: anti-pattern, hack
      }
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

    self.image_center = {};
    self.reset = function() {
      self.touch_vel    = 0;
      self.center_x     = 0;
      self.center_y     = 0;
      self.touch_x      = 0;
      self.touch_y      = 0;
      self.trim_x       = 0;
      self.trim_y       = 0;
      self.new_x        = 0;
      self.new_y        = 0;
      self.touch_scale  = 1;
      self.new_scale    = 1;
      self.touch_size   = 1;
      self.new_size     = 1;
    };
    self.reset();

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });


    self.onPinch = function(ev) {
      switch(ev.type) {
        case "pinchstart":
          self.center_x = ev.center.x;
          self.center_y = ev.center.y;
          break;

        case "pinchin":
        case "pinchout":
          if(ev.scale !== 1) {
            ng_app.image_containers.addClass("inanimate");
            self.new_scale = self.touch_scale * ev.scale;
            if(self.new_scale < 1) self.new_scale = 1;
            self.trim_x = (ev.target.offsetWidth  * self.new_scale - ev.target.offsetWidth ) / 2;
            self.trim_y = (ev.target.offsetHeight * self.new_scale - ev.target.offsetHeight) / 2;

            //self.image_center.css({
              //"transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                           //"scale(" + self.new_scale + ", " + self.new_scale + ")",
              //"-webkit-transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                           //"scale(" + self.new_scale + ", " + self.new_scale + ")",
              //"-moz-transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                           //"scale(" + self.new_scale + ", " + self.new_scale + ")",
              //"transform-origin": self.center_x + "px " + self.center_y + "px",
              //"-webkit-transform-origin": self.center_x + "px " + self.center_y + "px",
              //"-moz-transform-origin": self.center_x + "px " + self.center_y + "px"
            //});
          }
          break;

        case "pinchend":
          ng_app.image_containers.removeClass("inanimate");
          self.touch_scale = self.new_scale;
          break;
      }
    };

    self.onPan = function(ev) {
      if(ev.type === "panstart") {
        self.trim_x = (ev.target.offsetWidth  * self.new_scale - ev.target.offsetWidth ) / 2;
        self.trim_y = (ev.target.offsetHeight * self.new_scale - ev.target.offsetHeight) / 2;
      }

      if(ev.type === "panmove") {
        ng_app.image_containers.addClass("inanimate");
        self.new_x = self.touch_x + ev.deltaX;
        //self.new_y = self.touch_y + ev.deltaY;

        if(self.new_y >=  self.trim_y) { self.new_y =  self.trim_y; }
        //if(self.new_y <= -self.trim_y) { self.new_y = -self.trim_y; }
        if(self.new_x >= self.trim_x || self.new_x <= -self.trim_x) {
          ng_app.image_containers.css({ "left": self.new_x + "px" });
        } else {
          self.image_center.css({
            "transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
            "-webkit-transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
            "-moz-transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                         "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
            "transform-origin": "50% 50%",
            "-webkit-transform-origin": "50% 50%",
            "-moz-transform-origin": "50% 50%"
          });
        }
      }

      if(ev.type === "panend") {
        ng_app.image_containers.removeClass("inanimate");

        if(self.new_x <= -ev.target.offsetWidth/2) Navigate.next();
        else if(self.new_x >= ev.target.offsetWidth/2) Navigate.prev();
        self.touch_x = (self.new_x <= self.trim_x) ?
                         (self.new_x >= -self.trim_x) ?
                           self.new_x : -self.trim_x : self.trim_x;
        //self.touch_y = (self.new_y <= self.trim_y) ?
                         //(self.new_y >= -self.trim_y) ?
                           //self.new_y : -self.trim_y : self.trim_y;

        ng_app.image_containers.css({ "left": "0" });
        self.image_center.css({
          "transform": "translate(" + self.touch_x + "px, " + self.touch_y + "px) " +
                       "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
          "-webkit-transform": "translate(" + self.touch_x + "px, " + self.touch_y + "px) " +
                       "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
          "-moz-transform": "translate(" + self.touch_x + "px, " + self.touch_y + "px) " +
                       "scale(" + self.touch_scale + ", " + self.touch_scale + ")",
          "transform-origin": self.center_x + "% " + self.center_y + "%",
          "-webkit-transform-origin": self.center_x + "% " + self.center_y + "%",
          "-moz-transform-origin": self.center_x + "% " + self.center_y + "%"
        });
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
      if(ev.originalEvent.deltaY > 0) {
        // Positive - down direction
        self.new_scale -= 0.1;
      } else if(ev.originalEvent.deltaY < 0) {
        // Negative - up direction
        self.new_scale += 0.1;
      }

      if(self.new_scale < 1) self.new_scale = 1;
      self.touch_scale = self.new_scale;
      self.trim_x = (ev.target.offsetWidth  * self.touch_scale - ev.target.offsetWidth ) / 2;
      self.trim_y = (ev.target.offsetHeight * self.touch_scale - ev.target.offsetHeight) / 2;
      self.center_x = ev.offsetX / ev.target.offsetWidth  * 100;
      self.center_y = ev.offsetY / ev.target.offsetHeight * 100;

      //self.image_center.css({
        //"transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                     //"scale(" + self.touch_scale + ", " + self.touch_scale + ")",
        //"-webkit-transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                     //"scale(" + self.touch_scale + ", " + self.touch_scale + ")",
        //"-moz-transform": "translate(" + self.new_x + "px, " + self.new_y + "px) " +
                     //"scale(" + self.touch_scale + ", " + self.touch_scale + ")",
        //"transform-origin": self.center_x + "% " + self.center_y + "%",
        //"-webkit-transform-origin": self.center_x + "% " + self.center_y + "%",
        //"-moz-transform-origin": self.center_x + "% " + self.center_y + "%"
      //});
    };

    self.wrap = function(dir, class_lt2, class_lft, class_ctr, class_rgt, class_rt2) {
      var left2  = $("." + class_lt2);
      var left   = $("." + class_lft);
      var center = $("." + class_ctr);
      var right  = $("." + class_rgt);
      var right2 = $("." + class_rt2);

      // Reset values
      self.reset();

      self.image_center[0].style.removeProperty("transform");
      self.image_center[0].style.removeProperty("-webkit-transform");
      self.image_center[0].style.removeProperty("-moz-transform");

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

      self.image_center = $(".image_ctr");
    };

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
        $(".image_rt2").css("background-image", "url('"
            + self.buffer.get(4)[content] + "')");
        $(".image_rt2 > img").attr("src", self.buffer.get(4)[content]);

      } else if(Navigate.direction === "RIGHT") {
        self.wrap("RIGHT", "image_lt2", "image_lft", "image_ctr", "image_rgt", "image_rt2");
        self.buffer.unshift(Navigate.findByIndex(Navigate.index - 2));
        self.buffer.pop();
        $(".image_lt2").css("background-image", "url('"
            + self.buffer.get(0)[content] + "')");
        $(".image_lt2 > img").attr("src", self.buffer.get(0)[content]);
      } else {
        // Get left, center, and right content...
        self.buffer.clear();
        self.buffer.push(Navigate.findByIndex(Navigate.index - 2),
                          Navigate.findByIndex(Navigate.index - 1),
                          Navigate.findByIndex(Navigate.index),
                          Navigate.findByIndex(Navigate.index + 1),
                          Navigate.findByIndex(Navigate.index + 2));

        $(".image_lt2").css("background-image", "url('"
            + self.buffer.get(0)[content] + "')");
        $(".image_lt2 > img").attr("src", self.buffer.get(0)[content]);
        $(".image_lft").css("background-image", "url('"
            + self.buffer.get(1)[content] + "')");
        $(".image_lft > img").attr("src", self.buffer.get(1)[content]);
        $(".image_ctr").css("background-image", "url('"
            + self.buffer.get(2)[content] + "')");
        $(".image_ctr > img").attr("src", self.buffer.get(2)[content]);
        $(".image_rgt").css("background-image", "url('"
            + self.buffer.get(3)[content] + "')");
        $(".image_rgt > img").attr("src", self.buffer.get(3)[content]);
        $(".image_rt2").css("background-image", "url('"
            + self.buffer.get(4)[content] + "')");
        $(".image_rt2 > img").attr("src", self.buffer.get(4)[content]);
      }

      self.image_center = $(".image_ctr");
    });
  }]);

}(ng_hound));
