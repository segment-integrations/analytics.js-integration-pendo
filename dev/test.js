
var analytics = require('segmentio/analytics.js-core');
var Pendo = require('../lib/');

analytics.use(Pendo);
analytics.initialize({
  "Pendo": {
     apiKey: 'PENDO_API_KEY',
    visitor: {
      id: "jfontanez@pendo.io",
      role: 8,
      email: "jfontanez@pendo.io"
    },
    account: {
      id: "pendo-internal"
    }
  }
});
