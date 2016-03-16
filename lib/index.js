'use strict';

/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var _ = require('underscore');

/**
 * Expose `Customerio` integration.
 */

var Pendo = module.exports = integration('Pendo')
  .global('pendo')
  .readyOnLoad()
  .option('apiKey', '')

// XXX Do we need to account for these here?
// .option('usePendoAgentAPI')
// .option('disableGuides')
// .option('delayGuides')
// .option('guideTimeout')
// .option('excludeAllText')
// .option('logStackTraces')
// .option('doNotAutoDetectUrl') // ties browser's url directly to load events
  .tag('agent', '<script src="https://d3accju1t3mngt.cloudfront.net/js/pa.min.js">');

/**
 * Initialize.
 *
 * Either use this as a TagLoader and all the relevant Pendo information will already be loaded
 * in window.pendo_options.  Or, if not, they're using this in a Segment way and will call identify
 * and group when that information is available.  In which case, we want to use the API.
 *
 * @api public
 */

Pendo.prototype.initialize = function(options) {
  options = options || {};
  window.pendo_options = window.pendo_options
    || {
        apiKey: this.options.apiKey,
        usePendoAgentAPI: true
    };

  _.extend(window.pendo_options, options);

  this.load('agent');
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Pendo.prototype.loaded = function() {
  return !!(window.pendo
      && window.pendo.isReady
      && window.pendo.isReady());
};

var deferIdentify = _.debounce(function() {
  if (!window.pendo) {// uh... error?
    return;
  }

  // get visitor, account, and parentAccount objects off the pendo_options objects
  window.pendo.identify(window.pendo_options);
}, 500);

/**
 * Identify.
 *
 * http:// add url to pendo identify support
 *
 * @api public
 * @param {Identify} identify
 */

Pendo.prototype.identify = function(identify) {
  // collapse traits into the visitor object
  var vObj = {
    id: identify.userId()
  };
  var traits = identify.traits();
  _.extend(vObj, traits);

  // TODO: what to do about anonymousId?

  window.pendo_options.visitor = simplify(vObj);

  deferIdentify();
};

/**
 * Group.
 *
 *
 *
 * @api public
 * @param {Group} group
 */

Pendo.prototype.group = function(group) {
  var traits = group.traits();
  var aObj = {
    id: group.groupId()
  };

  if (traits.parentAccount) {
    var paObj = traits.parentAccount;
    delete traits.parentAccount;
    window.pendo_options.parentAccount = simplify(paObj);
  }

  _.extend(aObj, traits);

  window.pendo_options.account = simplify(aObj);

  deferIdentify();
};

function simplify(obj) {
  return _.reduce(obj,
    function(memo, val, key) {
      if (!obj.hasOwnProperty(key)) {
        return;
      }

      // check if val is approved
      if (_.isString(val)
        || _.isBoolean(val)
        || _.isNumber(val)
      ) {
        memo[key] = val;
        return;
      }

      if (_.isDate(val)) {
        memo[key] = val.toISOString();
        return;
      }

      if (_.isArray(val) && val.length > 0) {
        var peek = val[0];
        if (_.isString(peek)
          || _.isNumber(peek)
          || _.isBoolean(peek)
        ) {
          memo[key] = val;
          return;
        }
      }
    }, {}
  );
}
