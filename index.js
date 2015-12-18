/* globals define */
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.atom = factory();
  }
}(this, function() {
  'use strict';

  return function(reducer, initialState) {
    var listeners = [];
    var state = initialState;

    return {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState
    };

    function dispatch(action) {
      var newState = reducer(action, state);

      if (newState === undefined) {
        throw new E('Reducer must return a value.');
      } else if (typeof newState.then === 'function') {
        throw new E('Reducer cannot return a Promise.');
      } else if (typeof newState === 'function') {
        newState(dispatch);
      } else {
        cb(newState);
      }
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new E('listener must be a function');
      }
      listeners.push(listener);
    }

    function getState() {
      return state;
    }

    function cb(newState) {
      state = newState;
      for (var x=0; x < listeners.length; x++) {
        listeners[x]();
      }
    }

    function E(message) {
      this.message = message;
      this.name = "AtomException";
      this.toString = function() {
        return this.name + ': ' + this.message;
      };
    }
  };
}));