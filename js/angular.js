var ng_pokemon = (function(ng) {
  if(ng === undefined || ng === null) {
    console.error("Angular not found");
  }

  var ng_app = ng.module("ngPokemon", []);

  return ng_app;
}(angular));
