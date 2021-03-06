// Generated by CoffeeScript 1.9.0

/*!
 * @license fader
 * (c) sugarshin
 * License: MIT
 */

(function() {
  "use strict";
  var $, EventEmitter, Fader,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __hasProp = {}.hasOwnProperty;

  EventEmitter = require('events').EventEmitter;

  $ = global.jQuery;

  module.exports = Fader = (function(_super) {
    __extends(Fader, _super);

    Fader.prototype._defaults = {
      pager: null,
      prev: null,
      next: null,
      speed: 1000,
      autoPlay: false,
      autoPlaySpeed: 3000,
      start: 0
    };

    Fader.prototype._configure = function(el, opts) {
      this.$contents = $(el).children();
      this.opts = $.extend({}, this._defaults, opts);
      if (this.opts.prev != null) {
        this.$prev = $(this.opts.prev);
      }
      if (this.opts.next != null) {
        this.$next = $(this.opts.next);
      }
      if (this.opts.pager != null) {
        this.$pager = $(this.opts.pager);
      }
      return this._current = this.opts.start;
    };

    function Fader(_at_el, opts) {
      this.el = _at_el;
      EventEmitter.call(this);
      this._configure(this.el, opts);
      this.initialize();
      if ((this.opts.prev != null) || (this.opts.next != null) || (this.opts.pager != null)) {
        this.events();
      }
      if (this.opts.autoPlay) {
        this.play();
      }
    }

    Fader.prototype.setCurrent = function(num) {
      return this._current = num;
    };

    Fader.prototype.getCurrent = function() {
      return this._current;
    };

    Fader.prototype.initialize = function(num) {
      var current;
      if (num != null) {
        this.setCurrent(num);
      }
      current = this.getCurrent();
      this.$contents.hide().eq(current).show();
      if (this.opts.pager != null) {
        this.pagerSetCurrent(current);
      }
      return this;
    };

    Fader.prototype.hideAll = function() {
      return $.Deferred((function(_this) {
        return function(d) {
          var defers, el, i, _i, _len, _ref;
          defers = [];
          _ref = _this.$contents;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            el = _ref[i];
            defers.push($.Deferred(function(d) {
              return $(el).stop(true, true).fadeOut(_this.opts.speed, function() {
                return d.resolve();
              });
            }).promise());
          }
          return $.when(defers).done(function() {
            return d.resolve();
          });
        };
      })(this)).promise();
    };

    Fader.prototype.show = function(num) {
      this.$contents.eq(num).stop(true, true).fadeIn(this.opts.speed);
      this.setCurrent(num);
      return this;
    };

    Fader.prototype.change = function(num) {
      if (this.getCurrent() === num) {
        return this;
      }
      this.emit('change');
      this.hideAll().done((function(_this) {
        return function() {
          return _this.show(num);
        };
      })(this));
      if (this.opts.pager != null) {
        this.pagerSetCurrent(num);
      }
      return this;
    };

    Fader.prototype.pagerSetCurrent = function(target) {
      this.$pager.removeClass('slide-current').eq(target).addClass('slide-current');
      return this;
    };

    Fader.prototype.next = function() {
      var target;
      if (this.getCurrent() === this.$contents.length - 1) {
        target = 0;
      } else {
        target = this.getCurrent() + 1;
      }
      this.change(target);
      return this;
    };

    Fader.prototype.prev = function() {
      var target;
      if (this.getCurrent() === 0) {
        target = this.$contents.length - 1;
      } else {
        target = this.getCurrent() - 1;
      }
      this.change(target);
      return this;
    };

    Fader.prototype.play = function() {
      var _play;
      return (_play = (function(_this) {
        return function() {
          return setTimeout(function() {
            _this.next();
            return _play();
          }, _this.opts.autoPlaySpeed);
        };
      })(this))();
    };

    Fader.prototype.events = function() {
      this.$prev.on('click.slideprev', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.prev();
        };
      })(this));
      this.$next.on('click.slidenext', (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.next();
        };
      })(this));
      (function(_this) {
        return (function() {
          var that;
          that = _this;
          return _this.$pager.on('click.slidepager', function(ev) {
            var target;
            ev.preventDefault();
            target = that.$pager.index(this);
            return that.change(target);
          });
        });
      })(this)();
      return this;
    };

    return Fader;

  })(EventEmitter);

}).call(this);
