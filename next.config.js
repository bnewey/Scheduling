module.exports = {
	assetPrefix: process.env.NODE_ENV === 'development' ? '' : '/scheduling',
    publicRuntimeConfig: {
      ENDPOINT_PORT: process.env.PORT || "8000",
	basePath: process.env.NODE_ENV === 'development' ? '' : '/scheduling',
    }
  }
