(function(ng_app) {
  ng_app.controller("SearchbarCtrl",
    ["$scope", "State", "Keyboard", "Search",
    function($scope, State, Keyboard, Search) {
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

        // this is a new search, so clear the old response...
        Search.clearResponse();
        Search.search();

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

    $scope.$on("onstatechange", function() {
      switch(State.state) {
        case "DEFAULT":
        case "SEARCHING":
          ng_app.base_listing.addClass("hidden");
          break;

        case "ACTIVE":
          // show base_listing
          ng_app.base_listing.removeClass("hidden");
          break;
      }
    });

    $scope.$on("onsearchreturned", function() {
      // Hand off to a listing service
      Navigate.populate(Search.response.results);
      Search.clearResponse();

      self.listing = Navigate.listing; // Make available to directive
      console.log(self.listing);
      //Navigate.to(0); // Navigate to first element
      State.changeState("ACTIVE");
    });

  }]);

  ng_app.controller("OverlayCtrl",
    ["$scope", "State", "Keyboard", "Search",
    function($scope, State, Keyboard, Search) {
    // Handles navigation of slideshow, slideshow settings, options, info, download
    var self = this;

    $scope.$on("onstatechange", function() {
      switch(State.state) {
        case "DEFAULT":
        case "SEARCHING":
          ng_app.base_overlay_container.addClass("hidden");
          break;

        case "ACTIVE":
          // show base_listing
          //ng_app.base_overlay_container.removeClass("hidden");
          break;
      }
    });
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

    $scope.$on("onnavigatepop", function() {
      Navigate.to(0);
    });

    $scope.$on("onnavigate", function() {
      // Display preview image if available, otherwise full resolution picture
      current = Navigate.listing[Navigate.current];
      var image = (current.preview || current.content);
      ng_app.image_img.attr("src", image);
      ng_app.image_div.css("background-image", "url('" + image + "')");
    });
  }]);

}(ng_pokemon));
