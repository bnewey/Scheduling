const withPWA = require('next-pwa')

module.exports = withPWA({
	assetPrefix: process.env.NODE_ENV === 'development' ? '' : '/scheduling',
    publicRuntimeConfig: {
      ENDPOINT_PORT: process.env.PORT || "8000",
	    basePath: process.env.NODE_ENV === 'development' ? '' : '/scheduling',
    },
    pwa: {
      dest: 'public/static',
      disable: process.env.NODE_ENV === 'development',
      scope: '/scheduling',
    }
  })
