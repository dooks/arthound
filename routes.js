var express = require("express");
var router  = express.Router();
var request = require("request");
var Promise = require("promise");

var Promise_ext = require("./promise.js");
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

  console.log("Page:", page, "Limit: ", req.body.limit,
              "Sources:", req.body.sources, "Tags:", req.body.tags);

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
      Promise_ext.reqPromise({
        url: "https://www.deviantart.com/api/v1/oauth2/browse/tags" +
             // Limit DA search query to one word...
             "?tag="    +  req.body.tags.replace(/(%20|\ ).*$/, "") +
             "&offset=" +  page*limit +
             "&limit="  +  limit,
        method:   "GET",
        headers: { "Authorization": "Bearer " + client_keys["deviantart"].access_token }
      }, client_keys["deviantart"].last_delay)
      .then(
        function success(ret) {
          var err = ret.error;
          var res = ret.response;
          var body = ret.body;

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

          // Normalize deviantart data before resolving Promise
          var retval = JSON.parse(body);
          var new_body = {
            name: "deviantart",
            stop: !retval.has_more,
            results: filter.deviantart(retval.results)
          };

          return new_body;
      },
      function error(ret) {
        return { name: "deviantart", stop: true, error: ret.response.statusCode, data: []}
      }
      ) // end promise then
    ); // end array push
  }

  /* ************* *
   * ************* *
   * **** e926 *** *
   * ************* *
   * ************* */
  if(sources["e926"]) {
    promises.push(
      Promise_ext.reqPromise({
        url: "https://e926.net/post/index.json" +
             "?tags="       + req.body.tags    +
             "%20score:>40" +                    // Force high score...
             "%20-friendship_is_magic" +         // Substract ponies...
             "&page="       + String(page + 1) + // e926 paging starts at 1
             "&limit="      + limit,
        method:   "GET"
      }).then(
        function success(ret) {
        var err = ret.error;
        var res = ret.response;
        var body = ret.body;

        // Normalize e621 data before resolving Promise
        var retval = JSON.parse(body);
        var new_body = {
          name: "e926",
          stop: (retval.length === 0),
          results: filter.e926(retval)
        };

        return new_body;
        },
        function error(ret) {
          return ret.error;
        }
      )
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
          Promise_ext.reqPromise({
              url: "https://api.imgur.com/3/gallery/search/" +
                   "?q=art+" +  req.body.tags.replace(/(%20|\ )/, "+") +
                   "&page="  + page,
                   // Imgur doesn't have limiting for some reason, just paging
                   //"&limit="  +  limit,
              method:   "GET",
              headers: { "Authorization": "Client-ID " + client_keys["imgur"].client_id }
          }, client_keys["imgur"].hard_delay).then(
            function success(ret) {
              var err = ret.error;
              var res = ret.response;
              var body = ret.body;

              client_keys["imgur"].user_limit       = res.headers["x-ratelimit-userlimit"];
              client_keys["imgur"].user_remaining   = res.headers["x-ratelimit-userremaining"];
              client_keys["imgur"].user_reset       = res.headers["x-ratelimit-userreset"];
              client_keys["imgur"].client_limit     = res.headers["x-ratelimit-clientlimit"];
              client_keys["imgur"].client_remaining = res.headers["x-ratelimit-clientremaining"];

              // Normalize imgur data before resolving Promise
              var retval = JSON.parse(body);
              var new_body = {
                name: "imgur",
                stop: (retval.data.length === 0),
                results: filter.imgur(retval.data)
              };

              return new_body;
            }
          )
        );

      } else { promises.push(Promise.reject([filter.template])); }
    } else { promises.push(Promise.reject([filter.template])); }






    Promise.all(promises).then(
      function success(res) {
        // Response format:
        // res is...
        // {   name: "deviantart",
        //     stop: false
        //  results: ... }
        response.json(res);

      },
      function error(res) {
        console.log("Errors");
        console.log(res);
        response.json({"message": "error fetching for some reason"});
      }
    );

});

module.exports = router;
