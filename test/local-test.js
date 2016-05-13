'use strict';
var Analytics = require('analytics.js-core').constructor;
var Pendo = require('../lib/');
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');

var analytics = new Analytics();
// create a pendo tracking instance
var pendo = new Pendo({
    apiKey: 'PENDO_API_KEY',
    usePendoAgentAPI: true,
    visitor: {
      id: "jfontanez@pendo.io",
      role: 8,
      email: "jfontanez@pendo.io"
    },
    account: {
      id: "pendo-internal"
    }
});

// use the pendo analytics api
analytics.use(Pendo);
analytics.add(pendo);
analytics.initialize();
