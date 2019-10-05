const license = require('rollup-plugin-license');
const licensePlugin = license({
  banner: {
  commentStyle: 'regular',
  content: 
    `Copyright (c) <%= moment().format('YYYY') %> <%= pkg.author %>
    <%= pkg.name %> <%= pkg.version %> 
    <%= pkg.homepage %>

    Licensed under the terms of the <%= pkg.license %> license
    https://github.com/angrycat9000/webapp-navigation/blob/master/LICENSE

    @license @nocompile`,
  }
});

export default licensePlugin