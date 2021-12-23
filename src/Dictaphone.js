import { Box, Tooltip, Checkbox, FormGroup, FormControlLabel, TextField } from '@mui/material';
import React, {
  useRef,
  useState,
} from "react";
import ToggleButton from './ToggleButton.tsx';
import AudioDisplay from './AudioDisplay.js';
import useKeypress from 'react-use-keypress';
import randomWords from 'random-words';
import './App.css'

// Bug list:
// TODO: Need to collect 500ms or so of audio before and after the 
//       We need to be able to trim the MediaRecorder's output on the time (i.e. not chunk) axis
//       This can be faked by setting the time window really low and trimming on chunks
//       Won't work for triming the preceding audio if the first chunk contains important metadata
//       Worth a shot eh
// TODO: Should trim the "detected silence" window from the recording after a silence window
//       Should NOT trim at all when the user invokes "Stop Recording"
// TODO: Spacebar should pause/play the MOST RECENTLY CLICKED-ON AudioDisplay and do nothing else

async function getMicrophone() {
  console.log('Open Microphone')
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });
  return stream;
}

function releaseMicrophone(mediaStreamRef) {
  console.log('Release Microphone', mediaStreamRef)
  mediaStreamRef.current.getTracks().forEach(track => track.stop());
  mediaStreamRef.current = null
}

function detectSilence(
  audioCtx,
  sourceAudioNode,
  silence_delay_ms,
  min_decibels,
  onSoundStart = _=> {},
  onSoundEnd = _=> {},
  onDetectionTerminate = _=> {},
  ) {
  const analyserNode = new AnalyserNode(audioCtx, {
    minDecibels: min_decibels,
  });
  sourceAudioNode.connect(analyserNode);
  let streamClosed = false;
  sourceAudioNode.onended = function () {
        console.log('Silence Node Closed');
        streamClosed = true;
    };

  // FIXME: does this leak memory?
  const data = new Uint8Array(analyserNode.frequencyBinCount); // will hold our data
  let silence_start = performance.now();
  let activelyRecording = false; // trigger only once per silence event

  function loop(time) {
    if (streamClosed)
    {
      console.log("yes we have no bananas")
      onDetectionTerminate();
      return;
    }

    requestAnimationFrame(loop); // we'll loop every 60th of a second to check
    analyserNode.getByteFrequencyData(data); // get current data
    if (data.some(v => v)) { // if there is data above the given db limit
      if(!activelyRecording){
        onSoundStart();
        activelyRecording = true;
        console.log("Audio Started")
        }
      silence_start = time; // set it to now
    }
    if (activelyRecording && time - silence_start > silence_delay_ms) {
      onSoundEnd();
      activelyRecording = false;
      console.log("Audio Stopped")
    }
  }
  loop();
}

function Dictaphone(props) {
  // Set/cleared when the user toggles recording
  const mediaStreamRef = useRef();
  //TODO: disambiguate between mic open and actually recording
  const [isRecording, setRecordingState] = useState()
  const [recordingText, setRecordingText] = useState('First Load')

  useKeypress('r', (event) => {
    if (event.altKey) {
      toggleRecording()
    }
  });

  const [audioClips, setAudioClips] = useState([])

  function toggleRecording() {
    if (isRecording)
    {
      releaseMicrophone(mediaStreamRef);
      setRecordingState(false)
      setRecordingText('Recording is Off')
    }
    else
    {
      getMicrophone().then(stream => {
        mediaStreamRef.current = stream
        recordAudioClips(mediaStreamRef);
      });
      setRecordingState(true)
    }
  }

  // Relies on setAudioClips
  function recordAudioClips(
    streamRef,
    // FIXME: move magic numbers into UI controls
    silenceDetectionPeriodMs = 2000,
    recordingPeriodExtensionMs = 500,  // How much audio is retained in each clip before and after silence
    insignificantClipDurationMs = 1000,  // Clips shorter than this won't be saved
    ) {
    // Compute remaining time periods
    // NOTE: there appears to be an undocumented minimum chunk size value o ~60ms (on Firefox at least).
    // Below 60ms, this implementation breaks since it relies on the chunk size being valid to trim the audio correctly.
    // FIXME: split audio based on samples/timestamps rather than relying on the recorder to work properly
    const chunkSizeMs = 100;  // pretty arbitrary; tradeoff between precision and performance
    const numChunksToTrimFromRecordingEnd = (silenceDetectionPeriodMs - 2 * recordingPeriodExtensionMs) / chunkSizeMs;
    const numChunksForInsignificantClip = insignificantClipDurationMs / chunkSizeMs;

    // Set up AudioContext
    const audioCtx = new AudioContext();
    const sourceNode = audioCtx.createMediaStreamSource(streamRef.current);

    // Record from stream on a delay to allow capturing audio
    // from before recording is triggered
    const delayNode = new DelayNode(audioCtx, {
      delayTime: recordingPeriodExtensionMs / 1000,
      maxDelayTime: recordingPeriodExtensionMs / 1000,
    });
    const destinationNode = audioCtx.createMediaStreamDestination();
    sourceNode.connect(delayNode).connect(destinationNode);
    const recorder = new MediaRecorder(destinationNode.stream);

    let chunks = []
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
          setAudioClips(clips => [newClip, ...clips])  // Most recent clip first
        }

        // Reset for next recording
        chunks = [];
      }

    // TODO: inline these after debugging
    function startRec() {
      setRecordingText(`RECORDING with chunk size ${chunkSizeMs}`)
      recorder.start(chunkSizeMs)
    }

    function stopRec() {
      setRecordingText('Waiting for audio...')
      recorder.stop()
    }

    // Detect silence on the live audio
    // FIXME: Why the heck does this work but (..., recorder.start, recorder.stop) doesn't?
    detectSilence(
      audioCtx,
      sourceNode,
      silenceDetectionPeriodMs,
      -60,  // TODO: remove magic number
      _ => startRec(),
      _ => stopRec(),
      _=> {},  // Do nothing special when the detection routine terminates
    );
  }

  // For debugging state transitions on AudioDisplay
  const [loop, setLoop] = useState(false)  // default to match checkbox
  const [autoplay, setAutoplay] = useState(false)  // default to match checkbox

  // FIXME: for some reason, wrapping the ToggleButton in Tooltip here
  // only displays the Tooltip when after the first time the Button is clicked
  // This is due to the ToggleButton not containing a Ref since it's a function object
  // Need to either make it a class or find another way around
  return (
    <Box className="App">
      <h2>Dictaphone WIP "Effervescence"</h2>
      <Tooltip title="Toggle with Alt-R" arrow>
        <ToggleButton
          enabled={isRecording}
          enableText="Start Recording"
          disableText="Stop Recording"
          onClick={toggleRecording}
        />
      </Tooltip>
      <TextField
        label="Custom Audio File Path"
        placeholder="Hello hello"
        onChange={(e) => setAudioClips([{url: e.target.value}])}
      />
      {recordingText}
      <FormGroup>
        <FormControlLabel control={<Checkbox onChange={(e) => setLoop(e.target.checked)} />} label="Loop" />
        <FormControlLabel control={<Checkbox onChange={(e) => setAutoplay(e.target.checked)} />} label="Autoplay" />
      </FormGroup>
      {/* FIXME: Update key with some server-sidable ID instead of the URL?*/}
      {audioClips.map(clip => <AudioDisplay key={clip.url} name={clip.name} audioPath={clip.url} autoplay={autoplay} loop={loop}/>)}
    </Box>
  );
}

export default Dictaphone;
