# atom

[![Build Status](https://travis-ci.org/staydecent/atom.svg?branch=master)](https://travis-ci.org/staydecent/atom) [![bitHound Score](https://www.bithound.io/github/staydecent/atom/badges/score.svg)](https://www.bithound.io/github/staydecent/atom)

Shared, synchronous, independent state for javascript apps.

Basically re-implemented the [Redux](http://gaearon.github.io/redux/) API
without ES6 syntax and some of the top-level API exports.

## Concepts

1. You're application state is hidden within the `atom` function. It cannot be
   mutated outside of the atom function.
2. To affect your state, you need to `dispatch` an "action".
3. An "action" can be just a string, or an object or any value you want.
4. You define a single "reducer" function that accepts the current state and action and returns a new state.
5. You can `subscribe` any # of "listeners" that are called after your reducer returns a new state.

## Example

```javascript
function counter(action, state) {
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

var store = atom(counter, 0);

store.subscribe(function() {
  console.log(store.getState())
});

store.dispatch({ type: 'INCREMENT' }); // 1
store.dispatch({ type: 'INCREMENT' }); // 2
store.dispatch({ type: 'DECREMENT' }); // 1
store.dispatch({ type: 'INCREMENT_ASYNC' }); // 2
```

### With React (or Preact, or similar)

```javascript
class Main extends Component {
  constructor () {
    super()
    // Copy your entire atom state to this Main component.
    this.state = store.getState()
  }

  componentDidMount () {
    // Sync your atom state with this component's state
    store.subscribe(() => this.setState(store.getState()))
  }

  render (_, state) {
    // Pass the state object down to your child components as props
    return (
      <Child {...state}></Child>
    )
  }
}
```

That's it! And within your child components you can call `store.dispatch` to update the atom state and have it sync to the `Main` component which will then pass the updated state object down to all of your child components!

### See also
[Simple Routing Example](https://github.com/staydecent/atom-routing-example)

## API

### atom(reducer[, initialState])

Creates your atom "store" that contains your application state. Returns an Object with methods for interacting with your state.

#### reducer(action, state)

A function that accepts `function(action, state)` and returns the potentially modified `state`. You can also return a function with the signature `function(dispatch)` for performing asynchronous tasks before modifying the state. When your async task completes, the passed in `dispatch` function can be called with an "action" that results your reducer returning a new state. The param order is the opposite of Redux to accomodate currying.

### Store API

#### dispatch(action)

This calls your "reducer" with the given "action" and the current state.

#### subscribe(listener)

Add a function to be called anytime after your "reducer" has returned a new state. This is useful for logging changes or syncing to your storage or database.

You can add as many listeners as you would like.

#### getState()

Returns the current state. Useful for calling within a `subscribe`d listener.
