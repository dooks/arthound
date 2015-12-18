var request = require("request");

module.exports = {
  "deviantart": {
    client_id: "4010",
    client_secret: "ca8edec4cdaa48fc6b64196de7394d66",
    access_token: null,
    slow_down: false,
    last_delay: 0
  },
  "e926": {
    // Does not require authentication, no request limit
  },
  "imgur": {
    client_id: "1f63c77eaec2b1c",
    user_limit:       500,
    user_remaining:   0,
    user_reset:       0,
    client_limit:     12500,
    client_remaining: 0,
    hard_delay:     1000
  }
};

(function deviantToken() {
  request({
    url: "https://www.deviantart.com/oauth2/token",
    method: "GET",
    qs: {
      "client_id":     module.exports["deviantart"].client_id,
      "client_secret": module.exports["deviantart"].client_secret,
      "grant_type":    "client_credentials"
    },
  }, function(err, res, body) {
    if(body === undefined) body = "{}";
    var obj = JSON.parse(body);
    module.exports["deviantart"].access_token = obj.access_token;
    console.log("Deviant Art token:", module.exports["deviantart"].access_token);

    if(obj.expires_in) {
      // Automatically renew token
      setTimeout(deviantToken, obj.expires_in * 1000);
      console.log("Deviant Art bearer token resets in...", +obj.expires_in, "seconds");
    }
  });
}());

(function imgurRate() {
  request({
    url: "https://api.imgur.com/3/credits",
    method:   "GET",
    headers: { "Authorization": "Client-ID " + module.exports["imgur"].client_id }
  }, function(err, res, body) {
    var parsed_body = JSON.parse(body);

    // Re-initialize things......
    module.exports["imgur"].user_limit       = parsed_body.data["UserLimit"];
    module.exports["imgur"].user_remaining   = parsed_body.data["UserRemaining"];
    module.exports["imgur"].user_reset       = parsed_body.data["UserReset"];
    module.exports["imgur"].client_limit     = parsed_body.data["ClientLimit"];
    module.exports["imgur"].client_remaining = parsed_body.data["ClientRemaining"];

    // Determine when to run this function again
    var now   = new Date(Date.now());
    var then  = new Date(module.exports["imgur"].user_reset * 1000);
    var timer = new Date(then.getTime() - now.getTime());

    console.log("Imgur User Limit resets at", then.toString(), then.getTime());
    console.log("Imgur user_remaining",   module.exports["imgur"].user_remaining);
    console.log("Imgur client_remaining", module.exports["imgur"].client_remaining);
    setTimeout(imgurRate, timer);
  });


}());

