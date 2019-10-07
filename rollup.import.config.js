import {terser} from "rollup-plugin-terser";
import license from './rollup.license';

function getPlugins(isProd) {
  let plugins = [
    terser({
      mangle:false,
      compress:false,
      output:{
        beautify:true,
        comments:false,
        indent_level:2
      }
    }),
    license
  ];

  return plugins;
}

const config = {
  input: './src/backstack.js',
  output: {
    file: './dist/backstack-import.js',
    format: 'esm',
    sourcemap: true,
  },
  external: [ 'lit-element' ]
};

export default (args)=>{
  const isProduction = !! args.configProduction;
  config.plugins = getPlugins(isProduction);

  return config;
}