{ jsdom } = require 'jsdom'
global.document = jsdom '<html><body></body></html>'
global.window = document.defaultView
global.navigator = window.navigator

assert = require 'power-assert'

$ = require 'jquery'
Fader = require '../src/fader.coffee'

# .test()
describe '.test()', ->
  it 'test', ->
    assert true
