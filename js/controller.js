(function(ng_app) {
  ng_app.controller("MainCtrl", [function() {
    var self = this;

    self.state    = "DEFAULT"; // DEFAULT | SEARCHING | ACTIVE
    self.substate = "NONE";    //    NONE | LOADING   | INPUT

    self.changeState = function(state, callback) {
      self.state = state;

      switch(state) {
        case "DEFAULT":
        case "SEARCHING":
          // Clear image list
          // hide base_searches
          ng_app.base_searches.addClass("hidden");
          // hide base_overlay_container
          ng_app.base_overlay_container.addClass("hidden");
          break;
        case "ACTIVE":
          // show base_searches
          ng_app.base_searches.removeClass("hidden");
          // show base_overlay_container
          ng_app.base_overlay_container.removeClass("hidden");
          break;
        default:
          break;
      }
    };

    self.changeSubstate = function(substate) {
      switch(substate) {
        case "NONE":
          // hide base_searchbar
          ng_app.base_searchbar.addClass("hidden");
          break;
        case "INPUT":
          // Show base_searchbar
          ng_app.base_searchbar.removeClass("hidden");
          break;
        default:
          break;
      }
    };

  }]);

  ng_app.controller("SearchbarCtrl", [function() {
    // Handles the searching overlay, overrides typing
    var self = this;

    self.search = ""; // bound ngModel with #searchbar_search
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
