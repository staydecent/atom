// Utils
function pathSet (paths, valToSet, object) {
  const copy = {...object}
  paths.reduce((obj, prop, idx) => {
    obj[prop] = obj[prop] || {}
    if (paths.length === (idx + 1)) {
      obj[prop] = valToSet
    }
    return obj[prop]
  }, copy)
  return copy
}

export default function atom (reducers, initialState) {
  if (reducers && initialState === undefined) {
    initialState = reducers
    reducers = []
  } else if (typeof reducers === 'function') {
    reducers = [reducers]
  }
  reducers.push(pathReducer)

  const len = reducers.length
  const listeners = []
  let state = initialState

  return {
    dispatch,
    subscribe,
    unsubscribe,
    getState
  }

  function dispatch (/* action[, action1, action2, ...] */) {
    const len = arguments.length
    let newState = getState()
    for (let x = 0; x < len; x++) {
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

  function unsubscribe (listener) {
    if (!listener) return
    const len = listeners.length
    if (len === 0) return
    for (let x = 0; x < len; x++) {
      if (listener === listeners[x]) {
        listeners.splice(x, 1)
      }
    }
  }

  function getState () {
    return typeof state === 'object'
      ? Object.hasOwnProperty('assign')
        ? Object.assign({}, state)
        : JSON.parse(JSON.stringify(state))
      : state
  }

  // Private

  function pathReducer (action, state) {
    const type = action.type
    const payload = action.payload
    switch (type) {
      case 'ATOM_SET':
        let {path, value} = payload
        return pathSet(path, value, state)

      // case 'ATOM_UPDATE':
      //   return atomUpdateReducer(payload, state)

      // case 'ATOM_REMOVE':
      //   return atomRemoveReducer(payload, state)

      default:
        return state
    }
  }

  function callReducers (fns, action, state) {
    let newState = state
    let ret
    for (let x = 0; x < len; x++) {
      ret = fns[x](action, newState)
      if (validState(ret)) {
        newState = ret
      }
    }
    return newState
  }

  function cb (newState) {
    state = newState
    for (let x = 0; x < listeners.length; x++) {
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
