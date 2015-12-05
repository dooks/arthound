var express = require("express");
var router = express.Router();
var request = require("request");
var https = require("https");

var client_keys = {
  "deviantart": {
    client_id: "4010",
    client_secret: "ca8edec4cdaa48fc6b64196de7394d66",
    access_token: null
  }
};

/* GET home page. */
router.get('/deviantart/token', function(req, response, next) {
  if(client_keys["deviantart"].access_token === null) {
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
        response.end(client_keys["deviantart"].access_token);
      });
    }())
  } else {
    console.log("Requested token", client_keys["deviantart"].access_token);
    response.end(client_keys["deviantart"].access_token);
  }
});

router.get('/deviantart/tag', function(req, response, next) {
  //var access_token = "991ff1e4d8af6c5cc565be570d49b7b22f8a912d7dd6bf03be";
  //var         tags = "blastoise";

  var access_token = req.query.access_token;

  // Limit tags to one word only
  var          tag = req.query.tags.replace(/%20.*$/, "");
  var       offset = req.query.offset;
  var        limit = req.query.limit;

  request({
    url: "https://www.deviantart.com/api/v1/oauth2/browse/tags" +
         "?tag="    +   tag  +
         "&offset=" + offset +
         "&limit="  +  limit,
    method:   "GET",
    headers: { "Authorization": "Bearer " + access_token }
  }, function(err, res, body) {
    response.end(body);
  });
});

module.exports = router;
