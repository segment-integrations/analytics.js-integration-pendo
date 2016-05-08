'use strict';

/**
 *
 *	@TODO What about anonymous
 *	@TODO No-ops or exceptions for unsupported operations
 */


/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var _ = require('underscore');

/**
 * Expose `Pendo` integration.
 */

var Pendo = module.exports = integration('Pendo')
.global('pendo')
.option('apiKey', '')
.tag('<script src="https://d3accju1t3mngt.cloudfront.net/js/pa.min.js">');

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
  window.pendo_options = window.pendo_options || { apiKey: this.options.apiKey, usePendoAgentAPI: true };
  _.extend(window.pendo_options, options);

  window.pendo = window.pendo || {};
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Pendo.prototype.loaded = function() {
  return !!window.pendo;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Pendo.prototype.page = function() {
  // Call pageLoad()?
};


/**
  Internal Identify.
  Identify and Group trigger the same general call.

  @api private
 */
function _internal_identify(identify, group) {
  // Collapse everything into an options block.
  var vObj = {
    id: identify.userId()
  };
  var vTraits = identify.traits();
  _.extend(vObj, vTraits);

  var options = {
    visitor: vObj
  };

  var gTraits = group.traits();
  var aObj = {
    id: group.id()
  };

  if (gTraits.parentAccount) {
    var paObj = gTraits.parentAccount;
    delete gTraits.parentAccount;
    options.parentAccount = paObj;
  }
  _.extend(aObj, group.traits());
  options.account = aObj;

  // Pick up everything else
  _.extend(window.pendo_options, options);

  // Identify is smart. It will only identify if things actually changed.
  // Given we are passing an options object, it will also call updateOptions()
  // updateOptions() only fires a meta event if the metadata changes.
  window.pendo.identify(window.pendo_options);
}

/**
 * Identify.
 *
 * http:// add url to pendo identify support
 *
 * @api public
 * @param {Identify} identify
 */

Pendo.prototype.identify = function(identify) {
  _internal_identify(identify, this.analytics.group());
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
  _internal_identify(this.analytics.identify(), group);
};

