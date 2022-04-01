import randomWords from 'random-words';
import { MuesliAudioClip } from './Types';
import { exportBuffersAsWav } from './AudioCapture'

enum ClipRecordingState {
  OpeningPadding = "OpeningPadding",
  Waiting = "Waiting",
  Recording = "Recording",
}

function recordAudioClips(
  mediaStream: MediaStream,
  onTimeUntilClipEndsMs: (timeUntilClipEndsMs: number) => void,
  onNewClip: (clip: MuesliAudioClip) => void,
  silenceDetectionPeriodMs: number,
  insignificantClipDurationMs: number,  // Clips shorter than this won't be saved
  // FIXME: move magic numbers into UI controls
  silenceThresholdDbfs = -60,
  recordingPaddingPeriodMs = 500,  // How much audio is retained in each clip before and after silence
): () => void {
  if (silenceDetectionPeriodMs <= recordingPaddingPeriodMs) {
    throw new Error("Silence detection period must be greater than padding period");
  }

  // Set up AudioContext
  const audioCtx = new AudioContext();

  const sourceNode = audioCtx.createMediaStreamSource(mediaStream);
  const analyserNode = new AnalyserNode(audioCtx, { minDecibels: silenceThresholdDbfs });

  // Recording State
  const analyzerFrequencyData = new Uint8Array(analyserNode.frequencyBinCount);  // Will be clobbered every time the frequency analyzer runs
  let recordedAudioChunks: Float32Array[] = [];
  let recordingState: ClipRecordingState = ClipRecordingState.OpeningPadding;
  let silenceStartTimestamp: DOMHighResTimeStamp | null = null;

  // Add CaptureNode
  audioCtx.audioWorklet.addModule(process.env.PUBLIC_URL + '/DummyWorkletProcessor.js').then(
    (_) => {
      const captureNode = new AudioWorkletNode(audioCtx, 'dummy-worklet-processor');

      captureNode.port.onmessage  = event => {
        const audioSamples = event.data[0][0];  // FIXME: save second channel as well
        onPcmChunk(audioSamples)
      }

  sourceNode.connect(analyserNode).connect(captureNode);
    },
    (_) => {
      throw Error("Failed to resolve Promise loading DummyWorkletProcessor!");
    }
  )
  
  console.log('Source Sample Rate: ', audioCtx.sampleRate)

  // Compute remaining time periods:
  // Since operations are done by chunk,
  // this is a tradeoff between trimming precision and performance.
  // createScriptProcessor() requires that this is a power of 2.
  // FIXME: do math in samples rather than chunks
  const samplesPerChunk = 128

  const samplesPerMs = audioCtx.sampleRate / 1000
  const chunkSizeMs = samplesPerChunk / samplesPerMs;
  console.log('Chunk Size Ms: ', chunkSizeMs)
  const recordingPaddingPeriodChunks = recordingPaddingPeriodMs / chunkSizeMs;

  function pollForSilenceDetection() {
    const now: DOMHighResTimeStamp = performance.now()
    analyserNode.getByteFrequencyData(analyzerFrequencyData); // get current data

    if (recordingState === ClipRecordingState.OpeningPadding)
    {
      console.log('Skipping silence detection while waiting for padding')
      return;
    }

    if (analyzerFrequencyData.some(v => v)) { // if there is data above the given db limit
      silenceStartTimestamp = now;
      if(recordingState === ClipRecordingState.Waiting){
        console.log("Detected Audio")
      }
      recordingState = ClipRecordingState.Recording;
    }

    if (silenceStartTimestamp === null)
    {
      onTimeUntilClipEndsMs(0);
    }
    else
    {
      const silenceDurationMs = now - silenceStartTimestamp
      onTimeUntilClipEndsMs(Math.max(0, silenceDetectionPeriodMs - silenceDurationMs))  // Allow React to update the UI

      if (recordingState === ClipRecordingState.Recording && silenceDurationMs > silenceDetectionPeriodMs) {
        console.log("Detected Silence")
        publishClip(silenceDurationMs - recordingPaddingPeriodMs)
        rotateChunksForNewClip()
        recordingState = ClipRecordingState.Waiting
      }
    }
  }

  function publishClip(timeToTrimFromEndMs: number) {
    const numChunksToTrimFromEnd = timeToTrimFromEndMs / chunkSizeMs;
    console.log("Converting Audio:", recordedAudioChunks.length, "chunks available, trmming", numChunksToTrimFromEnd)
    const slicedAudioChunks = recordedAudioChunks.slice(0, recordedAudioChunks.length - numChunksToTrimFromEnd);
  // FIXME: consider encoding the audio somehow after a clip is created rather than using WAV?
    const blob = exportBuffersAsWav(slicedAudioChunks, audioCtx.sampleRate)
    const newClip = {
      name: randomWords({exactly: 1, wordsPerString: 2, separator: '-'})[0],  // Returns array for some reason
      url: window.URL.createObjectURL(blob)
    }
    console.log("Generated clip", newClip);
    onNewClip(newClip)
  }

  function rotateChunksForNewClip() {
    // Prepare for next recording by keeping most recent audio to use as padding for the next clip
    recordedAudioChunks = recordedAudioChunks.slice(recordedAudioChunks.length - recordingPaddingPeriodChunks, recordedAudioChunks.length);
  }

  
  function onPcmChunk(chunk: Float32Array) {
      recordedAudioChunks.push(chunk);
      if (recordedAudioChunks.length > recordingPaddingPeriodChunks)
      {
        if (recordingState === ClipRecordingState.OpeningPadding || recordingState === ClipRecordingState.Waiting)
        {
          recordedAudioChunks.shift()
          recordingState = ClipRecordingState.Waiting
        }
      }
  }

  function stopRecording() {
    console.log('Recorder has been stopped; publishing final clip...')
    const numChunksForInsignificantClip = (insignificantClipDurationMs + recordingPaddingPeriodMs) / chunkSizeMs;

    if (silenceStartTimestamp === null) {
      console.log("Skipping final clip publish as silence has never been detected")
    } else if (recordedAudioChunks.length <= numChunksForInsignificantClip) {
      // Drop any audio in the buffer as it's too short to be an actual recording
      console.log("Skipping final clip publish as number of chunks", recordedAudioChunks.length, "<=", numChunksForInsignificantClip)
    } else {
      const silenceDurationMs = performance.now() - silenceStartTimestamp;
      publishClip(silenceDurationMs - recordingPaddingPeriodMs);
    }

    audioCtx.close()
    mediaStream.getTracks().forEach(track => track.stop());
  }

  console.log('Starting Recorder...')
  const analysisInterval = setInterval(pollForSilenceDetection, 100);  // Arbitrary delay

  // Cleanup Function
  return () => {
    clearInterval(analysisInterval)
    stopRecording()
    console.log('Ran cleanup function for recording routine')
    //FIXME: getting some exceptions related to calling "process" that may be related to this - not sure yet
  }
}

export default recordAudioClips;