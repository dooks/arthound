var ng_pokemon = (function(ng) {
  if(ng === undefined || ng === null) {
    console.error("Angular not found");
  }

  var ng_app = ng.module("ngPokemon", []);

  // Store references to important elements on document...
  ng_app.base_back        = $("#base_back");
  ng_app.base_view        = $("#base_view");
  ng_app.base_searchbar   = $("#base_searchbar");
  ng_app.searchbar_search = $("#searchbar_search");
  ng_app.base_image       = $("#base_image");
  ng_app.base_overlay     = $("#base_overlay");
  ng_app.base_listing     = $("#base_listing");
  ng_app.base_overlay_container = $("#base_overlay_container");

  return ng_app;
}(angular));
