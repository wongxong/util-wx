import * as Utils from './utils/index';
import {onClickoutside, offClickoutside} from './utils/clickoutside';
import debounce from './utils/debounce';
import throttle from './utils/throttle';
import extend from './utils/extend';
import * as DOMUtils from './utils/dom';
import {stringify, parse} from './utils/query-string';
import * as TransitionUtils from './utils/transition';

export default {
  ...Utils,
  ...DOMUtils,
  ...TransitionUtils,
  onClickoutside,
  offClickoutside,
  debounce,
  throttle,
  extend,
  stringify,
  parse
}