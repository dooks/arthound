(function(ng_app) {
  // Do nothing
  ng_app.controller("MainCtrl", [function() {
    var self = this;
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
