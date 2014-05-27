# BackTrace

A simple utility to create a full and human readable stack trace across node and
browsers old ancient browsers which can be manipulated. To use this in browsers,
run the code through browserify.

## Installation

This module is released through npm:

```
npm install --save backtrace
```

## Usage

```js
var BackTrace = require('backtrace');

//
// Create a new stack trace
//
var trace = new BackTrace();

console.log(trace);
console.log(JSON.stringify(trace));

//
// Remove items from the stacktrace.
//
trace.slice(1);
console.log(trace);
console.log(JSON.stringify(trace));
```

## License

MIT
