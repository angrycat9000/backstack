import { createSpaConfig } from '@open-wc/building-rollup';
import license from './rollup.license';
import merge from 'deepmerge';

function config() {
  var c = createSpaConfig({injectServiceWorker: false});
  return merge(c, {
    input: './example/index.html',
    plugins: [license]
  })
} 

export default config;