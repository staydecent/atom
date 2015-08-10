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


// Usage

function counter(state, action) {
  switch (action.type) {
  case 'INCREMENT':
    return state + 1;
  case 'DECREMENT':
    return state - 1;
  case 'INCREMENT_ASYNC':
    return function(dispatch) {
      setTimeout(function() {
        dispatch({type: 'INCREMENT'});
      }, 1000);
    };
  default:
    return state;
  }
}

// Create a Redux store that holds the state of your app.
// Its API is { subscribe, dispatch, getState }.
var store = atom(counter, 0);

// You can subscribe to the updates manually, or use bindings to your view layer.
store.subscribe(function() {
  console.log(store.getState())
});

store.subscribe(function() {
  console.log('THING');
});

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
store.dispatch({ type: 'INCREMENT' }); // 1
store.dispatch({ type: 'INCREMENT' }); // 2
store.dispatch({ type: 'INCREMENT_ASYNC' }); // 3
store.dispatch({ type: 'DECREMENT' }); // 2
