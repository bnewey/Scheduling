const express = require('express');
const path = require('path');
const next = require('next');
const expressValidator = require('express-validator');
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const emitter = require('./api/socket-io-api');
const net = require('net');

const app = express();
const server = http.createServer(app);


////////////////

//Socket IO | sends data from node server to next frontend

const io = socketIo(server); 
io.origins(['http://localhost:4000']);
/*
let interval;

io.on("connection", socket => {
  console.log(`New client connected. Socket #${socket.id} `);
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => emitter.getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log(`Client disconnected Socket #${socket.id}`);
  });
});*/
///////////


//TCP SOCKET | c++ to node
const HOST = '127.0.0.1';
const PORT = 8081;

var client = new net.Socket();


client.connect(PORT, HOST, function() {
  console.log('CONNECTED TO: ' + HOST + ':' + PORT);
  // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
  client.write('---- Ping from Client! ----');
});

// data is what the server sent to this socket
  client.on('data', function(data) {
    let temp = data.toString();
    //write message to c++ so that it knows we are still connected
    client.write('I am alive!');
    
    io.emit('FromC', temp);
    
});


client.on('close', function() {
  console.log('Connection closed');
  client.destroy(); 
});

client.on('error', function(err){
  console.log(err);  
});


const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

var profiles = require('./api/profiles/profiles');
var machines = require('./api/machines/machines');

global.SERVER_APP_ROOT = __dirname;

nextApp
  .prepare()
  .then(() => {
 
    app.use(expressValidator());

    app.use('/api/profiles', profiles);
    app.use('/api/machines', machines);
    
    app.use(cors({ origin: '*' }));

    app.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(4000, err => {
      if (err) throw err;
      console.log('> Ready on http://localhost:4000');
    });

  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });

  if(process.env.NODE_ENV !== 'production') {
    process.once('uncaughtException', function(err) {
      console.error('FATAL: Uncaught exception.');
      console.error(err.stack||err);
      setTimeout(function(){
        process.exit(1);
      }, 100);
    });
  }