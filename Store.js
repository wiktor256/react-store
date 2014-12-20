var extend = require('xtend/mutable');
var ArrayWeakMap = require('./lib/ArrayWeakMap');

var defaultRootComponent;
var defaultRootKey = {};
var componentPromises = new ArrayWeakMap();

var updateRootComponent = function(rootComponent) {
  var componentKey = rootComponent || defaultRootKey;

  if (!componentPromises.has(componentKey)) {
    var componentToUpdate = rootComponent || defaultRootComponent;

    if (componentToUpdate && componentToUpdate._lifeCycleState === 'MOUNTED') {
      componentToUpdate.forceUpdate();
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

          promise.then(function(result) {
            componentPromises.removeArrayItem(componentKey, promise);
            updateRootComponent(_this.rootComponent);
          });
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