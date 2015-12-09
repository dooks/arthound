(function(ng_app) {
  ng_app.controller("SearchbarCtrl",
    ["$scope", "State", "Keyboard", "Search", "Navigate",
    function($scope, State, Keyboard, Search, Navigate) {
    // Handles the searching overlay
    // Searching overlay appears when beginning to type
    var self = this;
    self.sources = { "deviantart": true, "e926": true, "imgur": true };

    $scope.$on("onsubstatechange", function() {
      switch(State.substate) {
        case "NONE":
          ng_app.base_searchbar.addClass("hidden");
          break;

        case "INPUT":
          ng_app.base_searchbar.removeClass("hidden");
          break;
      }
    });

    $scope.$on("onkeyup", function() {
      if(State.substate === "NONE") {
        // activate INPUT substate
        State.changeSubstate("INPUT");
      }

      // Add letter to search term
      Search.query += Keyboard.ord.toLowerCase();
      self.query = Search.query;

      // Force $scope to update
      $scope.$apply();
    });

    $scope.$on("onkeybackspace", function() {
      if(State.substate === "INPUT") {
        // delete last letter of query
        Search.query = Search.query.slice(0, -1);
        self.query = Search.query;

        // Force $scope to update
        $scope.$apply();
      }
    });

    $scope.$on("onkeyenter", function() {
      if(State.substate === "INPUT") {
        // initiate Search
        State.changeSubstate("NONE");
        State.changeState("SEARCHING");

        // this is a new search, so...
        // clear the old listing_buffer
        Navigate.initialize();
        // Clear search responses
        Search.clearResponse();
        // Reset sources
        Search.resetSources(self.sources);
        Search.get(Search.query);

        // Force $scope to update
        Search.clear();
        $scope.$apply();
      } else {
        // Open INPUT
        State.changeSubstate("INPUT");
      }
    });

    $scope.$on("onkeyesc", function() {
      if(State.substate === "INPUT") {
        // switch to NONE substate
        State.changeSubstate("NONE");

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
    self.listing = [ ];

    self.scrollbar = {
      "onScroll": function(y, x) {
        if(y.scroll === y.maxScroll) {
          if(self.listing.length > 0) { Navigate.nextPage(); }
        }
      }
    };

    $scope.$on("onstatechange", function() {
      switch(State.state) {
        case "DEFAULT":
        case "SEARCHING":
          ng_app.base_listing.addClass("invisible");
          break;

        case "ACTIVE":
          // show base_listing
          ng_app.base_listing.removeClass("invisible");
          break;
      }
    });

    $scope.$on("onviewportchange", function() {
      console.log(Bootstrap.state);

      if(Bootstrap.state === "xs") {
        // Switch sidebar to full
        ng_app.base_sidebar.addClass("full-sidebar");
        ng_app.base_view.addClass("no-padding");
        ng_app.base_info.addClass("hidden");
        $(".image-square-container").addClass("image-square-container-full");
      }
      if(Bootstrap.state === "sm" || Bootstrap.state === "md" || Bootstrap.state === "lg") {
        // Switch sidebar to normal
        ng_app.base_sidebar.removeClass("full-sidebar");
        ng_app.base_view.removeClass("no-padding");
        ng_app.base_info.removeClass("hidden");
        $(".image-square-container").removeClass("image-square-container-full");
      }
    });

    $scope.$on("onnavigatepage", function() {
      // Append search response to end of listing array
      if(!Navigate.last_page) {
        Search.get(Search.last_query, Navigate.current_page, Navigate.limit);
      }
    });

    $scope.$on("onnavigatepop", function() {
      Navigate.to(0);

      if(!Navigate.last_page) {
        // queue up to current_high
        for(var i = 1; i <= Navigate.display_high; i++) {
          Search.get(Search.last_query, Navigate.current_page + i)
        }
      }
      State.changeState("ACTIVE");
    });

    $scope.$on("onsearchreturned", function() {
      // Append response to Navigation service listing
      // If last result in queue has no length...

      if(Search.response[Search.response.length -1].data.length === 0) {
        Search.clearResponse();
        console.log("Paging is now disabled, end of results");
        // No search results, or we've reached the last page
        Navigate.last_page = true;

        // Disallow next paging
        Navigate.can_page = false;
      } else {
        // Allow paging again
        Navigate.can_page = true;

        Navigate.append(Search.response[0]);
        Search.clearResponse(); // Clear oldest response

        // Update listing display
        self.listing = Navigate.getDisplay(Navigate.listing_buffer);
        //console.log("Listing", self.listing);
        //self.listing = Navigate.listing_buffer;
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
    var date = null;
    var message = "Type anywhere...";

    $scope.$on("onstatechange", function() {
      switch(State.state) {
        case "DEFAULT":
        case "SEARCHING":
          // Display instructions for typing
          ng_app.info_help.removeClass("hidden");
          ng_app.info_details.addClass("hidden");
          break;
      }
    });

    $scope.$on("onnavigate", function() {
      // Draw image info
      self.current = Navigate.findByIndex(Navigate.index);

      if(self.current) {
        ng_app.info_details.removeClass("hidden");
        ng_app.info_help.addClass("hidden");

        // Convert date to readable Date
        var date = new Date(self.current.date * 1000);
        date = date.toDateString();
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
          //ng_app.base_image_info.removeClass("hidden");
          break;

        case "ACTIVE":
          // show base_listing
          //ng_app.base_image_info.addClass("hidden");
          break;
      }
    });

    $scope.$on("onnavigate", function() {
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
