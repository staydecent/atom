/* globals define */
(function (root, factory) {
  'use strict'
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.atom = factory()
  }
}(this, function () {
  'use strict'

  return function (reducers, initialState) {
    if (typeof reducers === 'function') {
      reducers = [reducers]
    }
    var len = reducers.length
    var listeners = []
    var state = initialState

    return {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState
    }

    function dispatch (/* action[, action1, action2, ...] */) {
      var len = arguments.length
      var newState = getState()
      for (var x = 0; x < len; x++) {
        newState = callReducers(reducers, arguments[x], newState)
      }
      if (validState(newState)) {
        cb(newState)
      }
    }

    function subscribe (listener) {
      if (typeof listener !== 'function') {
        throw new E('listener must be a function')
      }
      listeners.push(listener)
    }

    function getState () {
      return typeof state === 'object'
        ? Object.hasOwnProperty('assign')
          ? Object.assign({}, state)
          : JSON.parse(JSON.stringify(state))
        : state
    }

    // Private

    function callReducers (fns, action, state) {
      var newState = state
      var ret
      for (var x = 0; x < len; x++) {
        ret = fns[x](action, newState)
        if (validState(ret)) {
          newState = ret
        }
      }
      return newState
    }

    function cb (newState) {
      state = newState
      for (var x = 0; x < listeners.length; x++) {
        listeners[x]()
      }
    }

    function validState (newState) {
      if (newState === undefined) {
        throw new E('Reducer must return a value.')
      } else if (typeof newState.then === 'function') {
        throw new E('Reducer cannot return a Promise.')
      } else if (typeof newState === 'function') {
        newState(dispatch)
      } else {
        return true
      }
    }

    function E (message) {
      this.message = message
      this.name = 'AtomException'
      this.toString = function () {
        return this.name + ': ' + this.message
      }
    }
  }
}))
