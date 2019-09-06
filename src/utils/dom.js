import { isFunction, isPlainObject, isArray, isString, isNumeric } from './index';


export function addClass(el, clsName) {
	if(!el || !clsName) return;
	clsName = clsName.trim();
	if(el.classList) {
		el.classList.add(...clsName.split(' '));
	} else {
		var cur = ' ' + (el.getAttribute('class') || '') + ' ';
		clsName.split(' ').forEach(function(d) {
			if(cur.indexOf(' ' + d + ' ') === -1) {
				cur += d + ' ';
			}
		});
		el.setAttribute('class', cur.trim());
	}
}

export function removeClass(el, clsName) {
	if(!el || !clsName) return;
	clsName = clsName.trim();
	if(el.classList) {
		el.classList.remove(...clsName.split(' '));
		if(!el.classList.length) {
			el.removeAttribute('class');
		}
	} else {
		var cur = ' ' + (el.getAttribute('class') || '') + ' ';
		clsName.split(' ').forEach(function(d) {
			if(cur.indexOf(' ' + d + ' ') !== -1) {
				cur = cur.replace(' ' + d + ' ', ' ');
			}
		});
		cur = cur.trim();
		if(cur) {
			el.setAttribute('class', cur);
		} else {
			el.removeAttribute('class');
		}
	}
}

export function hasClass(el, clsName) {
	if(!el || !clsName) return false;
	clsName = clsName.trim();
	if(el.classList) {
		return el.classList.contains(clsName);
	}
	var cur = ' ' + (el.getAttribute('class') || '') + ' ';
	return cur.indexOf(' ' + clsName + ' ') !== -1;
}

export function on(el, event, handler) {
  if(!el || !event || !isFunction(handler)) return;
  el.addEventListener(event, handler, false);
}

export function one(el, event, handler) {
  if(!el || !event || !isFunction(handler)) return;
  var listener = function() {
    off(el, event, listener);
    handler.apply(el, arguments);
  };
  on(el, event, listener);
}

export function off(el, event, handler) {
  if(!el || !event || !isFunction(handler)) return;
  el.removeEventListener(event, handler, false);
}

export function createElement(tag, data, children) {
  var node = document.createElement(tag);

  if(isPlainObject(data)) {
    Object.keys(data).forEach(function(key) {
      switch(key) {
        case 'style': 
					setStyle(node, data[key]);
					break;

				case 'className':
					if(isArray(data[key])) {
						addClass(node, data[key].join(' '));
					} else if(isString(data[key])) {
						addClass(node, data[key]);
					} else if(isPlainObject(data[key])) {
						addClass(node, Object.keys(data[key]).filter(function(cls) {
							return data[key][cls];
						}).join(' '));
					}
					break;

				case 'attrs':
				 Object.keys(data[key]).forEach(function(property) {
				 	node.setAttribute(property, data[key][property]);
				 });
				 break;

				case 'domProps':
					Object.keys(data[key]).forEach(function(property) {
						node[property] = data[key][property];
					});
					break;

				case 'on':
					Object.keys(data[key]).forEach(function(event) {
						on(node, event, data[key][event]);
					});
					break;
      }
    });
  }

  if(isArray(children)) {
    children.forEach(child => {
      if(isString(child)) {
        return node.appendChild(createTextNode(child));
      } else if(isPlainObject(child)) {
        return node.appendChild(createElement(child.tag, child.data, child.children));
      }
    });
  } else if(isString(children)) {
    node.appendChild(createTextNode(children));
  }

  return node;
}

function createTextNode(txt) {
  return document.createTextNode(txt == null ? '' : txt);
}

export function setStyle(element, styles) {
	if(!styles) {
		return element.removeAttribute('style');
	}
	Object.keys(styles).forEach(function(k) {
		var unit = '';
		if(['width', 'height', 'left', 'right', 'top', 'bottom'].indexOf(k) !== -1 && isNumeric(styles[k])) {
			unit = 'px';
		}
		element.style[k] = styles[k] + unit;
	});
}

export function query(selector, container) {
	return (container || document).querySelector(selector);
}

export function queryAll(selector, container) {
	return (container || document).querySelectorAll(selector);
}

export function insertBefore(node, reference) {
	if(!node || !reference) return;
	reference.parentNode.insertBefore(node, reference);
}

export function offset(el, container) {
	var top = el.offsetTop;
	var left = el.offsetLeft;
	var parent = el.offsetParent;

	if(container) {
		while(parent && parent !== container && container.contains(parent)) {
			top += parent.offsetTop;
			left += parent.offsetLeft;
			parent = parent.offsetParent;
		}
	} else {
		while(parent) {
			top += parent.offsetTop;
			left += parent.offsetLeft;
			parent = parent.offsetParent;
		}
	}

	return {
		left: left,
		top: top
	};
}