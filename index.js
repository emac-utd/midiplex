var inherits = require('inherits')
var MergeStream = require('merge-stream')
var through = require('through')
var BlockStream = require('block-stream') 
var events = require('events')
//Constants
var NOTE_ON = 0x90
var NOTE_OFF = 0x80
var CONTROLLER = 0xB0

function noteOn(channel, pitch, velocity) {
  return [NOTE_ON + channel, pitch, velocity]
}

function noteOff(channel, pitch, velocity) {
  return [NOTE_OFF + channel, pitch, velocity]
}

function controller(channel, control, value) {
  return [CONTROLLER + channel, control, value]
}

var Midiplex = function(chan){
  this._mainChannel = chan || 0
}

inherits(Midiplex, events.EventEmitter)

Midiplex.prototype.getMainChannel = function() {
  return this._mainChannel
}

Midiplex.prototype.setMainChannel = function(chan) {
  this._mainChannel = chan
}

function existy(value)
{
  return value !== undefined && value !== null
}

function mergeDefaults(opts, defaults) {
  var result = {}
  var prop
  for (prop in defaults){
    if(defaults.hasOwnProperty(prop)) {
     result[prop] = existy(opts[prop]) ? opts[prop] : defaults[prop]
    }
  }
  return result
}

function normalizer(inMin, inMax, outMin, outMax) {
  return function(value){
    if(value < inMin) value = inMin
    if(value > inMax) value = inMax
    return Math.floor(value/(inMax-inMin) * (outMax-outMin) + outMin)
  }
}

function oneAtATime() { return new BlockStream(1) }

Midiplex.prototype._addStream = function(stream) {
  if(this._mergedStream) {
    this._mergedStream.add(stream)
    this.emit('readable')
  }
  else this._mergedStream = MergeStream(stream)
}

Midiplex.prototype.addNoteStream = function(stream, opts) {
  var defaults = {
    minVal: 0,
    maxVal: 255,
    minOut: 60,
    maxOut: 71,
    channel: this.getMainChannel(),
    maxLen: 1000,
    staticVelocity: 64
  }
  var options = mergeDefaults(opts,defaults)
  var normalize = normalizer(
    options.minVal,
    options.maxVal,
    options.minOut,
    options.maxOut
  )

  var prevNote, prevVel
  var self = this
  var tr = through(function(buf) {
    var byte = buf[0]
    note = normalize(byte)
    var vel = options.staticVelocity
    if(existy(self._curVel)) {
      vel = self._curVel
    }
    if(note != prevNote || vel != prevVel) {
      this.queue(new Buffer(
        noteOff(options.channel, prevNote, prevVel)
      ))
      this.queue(new Buffer(
        noteOn(options.channel, note, vel)
      ))
      var thruself = this
      setTimeout(function() { thruself.queue(new Buffer(
          noteOff(options.channel, note, vel)
        )) 
      }, 1000)
      prevNote = note
      prevVel = vel
    }
  })
  stream.pipe(oneAtATime()).pipe(tr)
  this._addStream(tr)
}

/*Midiplex.prototype.setVelocityStream = function(stream, opts) {
  var defaults = {
    minVal: 0,
    maxVal: 255,
    minOut: 0,
    maxOut: 127
  }
  var options = mergeDefaults(opts,defaults)
  var normalize = normalizer(
    options.minVal,
    options.maxVal,
    options.minOut,
    options.maxOut
  )
  var tr = through(function(buf) {
    this.queue(normalize(buf[0]))
  })
  stream.pipe(oneAtATime()).pipe(tr)
  var self = this
  tr.on('readable', function() {
    self._curVel = tr.read(1)
  })
}*/

Midiplex.prototype.addControllerStream = function(stream, opts) {
  var defaults = {
    minVal: 0,
    maxVal: 255,
    minOut: 0,
    maxOut: 127,
    channel: this.getMainChannel(),
    controller: 1 //Mod wheel
  }
  var options = mergeDefaults(opts,defaults)
  var normalize = normalizer(
    options.minVal,
    options.maxVal,
    options.minOut,
    options.maxOut
  )
  var tr = through(function(buf) {
    this.queue(new Buffer(controller(
      options.channel,
      options.controller,
      normalize(buf[0])
    )))
  })
  stream.pipe(oneAtATime()).pipe(tr)
  this._addStream(tr)
}

Midiplex.prototype.addPassthroughStream = function(stream) {
  this._addStream(stream)
}

Midiplex.prototype.getReadableStream = function() {
  return this._mergedStream
}

module.exports = Midiplex
