
var request = require('superagent');
var Q = require('q');

var StoreHttpGetMixin = {

  // prevents duplicate HTTP calls
  _deferredRequests: {},

  /*
    Wraps a promise around the superagent GET request.
   */
  httpGet: function(url, callback) {

    if (!url || this._deferredRequests[url]) {
      return;
    }

    var deferredRequest = Q.defer();
    this._deferredRequests[url] = deferredRequest;
    this.updateRootComponent(deferredRequest.promise);

    var _this = this;

    request
      .get(url)
      .query({ time: new Date().getTime() })
      .set('Accept', 'application/json')
      .end(function(result) {

        if (callback) {
          callback(result);
        }

        delete _this._deferredRequests[url];
        deferredRequest.resolve(result);
      });
  }
};

module.exports = StoreHttpGetMixin;