// Adapted from https://github.com/awslabs/aws-lex-browser-audio-capture/blob/master/lib/worker.js

//FIXME: make support multiple channels
function exportBuffersAsWav(buffers: Float32Array[], sampleRate: number, totalLengthInSamples?: number): Blob {
  if (!totalLengthInSamples)
  {
    totalLengthInSamples = buffers.reduce(((sum, array) => sum + array.length), 0);
  }
  const mergedBuffer = mergeBuffers(buffers, totalLengthInSamples);
  const encodedWav = encodeWAV(mergedBuffer, sampleRate)
  const wavFileBlob = new Blob([encodedWav], {type: 'audio/wav'});
  return wavFileBlob;
}

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, targetSampleRate: number): Float32Array {
  if (inputSampleRate === targetSampleRate) {
    return buffer;
  }
  var sampleRateRatio = inputSampleRate / targetSampleRate;
  var newLength = Math.round(buffer.length / sampleRateRatio);
  var result = new Float32Array(newLength);
  var offsetResult = 0;
  var offsetBuffer = 0;
  while (offsetResult < result.length) {
    var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    var accum = 0,
      count = 0;
    for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function mergeBuffers(bufferArray: Float32Array[], recLengthInSamples: number): Float32Array {
  var result = new Float32Array(recLengthInSamples);
  var offset = 0;
  for (var i = 0; i < bufferArray.length; i++) {
    result.set(bufferArray[i], offset);
    offset += bufferArray[i].length;
  }
  return result;
}

// Appends to "output"
function writeFloatsAs16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

// Appends to "output"
function writeString(output: DataView, offset: number, string: String) {
  for (var i = 0; i < string.length; i++) {
    output.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples: Float32Array, sampleRate: number): DataView {
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 32 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  writeFloatsAs16BitPCM(view, 44, samples);

  return view;
}

export { exportBuffersAsWav, downsampleBuffer, mergeBuffers };
