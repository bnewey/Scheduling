const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache') 
try{
  runtimeCaching[0].options.precacheFallback.fallbackURL = "/scheduling/_offline";
}
catch(err){
  
}

module.exports = withPWA({
	assetPrefix: process.env.NODE_ENV === 'development' ? '' : '/scheduling',
    publicRuntimeConfig: {
      ENDPOINT_PORT: process.env.PORT || "8000",
	    basePath: process.env.NODE_ENV === 'development' ? '' : '/scheduling',
    },
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
      scope: '/',
      subdomainPrefix: '/scheduling',
    }
  })
