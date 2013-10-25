var Midiplex = require('../index.js')

describe('The midiplex constructor', function(){
  var mp
  beforeEach(function() {
    mp = new Midiplex(1)
  })
  it('should accept and store a channel number', function() {
    expect(mp.getMainChannel()).toBe(1)
  })
  describe('when called with defaults', function(){
    var empty
    beforeEach(function() {
      empty = new Midiplex()
    })
    it('should default to channel 0', function() {
      expect(empty.getMainChannel()).toBe(0)
    })
  })
})

describe('Midiplex#setMainChannel', function() {
  var mp
  beforeEach(function() {
    mp = new Midiplex(1)
  })
  it('should be a function', function() {
    expect(mp.setMainChannel).toEqual(jasmine.any(Function))
  })
  it('should change the main MIDI channel', function() {
    mp.setMainChannel(2)
    expect(mp.getMainChannel()).toBe(2)
  })
})

describe('Midiplex#addNoteStream', function() {
  beforeEach(function() {
    mp = new Midiplex()
  })
  it('should be a function', function() {
    expect(typeof mp.addNoteStream).toBe('function')
  })
})

describe('Midiplex#setVelocityStream', function() {
  it('should be a function', function() {
    expect(mp.setVelocityStream).toEqual(jasmine.any(Function))
  })
})

describe('Midiplex#addControllerStream', function() {
  it('should be a function', function() {
    expect(mp.addControllerStream).toEqual(jasmine.any(Function))
  })
})
