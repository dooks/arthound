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

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });
  }]);

  ng_app.controller("TitleCtrl", ["$scope", "State",
    function($scope, State) {
    // Handles the title container
    var self       = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange", function() { self.state = State.state; });
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

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

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
        State.changeSubstate("SEARCH", true);
        self.query = "No search results...";
      } else {
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
    //self.scrollbar = { "onScroll": function(y, x) { } };

    $scope.$on("onstatechange",    function() { self.state     = State.state;     });
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

        // Allow paging again
        Navigate.can_page = true;
        self.can_page     = true;

        if(!self.substates["LAST"]) { $location.search("page", Navigate.current_page); }
        if(Navigate.index === 0) Navigate.to(0);
        if(Navigate.page_sizes[0] !== 0 && !self.substates["LAST"]) {
          State.changeSubstate("FIRST", true);
        }

        // Change state to ACTIVE and LIST
        State.changeState("ACTIVE");
        State.changeSubstate("LIST", true);

        // Update listing display
        //self.listing = Navigate.getDisplay(Navigate.listing_buffer);
        self.listing = Navigate.listing_buffer;
        console.log("Listing", self.listing);
      }
    });
  }]);

  ng_app.controller("OverlayCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    var self = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange",    function() { self.state     = State.state;     });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });
    $scope.$on("onsearchreturned", function() { State.changeSubstate("OVERLAY", true); });
  }]);

  ng_app.controller("InfoCtrl",
    ["$scope", "Navigate",
    function($scope, Navigate) {
    // Handles display info for current image
    // How many images got returned
    var self       = this;
    self.current   = {};
    self.date      =  0;

    $scope.$on("onnavigate", function() {
      // Update image info box
      self.current = Navigate.current;

      if(self.current) {
        // Convert date to readable Date
        var date = new Date(self.current.date * 1000);
        self.date = date.toDateString();
      }

      $scope.$apply();
    });
  }]);

  ng_app.controller("OptionsCtrl",
    ["$scope", "$rootScope", "Search",
    function($scope, $rootScope, Search) {
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
    self.current = {};
    self.state     = State.state;
    self.substates = State.substates;
    self.scrollbar = { "onScroll": function(y, x) { /* Options... */ } };

    $scope.$on("onstatechange",    function() { self.state     = State.state;     });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

    $scope.$on("onkeyarrow", function() {
      if(!State.substates["SEARCH"]) {
        switch(Keyboard.ord) {
          case "LEFT":
            Navigate.prev();
            break;
          case "RIGHT":
            Navigate.next();
            break;
        }
      }
    });

    $scope.$on("onnavigate", function() {
      // Blank out src
      ng_app.image_front.attr("src", "");
      ng_app.image_back.css("background-image", "url('')");

      // Display preview image if available, otherwise full resolution picture
      self.current = Navigate.current;

      if(self.current) {
        var image = (self.current.preview || self.current.content || self.current.thumbs);

        if(self.current.zoom) {
          // View full resolution picture instead
          image = self.current.content;
          ng_app.image_front.attr("src", image);
        } else {
          ng_app.image_front.attr("src", image);
          ng_app.image_back.css("background-image", "url('" + image + "')");
        }

        $scope.$apply();
      } else {
        // Do not update
        console.log("Could not find image", Navigate.index);
      }
    });
  }]);

}(ng_hound));
