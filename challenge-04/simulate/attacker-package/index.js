'use strict';

// Harmless stub so `require('@northwind/metrics-core')` still resolves.
// The real damage is done by the postinstall hook (steal.js), not by this code.
module.exports = {
  summarize() {
    return {};
  },
};
