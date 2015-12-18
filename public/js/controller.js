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

  ng_app.controller("TitleCtrl", ["$scope", "State",
    function($scope, State) {
    // Handles the title container
    var self       = this;
    self.state     = State.state;
    self.substates = State.substates;

    $scope.$on("onstatechange", function() { self.state = State.state; });
  }]);

  ng_app.controller("SearchbarCtrl",
    ["$scope", "State", "Keyboard", "Search", "Navigate",
    function($scope, State, Keyboard, Search, Navigate) {
    // Handles the searching overlay
    // Searching overlay appears when beginning to type
    var self = this;
    self.state     = State.state;
    self.substates = State.substates;
    self.sources = { "deviantart": true, "imgur": true };

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

    $scope.$on("onkeyup", function() {
      // Add letter to search term
      Search.query += Keyboard.ord.toLowerCase();
      self.query = Search.query;

      if(!State.substates["SEARCH"]) { State.changeSubstate("SEARCH", true); }
      else { $scope.$apply(); }
    });

    $scope.$on("onkeybackspace", function() {
      if(State.substates["SEARCH"]) {
        // delete last letter of query
        Search.query = Search.query.slice(0, -1);
        self.query = Search.query;

        if(self.query === "") { State.changeSubstate("SEARCH", false); }
        else { $scope.$apply(); }
      }
    });

    $scope.$on("onkeyenter", function() {
      if(State.substates["SEARCH"] && State.state !== "LOAD") {
        // initiate Search
        State.changeState("LOAD");

        // this is a new search, so...
        // clear the old listing_buffer
        Navigate.initialize();

        // Clear search responses
        Search.clearResponse();

        // Reset sources
        Search.resetSources(self.sources);

        // Initiate search
        Search.get(Search.query);
      }
    });

    $scope.$on("onkeyesc", function() {
      if(State.substates["SEARCH"]) {
        // clear search
        Search.clear();

        // switch to NONE substate
        State.changeSubstate("SEARCH", false);
      }
    });
  }]);

  ng_app.controller("ListingCtrl",
    ["$scope", "State", "Search", "Navigate",
    function($scope, State, Search, Navigate) {
    // Handles the searchlist overlay, which contains a grid list of searches found
    var self = this;
    self.listing   = [];
    self.state     = State.state;
    self.substates = State.substates;
    self.scrollbar = { "onScroll": function(y, x) { } };

    $scope.$on("onstatechange",    function() { self.state     = State.state;     });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

    $scope.$on("onkeyesc", function() {
      if(State.substates["LIST"] && State.substate["FULL"]) {
        State.changeSubstate("LIST", false);
      }
    });

    $scope.$on("onnavigate", function() {
      if(State.substates["FULL"]) { State.changeSubstate("LIST", false); }
    });

    $scope.$on("onnavigatepage", function() {
      if(!Navigate.last_page && State.state !== "LOAD") {
        State.changeState("LOAD");
        Search.get(Search.last_query, Navigate.current_page, Navigate.limit);
      }
    });

    $scope.$on("onnavigatepop", function() {
      Navigate.to(0);
      State.changeState("ACTIVE");
      State.changeSubstate("LIST", true);
    });

    $scope.$on("onsearchreturned", function() {
      // Append response to Navigation service listing
      // If last result in queue has no length...
      State.changeSubstate("SEARCH", false);
      Search.clear();

      if(Search.response[Search.response.length -1].data.length === 0) {
        Search.clearResponse();
        console.log("Paging is now disabled, end of results");
        // No search results, or we've reached the last page
        Navigate.last_page = true;

        // Disallow next paging
        Navigate.can_page = false;

        // Disable next page button
        ng_app.page_next.addClass("page-button-inactive");
      } else {
        // Allow paging again
        Navigate.can_page = true;
        ng_app.page_next.removeClass("page-button-inactive");

        Navigate.append(Search.response[0]);
        Search.clearResponse(); // Clear oldest response

        // Update listing display
        self.listing = Navigate.getDisplay(Navigate.listing_buffer);
        //console.log("Listing", self.listing);
      }
    });
  }]);

  ng_app.controller("OverlayCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    var self = this;
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
      self.current = Navigate.findByIndex(Navigate.index);

      if(self.current) {
        // Convert date to readable Date
        var date = new Date(self.current.date * 1000);
        self.date = date.toDateString();
        $scope.$apply();
      }
    });
  }]);

  ng_app.controller("ImageCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    // Handles current image being shown
    var self = this;
    self.current = {};
    self.state     = State.state;
    self.substates = State.substates;

    self.scrollbar = { "onScroll": function(y, x) { /* Options... */ } };

    $scope.$on("onstatechange",    function() { self.state     = State.state;     });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

    $scope.$on("onnavigate", function() {
      // Blank out src
      ng_app.image_front.attr("src", "");
      ng_app.image_back.css("background-image", "url('')");

      // Display preview image if available, otherwise full resolution picture
      self.current = Navigate.findByIndex(Navigate.index);
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
      } else {
        // Do not update
        console.log("Could not find image", Navigate.index);
      }
    });
  }]);

}(ng_hound));
