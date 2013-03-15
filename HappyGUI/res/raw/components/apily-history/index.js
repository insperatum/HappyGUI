/**
 * history
 * History component
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/**
 * Expose `History` singleton
 */

module.exports = history;

/**
 * Module dependencies
 */

var Emitter = require('emitter');

/**
 * singleton
 */

var singleton;

/**
 * history
 * Get the singleton
 */

function history () {
  if (!singleton) {
    singleton = new History();
  }
  return singleton;
}

/**
 * History
 * Create an history.
 *
 * @constructor
 */

function History() {
  if (!(this instanceof History)) {
    return new History();
  }
  Emitter.call(this);
  this.handlers = [];
  this.onchange = this.onchange.bind(this);
  this.started = false;
}

/**
 * Inherit from `Emitter`
 */

History.prototype = Object.create(Emitter.prototype);
History.prototype.constructor = History;

/**
 * route
 * Add a route to be tested when the hash changes. 
 * 
 * @param {String|RegExp} route route
 * @param {Function} callback callback
 * @return {History} this for chaining
 * @api public
 */

History.prototype.route = function (route, callback) {
  route = new RegExp(route);
  this.handlers.push({route: route, callback: callback});
};

/** 
 * bind
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.bind = function (route, handler, context) {
  if (typeof route === 'object') {
    return this.bind_all(route);
  }
  route = new RegExp(route);
  this.handlers.push({route: route, handler: handler, context: context});
  return this;
};

/** 
 * bind_all
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.bind_all = function (routes) {
  Object.keys(routes).forEach(function (route) {
    this.bind(route, routes[route]);
  }, this);
  return this;
};

/**
 * onchange
 * Load the url, if it's changed.
 * It's called by the browser.
 *
 * @param {Event} event event
 * @api private
 */

History.prototype.onchange = function (event) {
  var hash = '#';
  var new_hash = hash + event.newURL.split(hash)[1];
  var old_hash = hash + event.oldURL.split(hash)[1];
  var handlers = this.handlers;
  var n = handlers.length - 1;
  var i;
  var handler;
  var route;
  var callback;
  
  for (i = n; i >= 0; i -= 1) {
    handler = handlers[i];
    route = handler.route;
    callback = handler.callback;
    
    if (route.test(new_hash)) {
      callback(new_hash, old_hash);
      this.emit('change', new_hash, old_hash);
      return true;
    }
  }
  
  return false;
};

/**
 * start
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.start = function () {
  if (this.started) return;
  window.addEventListener('hashchange', this.onchange);
  this.started = true;
};

/**
 * stop
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.stop = function () {
  window.removeEventListener('hashchange', this.onchange);
  this.started = false;
};
