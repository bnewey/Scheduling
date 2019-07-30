const socketIo = require("socket.io");
const net = require('net');

const timeout = 10000;
var retrying = false;

module.exports = function(server, HOST, PORT){
    
    //Socket IO | sends data from node server to next frontend
    const io = socketIo(server); 

    io.on("connection", socket => {
        console.log(`New client connected. Socket #${socket.id} `);

        //Handle event from UI Splitbutton click
        socket.on("Turn On", (name) => {
            console.log(`${name} | On `);
        });
        socket.on("Turn Off", (name) => {
            console.log(`${name} | Off `);
        });
        socket.on("Restart", (name) => {
            console.log(`${name} | Restart `);
        });

        //Handle event from UI All Splitbutton click
        socket.on("Turn On All Machines", (name) => {
            console.log(`${name} | On `);
        });
        socket.on("Turn Off All Machines", (name) => {
            console.log(`${name} | Off `);
        });
        socket.on("Restart All Machines", (name) => {
            console.log(`${name} | Restart `);
        });



        socket.on("disconnect", () => {
            console.log(`Client disconnected Socket #${socket.id}`);
        });
    });
    ///////////

   

    //TCP SOCKET | c++ to node
    var client = new net.Socket();


    function makeConnection () {
        client.connect(PORT, HOST, function() {
            console.log('CONNECTED TO C++ Socket: ' + HOST + ':' + PORT);   
        });
    }

    function endEventHandler() {
         console.log('end');
    }
    function timeoutEventHandler() {
         console.log('timeout');
    }
    function drainEventHandler() {
         console.log('drain');
    }

    function closeEventHandler () {
        // console.log('close');
        client.destroy();
        if (!retrying) {
            retrying = true;
            console.log('Reconnecting...');
        }
        setTimeout(makeConnection, timeout);
    }

    client.on('connect', function(){
        // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
        client.write('---- Ping from Nodejs Client! ----');
        retrying = false;
    });


    // data is what the server sent to this socket
    client.on('data', function(data) {
        let temp = data.toString();
        //Emit to nextjs components using SocketIO
        io.emit('FromC', temp);
        //write message to c++ so that it knows we are still connected
        client.write('I am alive!');
    });

    client.on('end',     endEventHandler);
    client.on('timeout', timeoutEventHandler);
    client.on('drain',   drainEventHandler);

    client.on('close', closeEventHandler);

    client.on('error', function(err){
    console.log(err);  
    });

    makeConnection();
}