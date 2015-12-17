(function(ng_app) {
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
    self.sources = { "deviantart": true, "e926": false, "imgur": true };

    $scope.$on("onstatechange",    function() { self.state = State.state;         });
    $scope.$on("onsubstatechange", function() { self.substates = State.substates; });

    $scope.$on("onkeyup", function() {
      if(!State.substates["SEARCH"]) { State.changeSubstate("SEARCH", true); }

      // Add letter to search term
      Search.query += Keyboard.ord.toLowerCase();
      self.query = Search.query;

      // Force $scope to update
      $scope.$apply();
    });

    $scope.$on("onkeybackspace", function() {
      if(State.substates["SEARCH"]) {
        // delete last letter of query
        Search.query = Search.query.slice(0, -1);
        self.query = Search.query;
        if(self.query === "") { State.changeSubstate("SEARCH", false); }

        // Force $scope to update
        $scope.$apply();
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
        // switch to NONE substate
        State.changeSubstate("SEARCH", false);

        // clear search
        Search.clear();

        // Force $scope to update
        $scope.$apply();
      }
    });
  }]);

  ng_app.controller("ListingCtrl",
    ["$scope", "State", "Search", "Navigate", "Bootstrap",
    function($scope, State, Search, Navigate, Bootstrap) {
    // Handles the searchlist overlay, which contains a grid list of searches found
    var self = this;
    self.listing   = [];
    //self.state     = States.state;
    self.substates = State.substates["FULL"];
    self.scrollbar = { "onScroll": function(y, x) { } };

    $scope.$on("onstatechange", function() {
      switch(State.state) {
        case "DEFAULT":
          ng_app.base_listing.addClass("hidden");
          break;

        case "ACTIVE":
          // show base_listing
          ng_app.base_listing.removeClass("hidden");
          break;
      }
    });

    $scope.$on("onsubstatechange", function() {
      //if(State.substates["FULL"]) {
        //// Switch sidebar to full
        //ng_app.base_listing.addClass("full-listing");
        //$(".image-square-container").addClass("image-square-container-full");
      //} else if(!State.substates["FULL"]) {
        //ng_app.base_listing.removeClass("full-listing");
        //$(".image-square-container").removeClass("image-square-container-full");
      //}

      if(State.substates["LIST"])       {
        ng_app.base_listing.removeClass("hidden");
        ng_app.base_view.removeClass("no-list");
      }
      else if(!State.substates["LIST"]) {
        ng_app.base_listing.addClass("hidden");
        ng_app.base_view.addClass("no-list");
      }
    });

    $scope.$on("onkeyesc", function() {
      if(State.substates["LIST"] && State.substate["FULL"]) {
        State.changeSubstate("LIST", false);
      }
    });

    $scope.$on("onviewportchange", function() {
      if(Bootstrap.state === "xs") { State.changeSubstate("FULL", true); }
      if(Bootstrap.state === "sm" || Bootstrap.state === "md" || Bootstrap.state === "lg") {
        State.changeSubstate("FULL", false);
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

  ng_app.controller("InfoCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    // Handles display info for current image
    // How many images got returned
    var self = this;
    self.current = {};
    self.date    =  0;

    $scope.$on("onnavigate", function() {
      // Draw image info
      self.current = Navigate.findByIndex(Navigate.index);

      if(self.current) {
        ng_app.image_info.removeClass("hidden");

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
    var current = {};

    self.scrollbar = { "onScroll": function(y, x) { /* Options... */ } };

    $scope.$on("onstatechange", function() {
      switch(State.state) {
        case "DEFAULT":
          ng_app.base_image.addClass("hidden");
          break;

        case "ACTIVE":
          // show base_listing
          ng_app.base_image.removeClass("hidden");
          break;
      }
    });

    $scope.$on("onnavigate", function() {
      // Blank out src
      ng_app.image_img.attr("src", "");
      ng_app.image_div.css("background-image", "url('')");

      // Display preview image if available, otherwise full resolution picture
      current = Navigate.findByIndex(Navigate.index);
      if(current) {
        var image = (current.preview || current.content || current.thumbs);


        if(current.zoom) {
          // View full resolution picture instead
          image = current.content;
          ng_app.image_img.attr("src", image);

          ng_app.image_img.addClass("base_image_zoom");
          ng_app.image_div.addClass("hidden");
        } else {
          ng_app.image_img.attr("src", image);

          ng_app.image_img.removeClass("base_image_zoom");
          ng_app.image_div.removeClass("hidden");
          ng_app.image_div.css("background-image", "url('" + image + "')");
        }
      } else {
        // Do not update
        console.log("Could not find image", Navigate.index);
      }
    });
  }]);

}(ng_hound));
