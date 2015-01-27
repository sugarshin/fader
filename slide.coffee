$ = require 'jquery'
inherits = require 'inherits'
EventEmitter2 = require('eventemitter2').EventEmitter2

class Slide
  "use strict"

  inherits @, EventEmitter2

  _defaults:
    contents: '.js-slide-contents'
    pager: '.js-slide-pager'
    prev: '.js-slide-prev'
    next: '.js-slide-next'
    start: 0

  constructor: (opts) ->
    EventEmitter2.call @
    @opts = $.extend {}, @_defaults, opts
    @$contents = $(@opts.contents)
    @$prev = $(@opts.prev)
    @$next = $(@opts.next)
    @$pager = $(@opts.pager)

    @_current = @opts.start

    @events()

  setCurrent: (num) -> @_current = num
  getCurrent: -> return @_current

  init: (num) ->
    if num? then @setCurrent num
    @$contents
      .hide()
      .eq @getCurrent()
      .show()
    @pagerSetCurrent @getCurrent()
    return this

  hideAll: ->
    return $.Deferred((d) =>
      defers = []
      for i in @$contents
        defer = $.Deferred()
        defers.push defer.promise()
        @$contents[i]
          .stop true, true
          .fadeOut -> defer.resolve()

      $.when.apply($, defers).done -> d.resolve()
    ).promise()

  show: (num) ->
    @$contents
      .eq num
      .stop true, true
      .fadeIn 300

    @setCurrent num
    return this

  change: (num) ->
    if @getCurrent() is num then return this
    @emit 'change'
    @hideAll().done => @show num
    @pagerSetCurrent num
    return this

  pagerSetCurrent: (target) ->
    @$pager
      .removeClass 'slide-current'
      .eq target
      .addClass 'slide-current'
    return this

  events: ->
    @$prev.on 'click.slideprev', (ev) =>
      ev.preventDefault()
      if @getCurrent() is 0
        target = @$contents.length - 1
      else
        target = @getCurrent() - 1
      @change target

    @$next.on 'click.slidenext', (ev) =>
      ev.preventDefault()
      if @getCurrent() is @$contents.length - 1
        target = 0
      else
        target = @getCurrent() + 1
      @change target

    do =>
      that = @
      @$pager.on 'click.slidepager', (ev) ->
        ev.preventDefault()
        target = that.$pager.index @
        that.change target

    return this

if typeof define is 'function' and define.amd
  define -> Slide
else if typeof module isnt 'undefined' and module.exports
  module.exports = Slide
else
  window.Slide or= Slide
