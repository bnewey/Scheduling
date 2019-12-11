const socketIo = require("socket.io");
const net = require('net');
const logger = require('./logs');
const timeout = 10000; //timeout for retrying c++ socket connection
var retrying = false;
var io = null;

const getSocket = function(socketId){
    if(!io){
        return null;
    }

    if(socketId && io.sockets.connected[socketId]){
        return io.sockets.connected[socketId].broadcast;
    }else{
        return io;
    }
}

const convertName = function(name){
    switch(name){
        case "air_compressor":
            return "01";
        case "air_dryer":
            return "02";
        case "tank_1":
            return "03";
        case "tank1_3":
            return "04";
        case "tank2_3":
            return "05";
        case "tank3_3":
            return "06";
        case "generator":
            return "07";
        case "nitrogen_tank":
            return "08";
    }
}

exports.setupIo = function(server, HOST, SOCKET_PORT){
    
    //Socket IO | sends data from node server to next frontend
    io = socketIo(server);

    io.on("connection", socket => {
        logger.verbose(`New client connected. Socket #${socket.id} `);

        //Handle event from UI Splitbutton click
        socket.on("Turn On", (name) => {
            logger.info(`${name} | On `);
            writeToPort("03", convertName(name), null);
        });
        socket.on("Turn Off", (name) => {
            logger.info(`${name} | Off `);
        });
        socket.on("Restart", (name) => {
            logger.info(`${name} | Restart `);
        });

        //Handle event from UI All Splitbutton click
        socket.on("Turn On All Machines", (name) => {
            logger.info(`${name} | On `);
        });
        socket.on("Turn Off All Machines", (name) => {
            logger.info(`${name} | Off `);
        });
        socket.on("Restart All Machines", (name) => {
            logger.info(`${name} | Restart `);
        });

        socket.on("Test_Command", (string) => {
            logger.info(`${string} | test command`);
            writeToPort("10", null, string);
        });

        socket.on("disconnect", () => {
            logger.verbose(`Client disconnected Socket #${socket.id}`);
        });
    });
}

const emitToFrontend = function(event, data) {
   let io = getSocket();
   if(!io){
       logger.info("No connection to FrontEnd found");
       return
   }
   io.emit(event, data);
}


     ////////////////////////////////////

 //TCP SOCKET | c++ to node
var client = new net.Socket();

exports.setupTCP = function(HOST, SOCKET_PORT, database) {

    function makeConnection () {
        client.connect(SOCKET_PORT, HOST, function() {
            logger.info('CONNECTED TO C++ Socket: ' + HOST + ':' + SOCKET_PORT);   
            emitToFrontend('Reconnect', {retrying: false, data: false});
        });
    }
    function endEventHandler() {
        logger.info('end');
    }
    function timeoutEventHandler() {
        logger.info('timeout');
    }
    function drainEventHandler() {
        logger.info('drain');
    }

    function closeEventHandler () {
        client.destroy();
        if (!retrying) {
            retrying = true;
            emitToFrontend('Reconnect', {retrying: true, data:false});
            logger.warn('Reconnecting...');
        }
        setTimeout(makeConnection, timeout);
    }

    client.on('connect', function(){
        // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
        writeToPort("01",null,null);
        retrying = false;
    });

    var i = 0;
    // data is what the server sent to this socket
    client.on('data', function(data) {
        let temp = data.toString();

        //Emit to nextjs components using SocketIO
        emitToFrontend('FromC', temp);

        //Let nextjs know we are both connected to c++ and getting data from USB
        emitToFrontend('Reconnect', {retrying: false, data:true});
        
        //write message to c++ so that it knows we are still connected
        writeToPort('00',null,null);
        
        //Send to logging mysql database every 1000 reads (around 5 minutes)
        if(i % 1000 == 0){ 
            database.sendReadToSQL(temp);
            logger.verbose("History data sent to MySQL");
        }
        i++;
    });

    client.on('end',     endEventHandler);
    client.on('timeout', timeoutEventHandler);
    client.on('drain',   drainEventHandler);
    client.on('close', closeEventHandler);
    client.on('error', function(err){
    logger.error(err);
    });

    makeConnection();
}

//String to be sent will be 200 digits
//Params:
// Command: first two digits [0,1] (connected: 00, onConnect: 01 ||| stop: 02, start: 03, restart: 04, all_off: 05, all_on: 06, all_restart: 07 ||| write_to_port: 10 )
// Machine: next two [2,3] (machine # 01 - 08)
// Blank: next two [4,5] (0,0)
// Data: next 194 digits [6-199] (0,0)
const writeToPort = function(command, machine, data) {
    if(!command){
        logger.warn("Write - Bad Command");
        return
    }
    if(!machine){
        machine = "00";
    }
    if(!data){ //194 0's
        data = "000000000000000000000000000000000000000000000000000000000000000"+
        "0000000000000000000000000000000000000000000000000000000000000000000000"+
        "0000000000000000000000000000000000000000000000000000000000000";
    }
    while(data.length  < 194){
        data += "0";
    }

    var stringToWrite = command + machine + "00" + data;
    client.write(stringToWrite);

    if(command != "00"){
        logger.verbose("%s -- sent to c++", stringToWrite);
    }
}
