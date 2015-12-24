window.ng_hound = (function(ng) {
  $(document).ready(function() {
    var version = "0.8.9";
    $(".version").html(version);
  });

  if(ng === undefined || ng === null) {
    console.error("Angular not found");
  }

  var ng_app = ng.module("ngHound", ["jQueryScrollbar", "ngRoute", "rzModule"]);

  ng_app.config(["$locationProvider", "$routeProvider",
      function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when("/", { reloadOnSearch: false });
  }]);

  // Store references to important elements on document...
  ng_app.base_back        = $("#base_back");
  ng_app.base_view        = $("#base_view");
  ng_app.base_title       = $("#base_title_container");

  ng_app.modal_about      = $("#modal_about");
  ng_app.modal_info       = $("#modal_info");
  ng_app.modal_options    = $("#modal_options");
  ng_app.modal_help       = $("#modal_help");

  ng_app.base_searchbar      = $("#base_searchbar");
    ng_app.searchbar_info    = $("#searchbar_info");
    ng_app.searchbar_message = $("#searchbar_message");
    ng_app.searchbar_search  = $("#searchbar_search");

  ng_app.base_image       = $("#base_image");
    ng_app.image_overlay  = $("#image_overlay");
      ng_app.overlay_info   = $("#overlay_info");
      ng_app.overlay_list   = $("#overlay_list");
      ng_app.overlay_next   = $("#overlay_next");
      ng_app.overlay_prev   = $("#overlay_prev");
    ng_app.image_front  = $("#image_front");
    ng_app.image_back     = $("#image_back");

  ng_app.base_listing     = $("#base_listing");
    ng_app.page_next      = $("#page_next");
    ng_app.page_prev      = $("#page_prev");

  return ng_app;
}(angular));
