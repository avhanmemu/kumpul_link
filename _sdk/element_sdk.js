// Canva Element SDK mock implementation for local development
// This file is typically provided by Canva when embedded in their editor

window.elementSdk = {
  init: function(config) {
    console.log("Element SDK initialized", config);
    // Mock implementation
    if (config && config.onConfigChange) {
      // Simulate initial config change
      setTimeout(() => {
        config.onConfigChange(config.defaultConfig || {});
      }, 100);
    }
  },
  setConfig: function(config) {
    console.log("Element SDK config updated", config);
  }
};