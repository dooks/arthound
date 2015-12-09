var request = require("request");

module.exports = {
  "deviantart": {
    client_id: "4010",
    client_secret: "ca8edec4cdaa48fc6b64196de7394d66",
    access_token: null,
    slow_down: false,
    last_delay: 0
  },
  "imgur": {
    client_id: "1f63c77eaec2b1c",
    user_limit:       500,
    user_remaining:   0,
    user_reset:       0,
    client_limit:     12500,
    client_remaining: 0,
    hard_delay:     2000
  }
};

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
    console.log("Imgur Rate Limits:", module.exports["imgur"]);

    // Determine when to run this function again
    var now   = Date.now();
    var then  = new Date(module.exports["imgur"].user_reset * 1000);
    var timer = new Date(then - now);

    console.log("Imgur User Limit resets at", then.toString());
    setTimeout(imgurRate, timer);
  });


}());

