(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(_dereq_,module,exports){
(function (global){

/*!
 * @license fader
 * (c) sugarshin
 * License: MIT
 */
"use strict";
var $, EventEmitter, Fader,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty;

EventEmitter = _dereq_('events').EventEmitter;

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



}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":1}]},{},[2])(2)
});
