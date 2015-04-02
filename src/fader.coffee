###!
 * @license fader
 * (c) sugarshin
 * License: MIT
###

"use strict"

{ EventEmitter } = require 'events'
$ = global.jQuery

module.exports =
class Fader extends EventEmitter

  _defaults:
    pager: null
    prev: null
    next: null
    speed: 1000
    autoPlay: false
    autoPlaySpeed: 3000
    start: 0

  _configure: (el, opts) ->
    @$contents = $(el).children()
    @opts = $.extend {}, @_defaults, opts
    @$prev = $(@opts.prev) if @opts.prev?
    @$next = $(@opts.next) if @opts.next?
    @$pager = $(@opts.pager) if @opts.pager?
    @_current = @opts.start

  constructor: (@el, opts) ->
    EventEmitter.call @
    @_configure @el, opts
    @initialize()
    @events() if @opts.prev? or @opts.next? or @opts.pager?
    if @opts.autoPlay then @play()

  setCurrent: (num) -> @_current = num
  getCurrent: -> @_current

  initialize: (num) ->
    if num? then @setCurrent num
    current = @getCurrent()
    @$contents
      .hide()
      .eq current
      .show()
    @pagerSetCurrent current if @opts.pager?
    return this

  hideAll: ->
    return $.Deferred((d) =>
      defers = []
      for el, i in @$contents
        defers.push $.Deferred((d) =>
          $(el)
            .stop true, true
            .fadeOut @opts.speed, -> d.resolve()
        ).promise()
      $.when(defers).done -> d.resolve()
    ).promise()

  show: (num) ->
    @$contents
      .eq num
      .stop true, true
      .fadeIn @opts.speed
    @setCurrent num
    return this

  change: (num) ->
    if @getCurrent() is num then return this
    @emit 'change'
    @hideAll().done => @show num
    @pagerSetCurrent num if @opts.pager?
    return this

  pagerSetCurrent: (target) ->
    @$pager
      .removeClass 'slide-current'
      .eq target
      .addClass 'slide-current'
    return this

  next: ->
    if @getCurrent() is @$contents.length - 1
      target = 0
    else
      target = @getCurrent() + 1
    @change target
    return this

  prev: ->
    if @getCurrent() is 0
      target = @$contents.length - 1
    else
      target = @getCurrent() - 1
    @change target
    return this

  play: ->
    do _play = =>
      setTimeout =>
        @next()
        _play()
      , @opts.autoPlaySpeed

  events: ->
    @$prev.on 'click.slideprev', (ev) =>
      ev.preventDefault()
      @prev()

    @$next.on 'click.slidenext', (ev) =>
      ev.preventDefault()
      @next()

    do =>
      that = @
      @$pager.on 'click.slidepager', (ev) ->
        ev.preventDefault()
        target = that.$pager.index this
        that.change target
    return this
