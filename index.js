function atom(reducer, initialState) {
  var subscribers = [];
  var state = initialState;

  return {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: function() { return state; }
  };

  function dispatch(action) {
    var newState = reducer(state, action);

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

  function subscribe(subscriber) {
    if (typeof subscriber !== 'function') {
      throw new E('subscriber must be a function');
    }
    subscribers.push(subscriber);
  }

  function cb(newState) {
    state = newState;
    for (var x=0; x < subscribers.length; x++) {
      subscribers[x]();
    }
  }

  function E(message) {
    this.message = message;
    this.name = "AtomException";
    this.toString = function() {
      return this.name + ': ' + this.message;
    };
  };
}
