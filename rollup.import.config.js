import {terser} from "rollup-plugin-terser";
import license from './rollup.license';
import babel from './rollup.babel';

function getPlugins(isProd) {
  let plugins = [
    babel,
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
    sourcemap: false,
  },
  external: [ 'lit-element' ]
};

export default (args)=>{
  const isProduction = !! args.configProduction;
  config.plugins = getPlugins(isProduction);

  return config;
}