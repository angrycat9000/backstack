const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');
module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        { pattern: config.grep ? config.grep : 'tests/**/*.test.js', type: 'module' }
      ],
      coverageReporter: {
        dir:'dist/coverage'
      },
      esm: {
        nodeResolve: true
      }
    })
  );
  return config;
};