// This is an example for a simple echo server implemented in Node.js. It
// demonstrates how to write single-threaded, asynchronous code that allows
// one server to talk to several clients concurrently. 
//
// readline is a module that gives us the ability to consume a stream line
// by line

// We use a	standard Node.js module	to work	with UDP	
var	dgram	=	require('dgram');	
var net = require('net');
var readline = require('readline');
var schedule = require("node-schedule");
var moment = require('moment');

const protocol = {
  PROTOCOL_PORT     : 2222,
  PROTOCOL_MULTICAST_ADDRESS : "239.255.22.5"
};

const protocolTcp = {PROTOCOL_PORT : 2205};

var soundInstruments = new Map([
  ["ti-ta-ti" , "piano"],
  ["pouet"    , "trumpet"],
  ["trulu"    , "flute"],
  ["gzi-gzi"  , "violin"],
  ["boum-boum", "drum"]
]);


function Musician(uuid, instrument, activeSince) {
  this.uuid = uuid;
  this.instrument = instrument;
  this.activeSince = activeSince;
}


 function Auditor() {

   var listMusicians = new Map(); // list of musicians alive

   /**
    * This function allows to add a musician in the list.
    */
   this.addMusician = function(musician) {
     listMusicians.set(musician.uuid, musician);
   } 
   
     /**
    * This function allows to remove a musician from the list.
    */
   var removeMusician = function(musician) {
     listMusicians.delete(musician.uuid);
   }
   
   
    var isMusicianActive = function(musician) {
     var musicianObject = listMusicians.get(musician.uuid);

     /* if the musician is in the list, we check if he's active */
     if (typeof musicianObject !== "undefined") {
       return Date.now() - musicianObject.activeSince <= 5000; // time in ms
     }

     return false;
   }
   
   
    /**
    * This function remove all the unactive musicians.
    */
   this.removeUnactiveMusicians = function() {
     for (var musician of listMusicians.values()) {
       if (!isMusicianActive(musician)) {
         removeMusician(musician);
       }
     }
   }
   
   
      /**
    * This function returns an array with all the musicians in the list.
    */
   this.getArrayMusicians = function() {
     var arrayMusician = [];

     for (var musician of listMusicians.values()) {
       musician.activeSince = moment(musician.activeSince); // Formate time

       arrayMusician.push(musician);
     }

     return arrayMusician;
   }
 }
 
 
 
 
 auditor = new Auditor();


// Let's create a datagram	socket.	We will	use	it to listen for datagrams published in	the	
// multicast group	by	musicians 	

var	s =	dgram.createSocket('udp4');	


s.bind(protocol.PROTOCOL_PORT,	function()	{	
		console.log("Joining multicast group");	
		s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);	
});

	
// This call back is invoked when a new	datagram has arrived.	
s.on('message',	function(msg,source){	
var musicianFromUDP = JSON.parse(msg.toString());
var musician = new Musician(musicianFromUDP.uuid,
                              soundInstruments.get(musicianFromUDP.sound),
                              Date.now());
                               auditor.addMusician(musician);
							   
});	


// let's create a TCP server
var server = net.createServer();

// it can react to events: 'listening', 'connection', 'close' and 'error'
// let's register our callback methods; they will be invoked when the events
// occur (everything happens on the same thread)
server.on('listening', callbackFunctionToCallWhenSocketIsBound);

server.on('connection', callbackFunctionToCallWhenNewClientHasArrived);

// we are ready, so let's ask the server to start listening on port 2205
server.listen(protocolTcp.PROTOCOL_PORT);

// This callback method is invoked after the socket has been bound and is in
// listening mode. We don't need to do anything special.
function callbackFunctionToCallWhenSocketIsBound() {
	console.log("The socket is bound and the server is listening for connection requests.");
	console.log("Socket value: %j", server.address());
}

// This callback method is invoked after a client connection has been accepted.
// We receive the socket as a parameter. We have to attach a callback function to the
// 'data' event that can be raised on the socket.
function callbackFunctionToCallWhenNewClientHasArrived(socket) { 
  socket.write(JSON.stringify(auditor.getArrayMusicians()));
  socket.end();

}

/* create a rule that must to be execute every 1 seconds */
var rule    = new schedule.RecurrenceRule();
rule.second = new schedule.Range(0, 59);

/* we use this rule to remove every seconds the unactive
   musicians from the auditor */
schedule.scheduleJob(rule, auditor.removeUnactiveMusicians);





