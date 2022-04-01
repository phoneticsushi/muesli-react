//FIXME: convert to .ts
//FIXME: find a way to get this out of the "public" directory

class DummyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    // Pass audio data to main thread
    // FIXME: move audio buffering code into this class so it runs on the audio thread,
    // then add a method to call that gets the buffer to call from the main thread.
    // will need to figure out how locks work in JS
    this.port.postMessage(inputs)
  }
}

registerProcessor('dummy-worklet-processor', DummyWorkletProcessor);
