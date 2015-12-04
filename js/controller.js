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

        // Add letter to search term
        Search.query += Keyboard.ord;

        // Focus
        ng_app.searchbar_search.focus();
      }
    });

    $scope.$on("onkeyenter", function() {
      // If substate INPUT, initiate Search
      if(State.substate === "INPUT") {
        // lose focus, search, and clear
        ng_app.searchbar_search.blur();

        // Change State and substate
        State.changeSubstate("NONE");
        State.changeState("SEARCHING");
        Search.search(ng_app.searchbar_search.val());
      }
    });

    $scope.$on("onkeyesc", function() {
      if(State.substate === "INPUT") {
        // switch to NONE substate
        State.changeSubstate("NONE");

        // lose focus and clear...
        Search.clear();
        ng_app.searchbar_search.blur();
      }
    });
  }]);

  ng_app.controller("ListingCtrl",
    ["$scope", "State", "Search", "Navigate",
    function($scope, State, Search, Navigate) {
    // Handles the searchlist overlay, which contains a grid list of searches found
    var self = this;
    self.listing = {};

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
      Navigate.to(0); // Navigate to first element
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
          ng_app.base_overlay_container.removeClass("hidden");
          break;
      }
    });
  }]);

  ng_app.controller("ImageCtrl", [function() {
    // Handles current image being shown
    var self = this;
  }]);

}(ng_pokemon));
