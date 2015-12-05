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

router.get('/deviantart', function(req, response, next) {
  // Limit tags to one word only
  req.params.tags = req.query.tags || "art";
  var    tag = req.query.tags.replace(/%20.*$/, "");
  var offset = req.query.offset || 0;
  var  limit = req.query.limit || 24;

  request({
    url: "https://www.deviantart.com/api/v1/oauth2/browse/tags" +
         "?tag="    +   tag  +
         "&offset=" + offset +
         "&limit="  +  limit,
    method:   "GET",
    headers: { "Authorization": "Bearer " + client_keys["deviantart"].access_token }
  }, function(err, res, body) {
    // Normalize deviantart data
    var retval = JSON.parse(body);
    var new_body = retval.results || [];

    for(var i = 0; i < new_body.length; i++) {
      delete new_body[i].$$hashKey;
      delete new_body[i].allows_comments;
      delete new_body[i].category_path;
      delete new_body[i].deviationid;
      delete new_body[i].download_filesize;
      delete new_body[i].is_deleted;
      delete new_body[i].is_downloadable;
      delete new_body[i].is_favourited;
      delete new_body[i].is_mature;
      delete new_body[i].printid;

      new_body[i].category       = new_body[i].category        || "";
      new_body[i].title          = new_body[i].title           || "";
      new_body[i].url            = new_body[i].url             || "";
      new_body[i].published_time = new_body[i].published_time  || 0;

      // Normalize
      new_body[i].author    = new_body[i].author  || {};
      new_body[i].content   = new_body[i].content || {};
      new_body[i].comments  = new_body[i].stats   || {};
      new_body[i].preview   = new_body[i].preview || {};

      // Flatten
      new_body[i].author    = new_body[i].author.username || "";
      new_body[i].content   = new_body[i].content.src     || "";
      new_body[i].width     = new_body[i].content.width   ||  0;
      new_body[i].height    = new_body[i].content.height  ||  0;
      new_body[i].comments  = new_body[i].stats.comments  ||  0;
      new_body[i].favorites = new_body[i].stats.favorites ||  0;
      new_body[i].preview   = new_body[i].preview.src     || null;
      if(new_body[i].thumbs[2] !== undefined) {
        new_body[i].thumbs = new_body[i].thumbs[2].src || "";
      } else { new_body[i].thumbs = ""; }
    }

    response.end(JSON.stringify(retval));
  });
});

module.exports = router;
