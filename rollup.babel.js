const babel = require('rollup-plugin-babel');
const customMinifyCss = require('@open-wc/building-utils/custom-minify-css');

var babelPlugin = babel({
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "targets": {
          "esmodules": true
        }
      }
    ]
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators",{ "legacy": true }],
    ["@babel/plugin-proposal-class-properties",{ "loose": true }],
    ['template-html-minifier',
      {
        modules: {
          'lit-html': ['html'],
          'lit-element': ['html', { name: 'css', encapsulation: 'style' }],
        },
        htmlMinifier: {
          collapseWhitespace: true,
          removeComments: true,
          caseSensitive: true,
          minifyCSS: customMinifyCss,
        },
      },
    ]
  ]
})

export default babelPlugin;