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
    var listeners = []
    var state = initialState

    return {
      addReducer: addReducer,
      dispatch: dispatch,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      getState: getState,
      setState: setState
    }

    function addReducer (reducer) {
      if (typeof reducer !== 'function') {
        throw new E('reducer must be a function')
      }
      reducers.push(reducer)
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
      return function () { unsubscribe(listener) }
    }

    function unsubscribe (listener) {
      if (!listener) return
      const idx = listeners.findIndex(l => l === listener)
      idx > -1 && listeners.splice(idx, 1)
    }

    function getState () {
      return typeof state === 'object'
        ? Object.hasOwnProperty('assign')
          ? Object.assign({}, state)
          : JSON.parse(JSON.stringify(state))
        : state
    }

    function setState (newState) {
      if (!validState(newState)) return
      state = newState
      cb(newState)
    }

    // Private

    function callReducers (fns, action, state) {
      var newState = state
      var len = reducers.length
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
