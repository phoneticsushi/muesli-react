import randomWords from 'random-words';
import { MuesliAudioClip } from './Types';

function detectSilence(
  audioCtx: AudioContext,
  sourceAudioNode: AudioNode,
  silence_delay_ms: number,
  min_decibels: number,
  onSoundStart = () => {},
  onSilenceDurationMs = (silenceDuration: number) => {},
  onSoundEnd = () => {},
  ): () => void {
  const analyserNode = new AnalyserNode(audioCtx, {
    minDecibels: min_decibels,
  });
  sourceAudioNode.connect(analyserNode);

  // FIXME: does this leak memory?
  const data = new Uint8Array(analyserNode.frequencyBinCount); // will hold our data
  let silence_start = performance.now();
  let activelyRecording = false; // trigger only once per silence event

  function loop() {
    const now: DOMHighResTimeStamp = performance.now()
    analyserNode.getByteFrequencyData(data); // get current data
    if (data.some(v => v)) { // if there is data above the given db limit
      if(!activelyRecording){
        onSoundStart();
        activelyRecording = true;
        console.log("Detected Audio")
        }
      silence_start = now; // set it to now
    }
    const silenceDurationMs = now - silence_start
    onSilenceDurationMs(silenceDurationMs)
    if (activelyRecording && silenceDurationMs > silence_delay_ms) {
      onSoundEnd();
      activelyRecording = false;
      console.log("Detected Silence")
    }
  }

  const analysisInterval = setInterval(loop, 100);  // Arbitrary delay
  // Cleanup Function
  return () => {
    clearInterval(analysisInterval)
    console.log('Ran cleanup function for silence detection')
  }
}

function recordAudioClips(
  mediaStream: MediaStream,
  onTimeUntilClipEndsMs: (timeUntilClipEndsMs: number) => void,
  onNewClip: (clip: MuesliAudioClip) => void,
  silenceDetectionPeriodMs: number,
  insignificantClipDurationMs: number,  // Clips shorter than this won't be saved
  // FIXME: move magic numbers into UI controls
  silenceThresholdDbfs = -60,
  recordingPeriodExtensionMs = 500,  // How much audio is retained in each clip before and after silence
  ): () => void {
  // Compute remaining time periods
  // NOTE: there appears to be an undocumented minimum chunk size value o ~60ms (on Firefox at least).
  // Below 60ms, this implementation breaks since it relies on the chunk size being valid to trim the audio correctly.
  // FIXME: split audio based on samples/timestamps rather than relying on the recorder to work properly
  const chunkSizeMs = 100;  // pretty arbitrary; tradeoff between precision and performance
  const timeToTrimFromRecordingEndMs = silenceDetectionPeriodMs - 2 * recordingPeriodExtensionMs
  const numChunksToTrimFromRecordingEnd = timeToTrimFromRecordingEndMs / chunkSizeMs;
  const numChunksForInsignificantClip = insignificantClipDurationMs / chunkSizeMs;

  // Set up AudioContext
  const audioCtx = new AudioContext();
  const sourceNode = audioCtx.createMediaStreamSource(mediaStream);

  // Record from stream on a delay to allow capturing audio
  // from before recording is triggered
  const delayNode = new DelayNode(audioCtx, {
    delayTime: recordingPeriodExtensionMs / 1000,
    maxDelayTime: recordingPeriodExtensionMs / 1000,
  });
  const destinationNode = audioCtx.createMediaStreamDestination();
  sourceNode.connect(delayNode).connect(destinationNode);
  const recorder = new MediaRecorder(destinationNode.stream);

  let chunks: Blob[] = []
  recorder.ondataavailable =
    function(e) {
        chunks.push(e.data);
    }

  recorder.onstop =
    function(e) {
      if (chunks.length <= numChunksForInsignificantClip) {
        // Drop this clip as it's too short to be an actual recording
        console.log("Skipping Audio conversion as number of chunks", chunks.length, "<=", numChunksForInsignificantClip)
      } else {
        // Convert recorded audio, trimming off the final silence
        console.log("Converting Audio as number of chunks", chunks.length, ">", numChunksForInsignificantClip, "- trimming", numChunksToTrimFromRecordingEnd)
        const blob = new Blob(chunks.slice(0, chunks.length - numChunksToTrimFromRecordingEnd), { 'type' : 'audio/ogg; codecs=opus' });
        const newClip = {
          name: randomWords({exactly: 1, wordsPerString: 2, separator: '-'})[0],  // Returns array for some reason
          url: window.URL.createObjectURL(blob)
        }
        console.log("Generated clip", newClip);
        onNewClip(newClip)
      }

      // Reset for next recording
      chunks = [];
    }

  // Detect silence on the live audio
  const stopSilenceDetection = detectSilence(
    audioCtx,
    sourceNode,
    silenceDetectionPeriodMs,
    silenceThresholdDbfs,
    () => recorder.start(chunkSizeMs),
    // FIXME: since the recorder is on a delay line, this math is correct,
    // but it prevents a silence duration of 0 from reporting the full silence detection period
    // Need to rethink how the delay line works to get this to work
    (silenceDurationMs: number) => onTimeUntilClipEndsMs(Math.max(silenceDetectionPeriodMs - (silenceDurationMs + recordingPeriodExtensionMs), 0)),
    () => recorder.stop(),
  );

  // Cleanup Function
  return () => {
    stopSilenceDetection()
    if (recorder.state === 'recording')
    {
      // If a recording was in progress, get that recording
      // FIXME: prevent trimming end of audio in this case
      recorder.stop()
    }
    audioCtx.close()
    mediaStream.getTracks().forEach(track => track.stop());
    console.log('Ran cleanup function for recording routine')
    //FIXME: this leaks the 'recorder'.  No clue how to resolve this
  }
}

export default recordAudioClips;