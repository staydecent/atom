import check from 'check-arg-types'

const toType = check.prototype.toType

// Default reducer
function pathReducer (action, state) {
  const type = action.type
  if (!type ||
    ['ATOM_SET', 'ATOM_UPDATE', 'ATOM_REMOVE'].indexOf(type) === -1) {
    return state
  }
  const payload = action.payload
  let {path} = payload

  if (toType(path) === 'string') {
    path = [path]
  }

  switch (type) {
    case 'ATOM_SET':
      return pathSet(path, payload.value, state)

    case 'ATOM_UPDATE':
      let {value} = payload
      const currentValue = pathGet(path, state)
      const newType = toType(value)

      if (newType === toType(currentValue)) {
        if (newType === 'array') {
          return pathSet(path, currentValue.concat(value), state)
        } else if (newType === 'object') {
          return pathSet(path, merge(currentValue, value), state)
        }
      }
      return pathSet(path, value, state)

    case 'ATOM_REMOVE':
      const parent = pathGet(path.slice(0, -1), state)
      const parentType = toType(parent)
      if (parentType === 'object') {
        return pathSet(
          path.slice(0, -1),
          without(path.slice(-1), parent),
          state
        )
      } else if (parentType === 'array') {
        const idx = last(path)
        if (toType(idx) === 'number') {
          parent.splice(idx, 1)
          return pathSet(path.slice(0, -1), parent, state)
        }
      }
      return pathSet(path, undefined, state)

    default:
      return state
  }
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
  const cache = {}
  let state = initialState

  return {
    dispatch,
    subscribe,
    unsubscribe,
    getState,
    set,
    update,
    remove
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

  function subscribe (path, listener) {
    if (arguments.length === 1) {
      listener = path
      if (typeof listener !== 'function') {
        throw new E('listener must be a function')
      }
      listeners.push(listener)
    } else if (arguments.length === 2) {
      watchPath(path, listener)
    }
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
    return toType(state) === 'object'
      ? merge({}, state)
      : state
  }

  function set (path, value) {
    return {type: 'ATOM_SET', payload: {path, value}}
  }

  function update (path, value) {
    return {type: 'ATOM_UPDATE', payload: {path, value}}
  }

  function remove (path) {
    return {type: 'ATOM_REMOVE', payload: {path}}
  }

  // Private

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

  function watchPath (path, cb) {
    const key = path.join(',')
    const getPathVal = pathGet(path)
    const diff = () => {
      const newVal = getPathVal(getState())
      if (newVal === undefined) {
        return
      }
      const oldVal = cache[key]
      if (oldVal === undefined || oldVal !== newVal) {
        if (toType(newVal) === 'object') {
          cache[key] = merge({}, newVal)
        } else {
          cache[key] = newVal
        }
        cb(newVal, oldVal)
      }
    }

    // Let's invoke diff right away as we may want to react to
    // our initialState set in our store.
    diff()
    subscribe(diff)
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

// Util

function merge () {
  if (!arguments || !arguments.length) {
    return
  }
  let result = {}
  for (let x = 0; x < arguments.length; x++) {
    if (toType(arguments[x]) !== 'object') {
      throw new TypeError('All arguments must be objects')
    }
    result = {
      ...result,
      ...arguments[x]
    }
  }
  return result
}

function pathGet (paths, obj) {
  check(arguments, ['array', ['array', 'object']])
  let val = obj
  for (let x = 0; x < paths.length; x++) {
    if (val == null) {
      return
    }
    val = val[paths[x]]
  }
  return val
}

function pathSet (paths, valToSet, object) {
  check(arguments, ['array', '-any', 'object'])
  const copy = merge({}, object)
  paths.reduce(function (obj, prop, idx) {
    obj[prop] = obj[prop] || {}
    if (paths.length === (idx + 1)) {
      obj[prop] = valToSet
    }
    return obj[prop]
  }, copy)
  return copy
}

function pick (keys, obj) {
  check(arguments, ['array', 'object'])
  const result = {}
  for (let x = 0; x < keys.length; x++) {
    let k = keys[x]
    if (obj[k]) {
      result[k] = obj[k]
    }
  }
  return result
}

function without (keys, obj) {
  const keep = Object.keys(obj).filter((k) => keys.indexOf(k) === -1)
  return pick(keep, obj)
}

function last (ls) {
  check([arguments[0]], ['array'])
  const n = ls.length ? ls.length - 1 : 0
  return ls[n]
}
