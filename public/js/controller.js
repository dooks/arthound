(function(ng_app) {
  ng_app.controller("SearchbarCtrl",
    ["$scope", "State", "Keyboard", "Search", "Navigate",
    function($scope, State, Keyboard, Search, Navigate) {
    // Handles the searching overlay
    // Searching overlay appears when beginning to type
    var self = this;

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

        // this is a new search, so clear the old listing and response...
        Navigate.clear();
        Search.clearResponse();
        Search.queue();

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
    ["$scope", "State", "Search", "Navigate",
    function($scope, State, Search, Navigate) {
    // Handles the searchlist overlay, which contains a grid list of searches found
    var self = this;
    self.listing = [];

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

    $scope.$on("onnavigatepage", function() {
      // Append search response to end of listing array
      Search.queue(Search.last_query, Navigate.current_page, Navigate.limit);
    });

    $scope.$on("onnavigatepop", function() {
      Navigate.to(0);
      // Preemptively load next two pages...
      Navigate.nextPage();
    });

    $scope.$on("onsearchreturned", function() {
      // Append response to Navigation service listing
      Navigate.append(Search.response);
      Search.clearResponse(); // Immediately discard response

      self.listing = Navigate.listing; // Make available to directive
      State.changeState("ACTIVE");
    });

  }]);

  ng_app.controller("InfoCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    // Handles display info for current image
    // How many images got returned
    var self = this;
    self.current = {};
    self.date = null;
    self.message = "Type anywhere...";

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
      self.current = Navigate.findByIndex(Navigate.index);
      self.drawInfo();
    });

    self.drawInfo = function() {
      ng_app.info_details.removeClass("hidden");
      ng_app.info_help.addClass("hidden");

      // Convert date to readable Date
      var date = new Date(self.current.date * 1000);
      self.date = date.toDateString();
      $scope.$apply();
    };
  }]);

  ng_app.controller("ImageCtrl",
    ["$scope", "State", "Navigate",
    function($scope, State, Navigate) {
    // Handles current image being shown
    var self = this;
    var current = {};

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
      var image = (current.preview || current.content || current.thumbs);
      ng_app.image_img.attr("src", image);
      ng_app.image_div.css("background-image", "url('" + image + "')");
    });
  }]);

}(ng_hound));
