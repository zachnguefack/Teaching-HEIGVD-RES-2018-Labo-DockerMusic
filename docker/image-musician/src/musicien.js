
 //------------------------------------------------------------------------------
// Loading extern modules


var schedule = require("node-schedule"); // definir les règles ou la frequence d'envoie des paquets 
var dgram    = require("dgram"); //creer un datagram pour emèttre mes UDP datagram
var socket   = dgram.createSocket("udp4"); // socket pour emettre les datagram


//definir le protocol 
const Protocol = {
  PORT              : 2222,
  MULTICAST_ADDRESS : "239.255.22.5"
};


// les différentes instruments 
const INSTRUMENTS = ["piano", "trumpet", "flute", "violin", "drum"];


// le son emit par chaque instrument
var Sounds = {
  piano   : "ti-ta-ti",
  trumpet : "pouet",
  flute   : "trulu",
  violin  : "gzi-gzi",
  drum    : "boum-boum"
};


// les variables pour la recuperations de nos differents champs 
var playload;   // string JSON sent by UDP
var message;    // buffer that contains the string JSON sent by UDP
var instrument; // the instrument of the musician
var argument;   // the argument that is passed on the script
var musician;   // the musician who plays an instrument



/**
 * creation d'une class instrument avec son nom et le son emit
 */
function Instrument(name, sound) {
  this.name = name;
  this.sound = sound;
}



/**
 * creation d'une classe musicien 
 */
function Musician(uuid, instrument) {
  this.uuid = uuid;
  this.instrument = instrument;
}



/**
 * Function UUID generator
 * source code from : https://gist.github.com/jcxplorer/823878
 */
function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}


// verifier si on a bien attribuer un instrument au musicien a la creation 
if (typeof process.argv[2] === "undefined") {
  console.log("Error: missing argument for instrument");
  return;
}


// recuperer l'argument passer en parametre pour la creation d'un musician
argument = process.argv[2].toLowerCase();




/* si l'argument passer en paramettre match avec un instrument de notre tableau,
on creer un instrument avec son non et le son qu'il emet */
if (~INSTRUMENTS.indexOf(argument)) {
  instrument = new Instrument(argument, Sounds[argument]);
} else {
  console.log("Error: instrument \"" + argument + "\" doesn't exist");
  return;
}


 // creer un musicien 
musician = new Musician(uuid(), instrument);


	
/* creer un paquets avec le message qu'on souhaite envoyer*/
playload = JSON.stringify({uuid : musician.uuid, sound : musician.instrument.sound});
message  = new Buffer(playload);



/* creer une regle qui va s'executer chaque seconde */
var rule    = new schedule.RecurrenceRule();
rule.second = new schedule.Range(0, 59);



/* cette regle est utilisée  pour envoyer les datagram apres chaque seconde */
schedule.scheduleJob(rule, function() {
  socket.send(message, 0, message.length,	Protocol.PORT, Protocol.MULTICAST_ADDRESS);
  console.log(playload);
});
