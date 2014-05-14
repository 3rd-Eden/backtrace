'use strict';

var stacktrace = require('stacktrace-js');

/**
 * Representation of a stack trace.
 *
 * Options:
 *
 * - **guess**: Guess the names of anonymous functions.
 *
 * @constructor
 * @param {Array} trace Array of traces.
 * @param {Object} err
 * @api private
 */
function Stack(trace, options) {
  if (!(this instanceof Stack)) return new Stack(trace, options);

  if ('object' === typeof trace && !trace.length) {
    options = trace;
    trace = null;
  }

  options = options || {};
  options.guess = 'guess' in options ? options.guess : true;

  if (!trace) {
    var imp = new stacktrace.implementation()
      , traced = imp.run(options.error || options.err || options.e);

    trace = options.guess ? imp.guessAnonymousFunctions(traced) : traced;
  }

  this.traces = this.parse(trace);
}

/**
 * Create a normalised but human readable stack trace.
 *
 * @returns {String}
 * @api private
 */
Stack.prototype.toString = function toString() {
  var traces = [];

  for (var i = 0, length = this.traces.length; i < length; i++) {
    var trace = this.traces[i];
    traces.push(
      '    at '+ trace.name +' ('+ trace.file+ ':'+ trace.line +':'+ trace.column +')'
    );
  }

  return traces.join('\n\r');
};

/**
 * Parse the stack trace array and transform it to an Object.
 *
 * @param {Array} trace Array of stack fragments
 * @returns {Array} Human readable objects
 * @api private
 */
Stack.prototype.parse = function parse(trace) {
  var stack = [];

  for (var i = 0, length = trace.length; i < length; i++) {
    var location = trace[i].split(':')
      , script = location[0].split('@');

    stack.push({
      column: location[2],
      line: location[1],
      name: script[0],
      file: script[1]
    });
  }

  return stack;
};

/**
 * Slice items from the stack trace.
 *
 * @param {Number} start The start of the trace.
 * @param {Number} finihs The end of the trace removal
 * @returns {Stack}
 * @api public
 */
Stack.prototype.slice = function slice(start, finish) {
  this.traces = this.traces.slice(start, finish);

  return this;
};

/**
 * Return the stack trace information for when our stack gets JSON.stringified.
 *
 * @returns {Array}
 * @api private
 */
Stack.prototype.toJSON = function toJSON() {
  return this.traces;
};

//
// Expose the module
//
module.exports = Stack;
