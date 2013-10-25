var Midiplex = require('../index.js')
var es = require('event-stream')
var dgram = require('dgram')
var midi = require('midi')
var through = require('through')

function udpSocket() { return new dgram.createSocket('udp4') }

function udpStream(socket) {
  return es.readable(function(count, callback) {
    var self = this
    socket.on('message', function(buf){
      self.emit('data', buf)
      callback()
    })
  })
}
var mp = new Midiplex()

var noteSocket = udpSocket()
var velSocket = udpSocket()
var modSocket = udpSocket()

var noteStream = udpStream(noteSocket)
var velStream = udpStream(velSocket)
var modStream = udpStream(modSocket)

mp.addNoteStream(noteStream, {maxVal: 200})
mp.setVelocityStream(velStream, {maxVal: 200})
mp.addControllerStream(modStream, {maxVal: 200, maxOut: 100})

noteSocket.bind(9001)
velSocket.bind(9002)
modSocket.bind(9003)

var output = new midi.output()
output.openPort(1)
var midiStream = midi.createWriteStream(output)
mp.getReadableStream().pipe(midiStream)
