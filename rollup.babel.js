import { getBabelOutputPlugin } from '@rollup/plugin-babel';
const customMinifyCss = require('@open-wc/building-utils/custom-minify-css');

var babelPlugin = getBabelOutputPlugin({
  "presets": [
    [
      "@babel/preset-env",
      {
        "modules": false,
        "targets": {
          "esmodules": true
        },
      }
    ]
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators",{ "legacy": true }],
    ["@babel/plugin-proposal-class-properties"],
    ['template-html-minifier',
      {
        modules: {
          'lit': ['html', { name: 'css', encapsulation: 'style' }],
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