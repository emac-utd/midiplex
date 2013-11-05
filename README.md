Midiplex
========

Converge multiple data streams into one MIDI output

Automated test coverage currently incomplete

Example
-------

```javascript
var Midiplex = require('midiplex')

var mp = new Midiplex()

//...
//Set up some sort of sensor input stream
//...

mp.addNoteStream(stream, { minOut: 40, maxOut: 51 }
```

[A full-fledged example is also available](https://github.com/emac-utd/midiplex-demo-server)

API
---

###Midiplex#addNoteStream(stream, opts)

Takes bytes from the given stream and turns it into notes using the given options.  `opts` is an object and has the following defaults:

```javascript
{
  minVal: 0, //Minimum input value
  maxVal: 255, //Maximum input value (cannot be higher than 255)
  minOut: 60, //Minimum output note
  maxOut: 71, //Maximum output note (cannot be higher than 127)
  channel: this.getMainChannel(), //MIDI channel to output on
  maxLen: 1000, //Maximum note length
  staticVelocity: 64 //Constant velocity value for notes
}
```

###Midiplex#addControllerStream

Takes bytes from the given stream and turns it into MIDI control data.  `opts` is an object and has the following defaults:

```javascript
{
  minVal: 0, //Minimum input value
  maxVal: 255, //Maximum input value (cannot be higher than 255)
  minOut: 0, //Minimum output value
  maxOut: 127, //Maximum output value (cannot be higher than 127)
  channel: this.getMainChannel(), //MIDI channel to output on
  controller: 1 //Controller to modify (default is usually what a mod wheel is mapped to)
}
```

###Midiplex#getMainChannel()

Returns the current default channel

###Midiplex#setMainChannel(channel)

Sets the default channel
