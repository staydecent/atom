'use strict'

var atom = require('../bundle.js')
var test = require('tape')

test('set should set value on state', function (t) {
  t.plan(1)

  var store = atom({})
  store.dispatch(store.set('a', 2))

  t.equal(2, store.getState().a)
})

test('set should override value on state', function (t) {
  t.plan(1)

  var store = atom({a: 1})
  store.dispatch(store.set('a', 2))

  t.equal(2, store.getState().a)
})

test('update should override value on state', function (t) {
  t.plan(1)

  var store = atom({})

  store.dispatch(store.set('items', [
    {id: 1, title: 'cool'},
    {id: 2, title: 'neat'},
    {id: 3, title: 'rad'}
  ]))

  store.dispatch(store.update(['items', 0, 'title'], 'bunk'))

  t.equal('bunk', store.getState().items[0].title)
})

test('update should append value on array', function (t) {
  t.plan(1)

  var store = atom({})

  store.dispatch(store.set('items', [
    {id: 1, title: 'cool'},
    {id: 2, title: 'neat'},
    {id: 3, title: 'rad'}
  ]))

  store.dispatch(store.update('items', [{id: 4, title: 'appended!'}]))

  t.equal('appended!', store.getState().items[3].title)
})

test('update should merge value on existing object', function (t) {
  t.plan(2)

  var store = atom({user: {name: 'Adrian'}})

  store.dispatch(store.update('user', {age: 29}))

  t.equal(29, store.getState().user.age)
  t.equal('Adrian', store.getState().user.name)
})

test('remove should remove value from array', function (t) {
  t.plan(2)

  var store = atom({items: [1, 2, 3, 4, 5]})

  store.dispatch(store.remove(['items', 1]))

  var state = store.getState()

  t.equal(4, state.items.length)
  t.equal(3, state.items[1])
})

test('remove should remove key from object', function (t) {
  t.plan(2)

  var store = atom({user: {name: 'Adrian', age: 29}})

  store.dispatch(store.remove(['user', 'age']))

  var state = store.getState()

  t.deepEqual(['name'], Object.keys(state.user))
  t.equal(undefined, state.user.age)
})
