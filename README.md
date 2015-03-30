
# React Store

A simple pattern for unidirectional data flow in React applications.

## Overview

The goal of the React Store is to simplify the data flow in ReactJS applications. The following diagram depicts the pattern used by the React Store.


```
╔══════════════╗
║ App ┌──────┐ ║   getData()  ╔═════════╗  HTTP GET
║     │ View ├─╫─────────────>║  Store  ╟──────────>
║     └──────┘ ║              ╚════╤════╝
╚══════════════╝<─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                    forceUpdate()
```

The main premise of the React Store is that stores refresh entire application after receiving data from a server. The forced refresh causes that views call stores again to get the data. But this time stores actually have the data ready for the views.

This approach makes the code in a view very easy to follow.

```javascript
render: function() {
  var data = MyStore.getData(); // synchronous call; we get nothing the first time
  if (data) {
    return <div>{ data }</div>;
  }
  else {
   return <div>Loading...</div>;
  }
}
```

Note:
The flow described above is a generalization of the pattern. The actual implementation provides following optimizations:
- waiting for completion of all pending HTTP requests before refreshing an application
- preventing duplicate HTTP requests
- allowing a store to refresh a child component instead of an entire application

## Installation

You can install the React Store as a npm package

    npm install react-store


## Sample Usage

ToDoStore.js

```javascript
var Store = require('react-store');
var $ = require('jquery');

// To prevent parallel ajax requests to the same URL
var _pendingRequests = {};

var ToDoStore = Store.extend({
  getToDos: function() {
    if (this.toDos) {
      // we already have the data
      return this.toDos;
    }

    this.httpGet({
        url: 'todos.json',
        cache: false
      }, function(result) {
        this.toDos = result.body;
      }.bind(this)
    );
  },

  httpGet: function(options, callback) {
    if (!options.url || _pendingRequests[options.url]) {
      return;
    }

    _pendingRequests[options.url] = true;

    var promise = $.ajax(options)
      .done(function(data) {
        callback(data);
      })
      .fail(function() {
        callback({
          error: 'Error occured'
        });
      })
      .always(function() {
        delete _pendingRequests[options.url];
      });

    this.updateRootComponent(promise);
  },
});

module.exports = ToDoStore;
```

ToDoList.jsx

```javascript
var React = require('react');
var ToDoStore = require('./ToDoStore');

var ToDoList = React.createClass({
  render: function() {
    var toDos = ToDoStore.getToDos();
    return (<div>{ this.renderToDos(toDos) }</div>);
  },
  renderToDos: function(toDos) {
    if (toDos) {
      if (toDos.length) {
        return (
          toDos.map(function(toDo) {
            return (<div key={toDo.id}>{ toDo.description }</div>);
          })
        );
      }
      else if (toDos.error) {
        return (<div>{toDos.error}</div>);
      }
      else {
        return (<div>Nothing to do?</div>);
      }
    }
    else {
      return (<div className="overlay">Loading...</div>);
    }
  }
});

module.exports = ToDoList;
```

App.jsx

```javascript
var React = require('react');
var Store = require('react-store');
var ToDoList = require('./ToDoList.jsx');

var App = React.createClass({
  componentDidMount: function() {
    // The Store will call forceUpdate() on the root component
    Store.init({
      rootComponent: this
    });
  },
  render: function() {
    return (<ToDoList/>);
  }
});

module.exports = App;
```

## Dependencies

React Store uses [weak-map](https://github.com/drses/weak-map) shim, and [xtend](https://github.com/Raynos/xtend).

## Private Stores

If a store doesn't need to be shared by an entire application, it can be initialized with a rootComponent set to a specific view component. Only that component will be refreshed.

```javascript
var MyStoreDefinition = {
  getData: function() {
    ...
  }
};
...
componentDidMount: function() {
  this.MyStore = Store.extend(MyStoreDefinition, {
    rootComponent: this
  });
}
```

The drawback of this approach is that the reference to the private store needs to be passed to children components in some way, for example as props or as a [context](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html).

## Dependent Stores

The dependencies between stores are easy to implement using React Store.

StoreB.js (depends on StoreA)

```javascript
var Store = require('react-store');
var StoreA = require('./StoreA');

// Store B returns a count of elements from Store A
var StoreB = Store.extend({
  getCountOfA: function() {
    var listOfA = StoreA.getListOfA();
    return (listOfA ? listOfA.length : undefined);
  }
});
module.exports = StoreB;
```

Explanation: 
Whenever Store A changes, it will trigger refresh of the entire application. This will cause a view to call Store B, which in turn will get the latest data from Store A.

## Store Methods

### Store.init

This method should be called only by the root component of the application. It must set the application root component.

```javascript
var Store = require('react-store');
...
var App = React.createClass({
  ...
  componentDidMount: function() {
    Store.init({
      rootComponent: this
    });
  }
});
```

### Store.updateRootComponent

This method should be called by a store whenever a store has a change that requires a refresh of the application. The only parameter to this method is a promise. Most of the time, the promise is for a remote request.

```javascript
var MyStore = Store.extend({
  updateSelectedUser: function(user) {
    var promise = $.post('/url', user)
      .done(function(data) {
        this.selectedUser = data;
      });
    // When the promise is resolved the application will be refreshed
    this.updateRootComponent(promise);
  },
  setSelectedUser: function(selectedUser) {
    this.selectedUser = selectedUser;
    // promise is not required in this case; application will be
    // updated immediately unless there are pending HTTP requests
    this.updateRootComponent();
  }
});
```





















