var express = require("express");
var router  = express.Router();
var request = require("request");
var promise = require("promise");

var filter  = require("./filter");
var client_keys = require("./keys");

router.post('/request', function(req, response, next) {
  // Limit tags to one word only
  // "fire" is a nice, subjective default
  // Possibly replace with a "most popular" tag... ?
  req.body.tags = req.body.tags || "fire";
  req.body.tags = encodeURIComponent(req.body.tags);
  var page    = req.body.page    || 0;
  var limit   = req.body.limit   || 24;
  var sources = req.body.sources || { "deviantart": true, "e926": true, "imgur": true };

  if(sources.length === 0) console.error("No sources defined!");
  if(limit > 24) limit = 24; // Server hard limit
  var promises = [];

  /* ************* *
   * ************* *
   * * Deviant Art *
   * ************* *
   * ************* */
    // Deviantart has adaptive rate limiting...
  if(sources["deviantart"] === true) {
    promises.push(
      new promise(function(resolve, reject) {

        setTimeout(function() {
          request({
            url: "https://www.deviantart.com/api/v1/oauth2/browse/tags" +
                 // Limit DA search query to one word...
                 "?tag="    +  req.body.tags.replace(/(%20|\ ).*$/, "") +
                 "&offset=" +  page*limit +
                 "&limit="  +  limit,
            method:   "GET",
            headers: { "Authorization": "Bearer " + client_keys["deviantart"].access_token }
          }, function(err, res, body) {
            if(res.statusCode === 429) { // Reached adaptive rate limit
              console.error("DeviantArt rate limit reached...");

              client_keys["deviantart"].last_delay *= 2;
              if(client_keys["deviantart"].last_delay <= 0) {
                client_keys["deviantart"].last_delay = 1000;
              }
            } else {

              // Slow decay to 0
              client_keys["deviantart"].last_delay -= 1000;
              if(client_keys["deviantart"].last_delay <= 0) {
                // Deactivate slow_down limit
                client_keys["deviantart"].last_delay = 0;
              }

            }

            // Normalize deviantart data before resolving promise
            var retval = JSON.parse(body);
            var new_body = {
              name: "deviantart",
              stop: !retval.has_more,
              results: filter.deviantart(retval.results)
            };

            resolve(new_body);
          });
        }, client_keys["deviantart"].last_delay);
      })
    );
  }

  /* ************* *
   * ************* *
   * **** e926 *** *
   * ************* *
   * ************* */
  if(sources["e926"]) {
    promises.push(
      new promise(function(resolve, reject) {
        request({
          url: "https://e926.net/post/index.json" +
               "?tags="       + req.body.tags    +
               "%20score:>40" +            // Force high score...
               "%20-friendship_is_magic" + // Substract ponies...
               "&page="       + String(page + 1) +
               "&limit="      + limit,
          method:   "GET"
        }, function(err, res, body) {
          // Normalize e621 data before resolving promise
          var retval = JSON.parse(body);
          var new_body = {
            name: "e926",
            stop: (retval.length === 0),
            results: filter.e926(retval)
          };

          resolve(new_body);
        });
      })
    );
  }

  /* ************** *
   * ************** *
   * **** Imgur *** *
   * ************** *
   * ************** */
    // Imgur intense rate limits...

    // If user limit has been reached
    if(client_keys["imgur"].user_remaining > 10) { // Just to be safe, stop at 10
      if(client_keys["imgur"].client_remaining > 100) {

        promises.push(
          new promise(function(resolve, reject) {
            setTimeout(function() {
              request({
                url: "https://api.imgur.com/3/gallery/search/" +
                     "?q=art+" +  req.body.tags.replace(/(%20|\ )/, "+") +
                     "&page="  + page,
                     // Imgur doesn't have limiting for some reason, just paging
                     //"&limit="  +  limit,
                method:   "GET",
                headers: { "Authorization": "Client-ID " + client_keys["imgur"].client_id }
              }, function(err, res, body) {
                client_keys["imgur"].user_limit       = res.headers["x-ratelimit-userlimit"];
                client_keys["imgur"].user_remaining   = res.headers["x-ratelimit-userremaining"];
                client_keys["imgur"].user_reset       = res.headers["x-ratelimit-userreset"];
                client_keys["imgur"].client_limit     = res.headers["x-ratelimit-clientlimit"];
                client_keys["imgur"].client_remaining = res.headers["x-ratelimit-clientremaining"];

                // Normalize imgur data before resolving promise
                var retval = JSON.parse(body);
                var new_body = {
                  name: "imgur",
                  stop: (retval.data.length === 0),
                  results: filter.imgur(retval.data)
                };

                resolve(new_body);
              });
            }, client_keys["imgur"].hard_delay);
          })
        );

      } else { promises.push(promise.reject([filter.template])); }
    } else { promises.push(promise.reject([filter.template])); }






    promise.all(promises).then(
      function success(res) {
        // Response format:
        // res is...
        // {   name: "deviantart",
        //     stop: false
        //  results: ...
        response.json(res);

      },
      function error(res) {
        console.log("Errors");
        response.json({"message": "error fetching for some reason"});
      }
    );

});

module.exports = router;
