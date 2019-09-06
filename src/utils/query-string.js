import extend from "./extend";
import { isFunction, isObject, isArray, isPlainObject, hasOwn, isPrimitive } from "./index";

const DEFAULTS = {
  delimiter: '&',
  decoder: function(str) {
    return decodeURIComponent(str);
  },
  encoder: function(str) {
    return encodeURIComponent(str);
  }
};

export function stringify(obj, options) {
  if(!obj || !isObject(obj)) return '';
  options = extend({
    skipNull: true,
    arrayFormat: 'brackets', // [brackets, comma]
    serializeDate: function(date) {
      return date.toISOString();
    }
  }, DEFAULTS, options);
  var pairs = [];
  var hasEncoder = isFunction(options.encoder);
  var add = function(key, val) {
    if(val == null) {
      if(options.skipNull) {
        pairs.push(hasEncoder ? options.encoder(key) : key);
      } else {
        pairs.push(hasEncoder ? options.encoder(key) + '=' : key + '=');
      }
    } else {
      if(hasEncoder) {
        pairs.push(options.encoder(key) + '=' + options.encoder(val));
      } else {
        pairs.push(key + '=' + val);
      }
    }
  };
  
  Object.keys(obj).forEach(function(prefix) {
    buildParams(prefix, obj[prefix], options, add);
  });

  return pairs.join(options.delimiter);
}

function buildParams(prefix, obj, options, add) {
  if(isArray(obj)) {
    var bothPrimitive = obj.every(isPrimitive);
    if(options.arrayFormat === 'comma' && bothPrimitive) {
      buildParams(prefix, obj.join(','), options, add);
    } else {
      obj.forEach(function(item, index) {
        if(prefix.match(/\[\]$/)) {
          buildParams(prefix, item, options, add);
        } else {
          buildParams(prefix + '['+ (bothPrimitive ? '' : index) +']', item, options, add);
        }
      });
    }
  } else if(isPlainObject(obj)) {
    Object.keys(obj).forEach(function(name) {
      buildParams(prefix + '['+ name +']', obj[name], options, add);
    });
  } else {
    add(prefix, obj);
  }
}

export function parse(query, options) {
  if(!query) return {};
  var res = {};
  var tempObj = parseValue(query, options);
  Object.keys(tempObj).forEach(function(key) {
    res = extend(res, parseKey(key, tempObj[key], options));
  });
  return res;
}

function parseValue(query, options) {
  var res = {};
  options = extend({}, DEFAULTS, options);
  query = isFunction(options.decoder) && options.decoder(query);
  query.split(options.delimiter).forEach(function(item) {
    var bracketEqualsPos = item.indexOf(']=');
    var pos = bracketEqualsPos === -1 ? item.indexOf('=') : bracketEqualsPos + 1;
    var key;
    var val;
    if(pos === -1) {
      key = item;
      val = null;
    } else {
      key = item.slice(0, pos);
      val = item.slice(pos + 1);
    }

    if(hasOwn.call(res, key)) {
      res[key] = [].concat(res[key], val);
    } else {
      res[key] = val;
    }
  });
  return res;
}

function parseKey(key, val, options) {
  var res = {};
  var brackets = /(\[[^[\]]*])/;
  var child = /(\[[^[\]]*])/g;
  var segment = key.match(brackets);
  var parent = segment ? key.slice(0, segment.index) : key;
  var temArray = [parent];
  var matched = key.match(child);
  if(matched) {
    temArray = temArray.concat(matched);
  }
  return parseObject(temArray, val, options);
}

function parseObject(keys, val, options) {
  var res = val;
  keys.reverse().forEach(function(key) {
    var obj;
    if(key === '[]') {
      obj = [].concat(res);
    } else {
      obj = {};
      key = key.charAt(0) === '[' && key.charAt(key.length - 1) === ']' ? key.slice(1, -1) : key;
      obj[key] = res;
    }
    res = obj;
  });
  return res;
}