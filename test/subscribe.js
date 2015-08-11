var atom = require('../');
var test = require('tape');

var initialState = 0;
var genericAction = {a:1};
var returnTrue = function() { return true; };
var returnUndef = function() { return undefined; };
var returnProm = function() { return Promise.resolve(); };
var returnFunc = function() { return function(){}; };


test('subscribed listener should be called', function(t) {
  t.plan(1);
  
  var called = false;
  var store = atom(returnTrue, initialState);

  store.subscribe(function() {
    called = true;
  });
  
  store.dispatch(genericAction);

  t.ok(called);
});

test('subscribed listener should get updated state', function(t) {
  t.plan(1);
  
  var store = atom(returnTrue, initialState);

  store.subscribe(function() {
    t.notEqual(initialState, store.getState());
  });
  
  store.dispatch(genericAction);
});

test('subscribe should throw when listener not a function', function(t) {
  t.plan(1);

  var thrown = false;
  var store = atom(returnTrue, initialState);

  try {
    store.subscribe({});
  } catch (e) {
    thrown = true;
  }

  t.ok(thrown);
})