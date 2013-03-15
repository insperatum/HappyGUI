/**
 * Emitter
 * Event emitter component
 * 
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */

/**
 * Expose `Emitter`
 */
 
module.exports = Emitter;

/**
 * Utilities
 */

var array = [];
var slice = array.slice;

/**
 * @constructor Emitter
 */

function Emitter () {
  this._listeners = {};
}

/**
 * @method on
 * @description 
 *   Listen on the given `event` with `fn`.
 * 
 * @param {String} event event
 * @param {Function} callback callback
 * @param {Object} context context
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.on = function (event, callback, context) {
  var listeners 
    = this._listeners[event] 
    = this._listeners[event] || [];
   
  listeners.push({
    callback: callback,
    context: context
  });
  return this;
};

/**
 * @method off
 * @description
 *   Remove the given callback for `event` 
 *   or all registered callbacks.
 *
 * @param {String} event event
 * @param {Function} callback callback to remove
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.off = function (event, callback) {
  var listeners = this._listeners[event];
  var listener;
  var len;
  var i;
  
  if (!listener) {
   return this;
  }
  if (1 == arguments.length) {
    delete this._listeners[event];
    return this;
  }
  len = listeners.length;
  for (i = 0; i < len; i += 1) {
    listener = listeners[i];
    if (listener.callback === callback) {
      listeners.splice(i, 1);
      return this;
    }
  }

  return this;
};

/**
 * @method emit
 * @description
 *   Emit `event` with the given args.
 *
 * @param {String} event event
 * @param {Mixed} ...
 * @return {Emitter} this for chaining
 */

Emitter.prototype.emit = function (event) {
  var listeners = this._listeners[event];
  var listener;
  var len;
  var i;
  var args;

  if (!listeners) {
   return this;
  }
  args = slice.call(arguments, 1);
  len = listeners.length;
  for (i = 0; i < len; i += 1) {
    listener = listeners[i];
    listener.callback.apply(listener.context, args);
  }

  return this;
};

/**
 * @method listening
 * @description
 *   Check if this emitter has `event` handlers.
 * @param {String} event event
 * @return {Boolean} 
 *   `true` if this emitter has `event` handlers,
 *   `false` otherwise
 * @api public
 */

Emitter.prototype.listening = function (event) {
  var listeners = this._listeners[event];
  return !!(listeners && listeners.length);
};

/**
 * @method listen
 * @description
 *   Listen onother event emitter
 * @param {Emitter} emitter emitter to listen to
 * @param {Event} event event to listen to
 * @param {Function} callback callback
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.listen = function (emitter, event, callback) {
  emitter.on(event, callback, this);
  return this;
};

/**
 * @method unlisten
 * @description
 *   Unlisten onother event emitter
 * @param {Emitter} emitter emitter to listen to
 * @param {Event} event event to listen to
 * @param {Function} cb callback
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.unlisten = function (emitter, event, callback) {
  emitter.off(event, callback);
  return this;
};
