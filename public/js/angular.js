var ng_hound = (function(ng) {
  if(ng === undefined || ng === null) {
    console.error("Angular not found");
  }

  var ng_app = ng.module("ngHound", ["jQueryScrollbar"]);

  // Store references to important elements on document...
  ng_app.base_back        = $("#base_back");
  ng_app.base_view        = $("#base_view");
  ng_app.base_title       = $("#base_title_container");

  ng_app.base_searchbar   = $("#base_searchbar");
  ng_app.searchbar_search = $("#searchbar_search");

  ng_app.base_image       = $("#base_image");
  ng_app.base_image_info  = $("#base_image > h2");
    ng_app.image_info     = $("#image_info");

  ng_app.image_div        = $("#image_back");
    ng_app.image_img      = $("#image_front");

  ng_app.base_listing     = $("#base_listing");
    ng_app.page_next      = $("#page_next");
    ng_app.page_prev      = $("#page_prev");

  return ng_app;
}(angular));
