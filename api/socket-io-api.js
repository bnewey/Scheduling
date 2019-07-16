
const axios = require("axios");

  const getApiAndEmit = async socket => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/machines"
      ); // Getting the data from DarkSky
      socket.emit("FromAPI", res.data); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
  };
  

module.exports = {getApiAndEmit}; 

//https://api.darksky.net/forecast/09b3f1824a70d3a0ba28d22a8dac49e6/34.7374074,-92.4901376
//http://localhost:4000/api/machines