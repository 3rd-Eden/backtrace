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
      , err = options.error || options.err || options.e
      , traced;

    traced = imp.run(err);
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
    var trace = this.traces[i]
      , location = [];

    if (trace.filename) location.push(trace.filename);
    if (trace.line) location.push(trace.line);
    if (trace.column) location.push(trace.column);

    traces.push(
      '    at '+ trace.name +' ('+ location.join(':') +')'
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
    //
    // Location: We assume that the location information of the entry/exit is
    // marked with digits that are separated by colon. 00:00. The first digit
    // set is the line in the file and the second is the column of that line.
    //
    // File: Really primitive check to get the path/file location out of the
    // stack. We assume that we're serving a file with a .js extension
    //
    var location = /\:(\d+)\:?(\d+)?.?$/g.exec(trace[i]) || []
      , file = /((?:\/[^\.\/\:]+)+\.js)/.exec(trace[i]) || []
      , script = trace[i].split('@');

    stack.push({
      column: +location[2] || 0,
      line: +location[1] || 0,
      filename: file[0],
      name: script[0]
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
