import { createCompatibilityConfig } from '@open-wc/building-rollup';
import license from './rollup.license';

// if you need to support IE11 use `createCompatibilityConfig` instead.
// import { createCompatibilityConfig } from '@open-wc/building-rollup';
// export default createCompatibilityConfig({ input: './index.html' });
function config() {
  var c = createCompatibilityConfig({input: './example/index.html'});
  return c.map((config,i)=>{
    config.plugins.push(license);
    return config;
  })
} 

export default config;