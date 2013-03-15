

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("apily-emitter/index.js", function(exports, require, module){
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

});
require.register("apily-router/index.js", function(exports, require, module){
/*
 * router
 * Router component
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/*
 * Expose `Router`
 */

module.exports = Router;

/*
 * Module dependencies
 */

var Emitter = require('emitter');
var history = require('history');

/**
 * Variables
 * Cached regular expressions for matching 
 * named param parts and splatted parts of route strings.
 */

var named_param = /:\w+/g;
var splat_param = /\*\w+/g;
var escape_regexp = /[-[\]{}()+?.,\\^$|#\s]/g;

/*
 * Router
 * Create a router.
 *
 * @api public
 */

function Router() {
  if (!(this instanceof Router)) {
    return new Router();
  }
  Emitter.call(this);
  this.history = history();
}

/*
 * Inherit from `Emitter`
 */

Router.prototype = Object.create(Emitter.prototype);
Router.prototype.constructor = Router;

/**
 *  route
 *  add a route
 * 
 * @param {String} route route name
 * @param {Function} callback callback
 * @return {Route} this for chaining
 * @api public
 */

Router.prototype.route = function (route, callback) {
  var self = this;
  var history = this.history;
  var regexp = this.route_to_regexp(route);
  
  function onroute (fragment) {
    var params = self.extract_params(regexp, fragment);
    callback.apply(self, params);
  }
  
  history.route(regexp, onroute);
  return this;
};

/**
 * route_to_regexp
 * Convert a route string into a regular expression, 
 * suitable for matching against the current location hash.
 * 
 * @param {String} route route
 * @return {RegExp} regexp of the route
 * @api pubblic
 */

Router.prototype.route_to_regexp = function (route) {
  var route = route
    .replace(escape_regexp, '\\$&')
    .replace(named_param, '([^\/]+)')
    .replace(splat_param, '(.*?)');
  var regexp = new RegExp('^' + route + '$');
  return regexp;
};

/**
 * extract_params
 * Given a route, and a URL fragment that it matches, 
 * return the array of extracted parameters.
 * 
 * @param {String} route route
 * @param {String} fragment fragment
 * @return {Array} extracted parameters
 * @api public
 */

Router.prototype.extract_params = function (route, fragment) {
  return route.exec(fragment).slice(1);
};

});
require.register("apily-history/index.js", function(exports, require, module){
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

});
require.alias("apily-router/index.js", "undefined/deps/router/index.js");
require.alias("apily-history/index.js", "apily-router/deps/history/index.js");
require.alias("apily-emitter/index.js", "apily-history/deps/emitter/index.js");

require.alias("apily-emitter/index.js", "apily-router/deps/emitter/index.js");

require.alias("apily-history/index.js", "undefined/deps/history/index.js");
require.alias("apily-emitter/index.js", "apily-history/deps/emitter/index.js");

