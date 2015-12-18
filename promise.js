var request = require("request");
var Promise = require("promise");

module.exports.reqPromise = function(options, delay) {
  // Returns a promise for an HTTP request
  //   @options: as specified for a "request" option
  //   @delay: Milliseconds when to fire request
  var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      request(options, function(err, res, body) {
        if(!err && res.statusCode == 200) {
          // If response was successful
          resolve({ error: err, response: res, body: body});
        } else {
          reject({ error: err, response: res, body: body});
        }
      });
    }, delay);
  });

  return promise;
}
