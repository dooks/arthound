window.client_keys = function() {
  var keys = {};
  keys["deviantart"] = { "access_token": "" };

  $.ajax({ method: "GET", url: "/request/deviantart/token", }).then(
    function success(res) {
      keys["deviantart"].access_token = res;
    },
    function error(res) { console.error(res); }
  );

  // TODO: check if any keys are null, then throw error
  return keys;
}();
