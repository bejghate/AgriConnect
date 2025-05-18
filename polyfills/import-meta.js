// Polyfill for import.meta
if (typeof globalThis.import === 'undefined') {
  globalThis.import = {};
}

if (typeof globalThis.import.meta === 'undefined') {
  globalThis.import.meta = {
    url: '',
  };
}

// Expose import.meta globally
if (typeof globalThis.importMeta === 'undefined') {
  globalThis.importMeta = globalThis.import.meta;
}
