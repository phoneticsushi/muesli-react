import { Box, Tooltip, Checkbox, FormGroup, FormControlLabel, TextField } from '@mui/material';
import React, {
  useRef,
  useState,
} from "react";
import ToggleButton from './ToggleButton.js';
import AudioDisplay from './AudioDisplay.js';
import useKeypress from 'react-use-keypress';

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
  streamRef,
  onSoundStart = _=> {},
  onSoundEnd = _=> {},
  onDetectionTerminate = _=> {},
  silence_delay = 2000,  // in ms
  min_decibels = -70
  ) {
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  const streamNode = ctx.createMediaStreamSource(streamRef.current);
  streamNode.connect(analyser);
  analyser.minDecibels = min_decibels;

  // FIXME: does this leak memory?
  const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
  let silence_start = performance.now();
  let triggered = false; // trigger only once per silence event

  function loop(time) {
    if (streamRef.current == null)
    {
      onDetectionTerminate();
      return;
    }

    requestAnimationFrame(loop); // we'll loop every 60th of a second to check
    analyser.getByteFrequencyData(data); // get current data
    if (data.some(v => v)) { // if there is data above the given db limit
      if(triggered){
        onSoundStart();
        triggered = false;
        console.log("Audio Started")
        }
      silence_start = time; // set it to now
    }
    if (!triggered && time - silence_start > silence_delay) {
      onSoundEnd();
      triggered = true;
      console.log("Audio Stopped")
    }
  }
  loop();
}

function Dictaphone(props) {
  // Set/cleared when the user toggles recording
  const mediaStreamRef = useRef();
  const [isRecording, setRecordingState] = useState()

  useKeypress('r', (event) => {
    if (event.altKey) {
      toggleRecording()
    }
  });

  const [audioURLs, setAudioURLs] = useState([])

  function toggleRecording() {
    if (isRecording)
    {
      releaseMicrophone(mediaStreamRef);
      setRecordingState(false)
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

  // Relies on setAudioURLs
  function recordAudioClips(streamRef, silenceLengthMs = 2000) {
    const recorder = new MediaRecorder(streamRef.current);
    let chunks = []
    // FIXME: move magic numbers into UI controls
    const chunkSizeMs = 50
    const numSilenceChunks = silenceLengthMs / chunkSizeMs

    recorder.ondataavailable =
      function(e) {
          chunks.push(e.data);
      }

    recorder.onstop =
      function(e) {
        // FIXME: don't do this - find a way to trim the audio instead
        // will be required for pre-recording due to the way
        // audio metadata is embedded in the first chunk
        // i.e. can't simply drop the first chunk
        if (chunks.length <= numSilenceChunks) {
          // Drop this clip as it's too short to be an actual recording
          console.log("Skipping Audio conversion as number of chunks", chunks.length, "<", numSilenceChunks)
        } else {
          // Convert recorded audio, trimming off the final silence
          console.log("Converting Audio as number of chunks", chunks.length, ">", numSilenceChunks)
          const blob = new Blob(chunks.slice(0, chunks.length - numSilenceChunks), { 'type' : 'audio/ogg; codecs=opus' });
          const newAudioURL = window.URL.createObjectURL(blob);
          console.log("Generated clip", newAudioURL);
          setAudioURLs(audioURLs => [newAudioURL, ...audioURLs])  // Most recent clip first
        }

        // Reset for next recording
        chunks = [];
      }

    // FIXME: Why the heck does this work but (streamRef, recorder.start, recorder.stop) doesn't?
    detectSilence(
      streamRef,
      _ => recorder.start(chunkSizeMs),
      _ => recorder.stop(),
      _=> {},  // Do nothing special when the detection routine terminates
      silenceLengthMs,
      -70  // TODO: remove magic number
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
    <Box>
      <h2>Dictaphone WIP</h2>
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
        onChange={(e) => setAudioURLs([e.target.value])}
      />
      <FormGroup>
        <FormControlLabel control={<Checkbox onChange={(e) => setLoop(e.target.checked)} />} label="Loop" />
        <FormControlLabel control={<Checkbox onChange={(e) => setAutoplay(e.target.checked)} />} label="Autoplay" />
      </FormGroup>
      {/* FIXME: update key with some sort of name? */}
      {audioURLs.map(url => <AudioDisplay key={url} audioPath={url} autoplay={autoplay} loop={loop}/>)}
    </Box>
  );
}

export default Dictaphone;
