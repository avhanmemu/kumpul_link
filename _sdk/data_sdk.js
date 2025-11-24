// Canva Data SDK mock implementation for local development
// This file is typically provided by Canva when embedded in their editor
// Since we're using localStorage, this is now a no-op implementation

window.dataSdk = {
  init: async function(handler) {
    console.log("Data SDK initialized (using localStorage instead)");
    // Since we're using localStorage, we don't need to call handler.onDataChanged
    // The app will load data from localStorage directly
    return { isOk: true };
  },
  create: async function(data) {
    console.log("Data SDK create - using localStorage instead");
    return { isOk: true };
  },
  update: async function(data) {
    console.log("Data SDK update - using localStorage instead");
    return { isOk: true };
  },
  delete: async function(data) {
    console.log("Data SDK delete - using localStorage instead");
    return { isOk: true };
  }
};