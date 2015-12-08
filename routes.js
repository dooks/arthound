var express = require("express");
var router  = express.Router();
var request = require("request");
var promise = require("promise");
var filter  = require("./filter.js");

var global_delay = 1000; // 1 second

var client_keys = {
  "deviantart": {
    client_id: "4010",
    client_secret: "ca8edec4cdaa48fc6b64196de7394d66",
    access_token: null,
    slow_down: false,
    last_delay: 0
  }
};
(function newToken() {
  request({
    url: "https://www.deviantart.com/oauth2/token",
    method: "GET",
    qs: {
      "client_id":     client_keys["deviantart"].client_id,
      "client_secret": client_keys["deviantart"].client_secret,
      "grant_type":    "client_credentials"
    },
  }, function(err, res, body) {
    if(body === undefined) body = "{}";
    var obj = JSON.parse(body);
    client_keys["deviantart"].access_token = obj.access_token;
    console.log("New token:", client_keys["deviantart"].access_token);

    if(obj.expires_in) {
      // Automatically renew token
      console.log("Renewing token in...", +obj.expires_in, "seconds");
      setTimeout(newToken, obj.expires_in * 1000);
    }
  });
}())

router.get('/request', function(req, response, next) {
  // Limit tags to one word only
  req.query.tags = req.query.tags || "fire"; // "fire" is a nice, subjective default
  req.query.tags = encodeURIComponent(req.query.tags);
  var   page     = req.query.page || 0;
  var  limit     = req.query.limit || 24;

  // 24 is set hard limit due to Deviantart...
  if(limit > 24) limit = 24;

  setTimeout(function() { // Global delay, always wait 1 second (at least)
    // Deviantart has adaptive rate limiting...
    var deviantart_promise = new promise(function(resolve, reject) {
      setTimeout(function() {
        request({
          url: "https://www.deviantart.com/api/v1/oauth2/browse/tags" +
               "?tag="    +  req.query.tags.replace(/(%20|\ ).*$/, "") +
               "&offset=" +  page*limit +
               "&limit="  +  limit,
          method:   "GET",
          headers: { "Authorization": "Bearer " + client_keys["deviantart"].access_token }
        }, function(err, res, body) {
          if(res.statusCode === 429) { // Reached adaptive rate limit
            console.log("DeviantArt rate limit reached...");
            client_keys["deviantart"].last_delay *= 2;
          } else {
            if(--client_keys["deviantart"].last_delay <= 0) {
              // Deactivate slow_down limit
              client_keys["deviantart"].last_delay = 0;
            }
          }

          // Normalize deviantart data before resolving promise
          var retval = JSON.parse(body);
          var new_body = retval.results || [];
          new_body = filter.deviantart(new_body);
          resolve(new_body);
        });
      }, client_keys["deviantart"].last_delay);
    });

    var e926_promise = new promise(function(resolve, reject) {
      request({
        url: "https://e621.net/post/index.json" +
             "?tags="       + req.query.tags     +
             "%20rating:s"  + // Force safe rating search
             "%20score:>40" + // Force high score...
             "%20-friendship_is_magic" + // Substract ponies...
             "&page="       + page  +
             "&limit="      + limit,
        method:   "GET"
      }, function(err, res, body) {
        // Normalize e621 data before resolving promise
        var retval = JSON.parse(body);
        var new_body = retval || [];
        new_body = filter.e926(new_body);

        resolve(new_body);
      });
    });

    promise.all([ deviantart_promise, e926_promise ]).then(
      function(res) {
        //response.end(res[0].concat(res[1]));
        var retval = res[0].concat(res[1]);
        response.json(retval);
      }
    );
  }, global_delay);

});

module.exports = router;
