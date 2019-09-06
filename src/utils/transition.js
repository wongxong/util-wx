import { cached, once, isFunction, isObject, isPlainObject, isString } from './index';
import { on, off, addClass, removeClass } from './dom';
import extend from './extend';

var autoCssTransition = cached(function(name) {
	return {
		enterClass: name + '-enter',
		enterActiveClass: name + '-enter-active',
		enterToClass: name + '-enter-to',
		leaveClass: name + '-leave',
		leaveActiveClass: name + '-leave-active',
		leaveToClass: name + '-leave-to'
	}
});

function resolveTransition(data) {
	if(!data) return;

	var res = {};

	if(isPlainObject(data)) {
		if(data.css !== false) {
			res = autoCssTransition(data.name);
		}
	} else {
		res = autoCssTransition(data);
	}

	return extend(res, data);
}


export var inBrowser = !!window;
export var isIE9 = inBrowser && window.navigator.userAgent.toUpperCase().indexOf('MSIE 9.0') !== -1;
export var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';
var transitionEndEvent = 'transitionend';
var animationEndEvent = 'animationend';
var transitionProp = 'transition';
var animationProp = 'animation';

if(hasTransition) {
	if(window.ontransitionend === undefined && 
		window.onwebkittransitionend !== undefined
	) {
		transitionProp = 'WebkitTransition';
		transitionEndEvent = 'webkitTransitionEnd';
	}
	if(window.onanimationend === undefined && 
		window.onwebkitanimationend !== undefined
	) {
		animationProp = 'WebkitAnimation';
		animationEndEvent = 'webkitAnimationEnd';
	}
}

var raf = inBrowser
	? ( window.requestAnimationFrame
		? window.requestAnimationFrame.bind(window)
		: setTimeout )
	: function(fn) { return fn(); };

export function nextFrame(fn) {
	raf(function() {
		raf(fn);
	});
}

export function whenTransitionEnds(el, expectedType, cb) {
	var ref = getTransitionInfo(el, expectedType);
	var type = ref.type;
	var timeout = ref.timeout;
	var propCount = ref.propCount;
	if(!type) {
		return cb();
	}
	var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
	var ended = 0;
	var end = function() {
		off(el, event, onEnd);
		cb();
	};
	var onEnd = function(e) {
		if(e.target === el) {
			if(++ended >= propCount) {
				end();
			}
		}
	};
	setTimeout(function() {
		if(ended < propCount) {
			end();
		}
	}, timeout + 1);
	on(el, event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo(el, expectedType) {
	var styles = window.getComputedStyle(el);
	// JSDOM may return undefined for transition properties
	var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
	var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
	var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
	var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
	var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
	var animationTimeout = getTimeout(animationDelays, animationDurations);

	var type;
	var timeout = 0;
	var propCount = 0;

	if(expectedType === TRANSITION) {
		if(transitionTimeout > 0) {
			type = TRANSITION;
			timeout = transitionTimeout;
			propCount = transitionDurations.length;
		}
	} else if(expectedType === ANIMATION) {
		if(animationTimeout > 0) {
			type = ANIMATION;
			timeout = animationTimeout;
			propCount = animationDurations.length;
		}
	} else {
		timeout = Math.max(transitionTimeout, animationTimeout);
		type = timeout > 0 ? ( transitionTimeout > animationTimeout
				? TRANSITION : ANIMATION ) : null;
		propCount = type ? ( type === TRANSITION 
				? transitionDurations.length : animationDurations.length) : 0;
	}

	var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'property']);

	return {
		type: type,
		timeout: timeout,
		propCount: propCount,
		hasTransform: hasTransform
	}
}

function getTimeout(delays, durations) {
	while(delays.length < durations.length) {
		delays = delays.concat(delays);
	}

	return Math.max.apply(null, durations.map(function(d, i) {
		return toMs(d) + toMs(delays[i]);
	}))
}


// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs(s) {
	return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}

function addTransitionClass(el, cls) {
	addClass(el, cls);
}

function removeTransitionClass(el, cls) {
	removeClass(el, cls);
}

function isValidDuration(n) {
	return typeof n === 'number' && !isNaN(n) && isFinite(n) && n > 0;
}

export function enter(el, options, insertOrShow) {
	options = isString(options) ? {name: options} : options;
  options = extend({name: 'wx'}, options);

	if(el._leaveCb) {
		el._leaveCb.cancelled = true;
		el._leaveCb();
	}

	var data = resolveTransition(options);

	if(!data) return;

	if(el.nodeType !== 1) return;

	var css = data.css;
	var type = data.type;

	var beforeAppear = data.beforeAppear;
	var appear = data.appear;
	var afterAppear = data.afterAppear;
	var appearCancelled = data.appearCancelled;

	var appearClass = data.appearClass;
	var appearActiveClass = data.appearActiveClass;
	var appearToClass = data.appearToClass;

	var enterClass = data.enterClass;
	var enterActiveClass = data.enterActiveClass;
	var enterToClass = data.enterToClass;

	var beforeEnter = data.beforeEnter;
	var enter = data.enter;
	var afterEnter = data.afterEnter;
	var enterCancelled = data.enterCancelled;

	var duration = data.duration;

	var isAppear = false;

	if(isAppear && !appear && appear !== '') return;

	var startClass = isAppear && appearClass ? appearClass : enterClass;
	var activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
	var toClass = isAppear && appearToClass ? appearToClass : enterToClass;

	var beforeEnterHook = isAppear && beforeAppear ? beforeAppear : beforeEnter;
	var enterHook = isAppear && isFunction(appear) ? appear : enter;
	var afterEnterHook = isAppear && afterAppear ? afterAppear : afterEnter;
	var enterCancelledHook = isAppear && appearCancelled ? appearCancelled : enterCancelled;

	var explicitEnterDuration = isObject(duration) ? duration.enter : duration;

	var expectsCss = css !== false && !isIE9;
	var userWantsControl = isFunction(enterHook) && enterHook.length > 1;

	var cb = el._enterCb = once(function() {
		if(expectsCss) {
			removeTransitionClass(el, toClass);
			removeTransitionClass(el, activeClass);
		}
		if(cb.cancelled) {
			if(expectsCss) {
				removeTransitionClass(el, startClass);
			}
			enterCancelledHook && enterCancelledHook(el);
		} else {
			afterEnterHook && afterEnterHook(el);
		}
		el._enterCb = null;
	});

	beforeEnterHook && beforeEnterHook(el);

	if(expectsCss) {
		addTransitionClass(el, startClass);
		addTransitionClass(el, activeClass);
		nextFrame(function() {
			removeTransitionClass(el, startClass);
			if(!cb.cancelled) {
				addTransitionClass(el, toClass);
				if(!userWantsControl) {
					if(isValidDuration(explicitEnterDuration)) {
						setTimeout(cb, explicitEnterDuration);
					} else {
						whenTransitionEnds(el, type, cb);
					}
				}
			}
		});
	}

	insertOrShow && insertOrShow(el);
	enterHook && enterHook(el, cb);

	if(!expectsCss && !userWantsControl) {
		cb();
	}
}

export function leave(el, options, removeOrHide) {
	options = isString(options) ? {name: options} : options;
  options = extend({name: 'wx'}, options);

	if(el._enterCb) {
		el._enterCb.cancelled = true;
		el._enterCb();
	}

	var data = resolveTransition(options);

	if(!data || el.nodeType !== 1) return removeOrHide(el);

	var css = data.css;
	var type = data.type;

	var beforeLeave = data.beforeLeave;
	var leave = data.leave;
	var afterLeave = data.afterLeave;
	var leaveCancelled = data.leaveCancelled;
	var delayLeave = data.delayLeave;

	var leaveClass = data.leaveClass;
	var leaveActiveClass = data.leaveActiveClass;
	var leaveToClass = data.leaveToClass;

	var duration = data.duration;
  var explicitEnterDuration = isObject(duration) ? duration.enter : duration;

	var expectsCss = css !== false && !isIE9;
	var userWantsControl = isFunction(leave) && leave.length > 1;

	var cb = el._leaveCb = once(function() {
		if(expectsCss) {
			removeTransitionClass(el, leaveToClass);
			removeTransitionClass(el, leaveActiveClass);
		}
		if(cb.cancelled) {
			if(expectsCss) {
				removeTransitionClass(el, leaveClass);
			}
			leaveCancelled && leaveCancelled(el);
		} else {
			removeOrHide(el);
			afterLeave && afterLeave(el);
		}
		el._leaveCb = null;
	});

	if(delayLeave) {
		delayLeave(performLeave);
	} else {
		performLeave();
	}

	function performLeave() {
		if(cb.cancelled) return;
		
		beforeLeave && beforeLeave(el);

		if(expectsCss) {
			addTransitionClass(el, leaveClass);
			addTransitionClass(el, leaveActiveClass);
			nextFrame(function() {
				removeTransitionClass(el, leaveClass);
				if(!cb.cancelled) {
					addTransitionClass(el, leaveToClass);
					if(!userWantsControl) {
						if(isValidDuration(explicitEnterDuration)) {
							setTimeout(cb, explicitEnterDuration);
						} else {
							whenTransitionEnds(el, type, cb);
						}
					}
				}
			});
		}

		leave && leave(el, cb);

		if(!expectsCss && !userWantsControl) {
			cb();
		}
	}
}