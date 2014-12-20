/*
  WeakMap where key (object) is mapped to an array.
  Removing last item from an array removes the key from the map.
 */


/*jshint -W079 */
var WeakMap = require('weak-map');

var ArrayWeakMap = function() {

  this._weakMap = new WeakMap();

  this.has = function(mapKey) {
    return this._weakMap.has(mapKey);
  };

  this.addArrayItem = function(mapKey, item) {
    if (this._weakMap.has(mapKey)) {
      this._weakMap.get(mapKey).push(item);
    }
    else {
      this._weakMap.set(mapKey, [item]);
    }
  };

  this.removeArrayItem = function(mapKey, item) {
    if (!this._weakMap.has(mapKey)) {
      return;
    }
    var array = this._weakMap.get(mapKey);
    var idx = array.indexOf(item);

    if (idx >= 0) {
      if (array.length == 1) {
        this._weakMap.delete(mapKey);
      }
      else {
        array.splice(idx, 1);
      }
    }
  };

};

module.exports = ArrayWeakMap;