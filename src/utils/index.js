

export const toString = Object.prototype.toString;
export const hasOwn = Object.prototype.hasOwnProperty;

export function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

export function isString(str) {
  return typeof str === 'string';
}

export function isNumber(n) {
  return typeof n === 'number' && !isNaN(n) && isFinite(n);
}

export function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

export function isBoolean(bool) {
  return typeof bool === 'boolean';
}

export function isArray(n) {
  return Array.isArray(n);
}

export function isObject(n) {
  return n && typeof n === 'object';
}

export function isPlainObject(obj) {
  return toString.call(obj) === '[object Object]';
}

export function isFunction(fn) {
  return typeof fn === 'function';
}

export const guid = (function() {
  var t = new Date().getTime();
  var uid = 0;
  return function(prefix) {
    return (prefix != null ? prefix : '') + (t + uid++).toString(16);
  }
})();

export function cached(fn) {
  var cache = Object.create(null);
  return function(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  }
}

export function once(fn) {
  var called = false;
  return function() {
    if(!called) {
      called = true;
      fn();
    }
  }
}