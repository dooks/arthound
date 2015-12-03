(function(ng_app) {
  ng_app.controller("SearchbarCtrl",
    ["$scope", "State", "Keyboard", "Search",
    function($scope, State, Keyboard, Search) {

    // Handles the searching overlay, overrides typing
    var self = this;

    $scope.$on("onkeyup", function() {
      if(State.substate === "NONE") {
        // activate INPUT substate
        State.changeSubstate("INPUT");

        // Add first letter to Search term
        self.search += Keyboard.ord;

        // Focus
        ng_app.searchbar_search.focus();
      }
    });

    $scope.$on("onkeyenter", function() {
      // Clear Search
      self.search = "";

      // If substate INPUT, initiate Search
      if(State.substate === "INPUT") {
        // lose focus...
        ng_app.searchbar_search.blur();

        // Change State and substate
        State.changeSubstate("NONE");
        State.changeState("SEARCHING");

        Search.search($scope.search);
      }
    });

    $scope.$on("onkeyesc", function() {
      // Clear Search
      self.search = "";

      if(State.substate === "INPUT") {
        // switch to NONE substate
        State.changeSubstate("NONE");

        // lose focus...
        ng_app.searchbar_search.blur();
      }
    });
  }]);

  ng_app.controller("SearchesCtrl", [function() {
    // Handles the searchlist overlay, which contains a grid list of searches found
    var self = this;
  }]);

  ng_app.controller("OverlayCtrl", [function() {
    // Handles navigation of slideshow, slideshow settings, options, info, download
    var self = this;
  }]);

  ng_app.controller("ImageCtrl", [function() {
    // Handles current image being shown
    var self = this;
  }]);

}(ng_pokemon));
