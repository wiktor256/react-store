var extend = require('xtend/mutable');
var ArrayWeakMap = require('./lib/ArrayWeakMap');

var defaultRootComponent;
var defaultRootKey = {};
var componentPromises = new ArrayWeakMap();

var updateRootComponent = function(rootComponent) {
  var componentKey = rootComponent || defaultRootKey;

  if (!componentPromises.has(componentKey)) {
    var componentToUpdate = rootComponent || defaultRootComponent;

    if (componentToUpdate) {
      this.setTimeout(function() {
        if (componentToUpdate.isMounted()) {
          componentToUpdate.forceUpdate();
        }
      }, 0);
    }
  }
};

module.exports = {

  extend: function() {

    var Store = function() {
      this.updateRootComponent = function(promise) {
        if (promise) {
          var componentKey = this.rootComponent || defaultRootKey;
          componentPromises.addArrayItem(componentKey, promise);
          var _this = this;

          var onResolveOrReject = function() {
            componentPromises.removeArrayItem(componentKey, promise);
            updateRootComponent(_this.rootComponent);
          };

          promise.then(onResolveOrReject, onResolveOrReject);
        }
        else {
          updateRootComponent(this.rootComponent);
        }
      };
    };

    // prepend Store to arguments
    Array.prototype.unshift.call(arguments, Store.prototype);
    extend.apply(null, arguments);

    var store = new Store();

    return store;
  },

  init: function(options) {
    defaultRootComponent = options.rootComponent;
  }

};