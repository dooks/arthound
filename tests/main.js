(function(ng_app, ng_app_name) {
describe("MainCtrl", function() {
  var scope, $rootScope, testController;

  // Inject 'scope' into all describes
  beforeEach(module(ng_app_name));
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    $controller("MainCtrl as main", {$scope: scope});
  }));

  describe("MainCtrl.changeState", function() {
    it("changeState('DEFAULT') should hide base_searches and base_overlay", function() {
      scope.main.changeState("DEFAULT");
      expect(ng_app.base_searches.hasClass("hidden")).toBe(true);
      expect(ng_app.base_overlay_container.hasClass("hidden")).toBe(true);
    });

    it("changeState('ACTIVE') should show base_searches and base_overlay", function() {
      scope.main.changeState("ACTIVE");
      expect(ng_app.base_searches.hasClass("hidden")).toBe(false);
      expect(ng_app.base_overlay_container.hasClass("hidden")).toBe(false);
    });

    it("changeState('SEARCHING') should hide base_searches and base_overlay", function() {
      scope.main.changeState("SEARCHING");
      expect(ng_app.base_searches.hasClass("hidden")).toBe(true);
      expect(ng_app.base_overlay_container.hasClass("hidden")).toBe(true);
    });
  });

  describe("MainCtrl.changeSubstate", function() {

    it("changeSubstate('NONE') should hide base_searchbar", function() {
      scope.main.changeSubstate("NONE");
      expect(ng_app.base_searchbar.hasClass("hidden")).toBe(true);
    });

    it("changeSubstate('INPUT') should show base_searchbar", function() {
      scope.main.changeSubstate("INPUT");
      expect(ng_app.base_searchbar.hasClass("hidden")).toBe(false);
    });

    it("changeSubstate('LOAD') shouldn't do anything...", function() {
      scope.main.changeSubstate("LOAD");
    });
  });
});

}(ng_pokemon, "ngPokemon"));
