const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');
module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        { pattern: config.grep ? config.grep : 'tests/**/*.test.js', type: 'module' }
      ],
      coverageIstanbulReporter: {
        dir:'dist/coverage'
      },
      esm: {
        //coverage:true,
        coverageExclude: ['dist/lit-element*.js'],
        nodeResolve: true
      }
    })
  );
  return config;
};