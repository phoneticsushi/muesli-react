import { Box, Tooltip, Checkbox, FormGroup, FormControlLabel, TextField } from '@mui/material';
import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import ToggleButton from './ToggleButton.js';
import AudioDisplay from './AudioDisplay.js';
import useKeypress from 'react-use-keypress';

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
  console.log('detect silience')
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
        triggered = false;
        onSoundStart();
        }
      silence_start = time; // set it to now
    }
    if (!triggered && time - silence_start > silence_delay) {
      onSoundEnd();
      triggered = true;
    }
  }
  loop();
}

function startThaNoize() {
  console.log('Sound Started');
}

function endThaNoize() {
  console.log('Sound Ended');
}

function detectionTerminated() {
  console.log('Detection Terminated');
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

  const [mediaRecorder, setMediaRecorder] = useState()
  const chunksRef = useRef()
  const [audioURL, setAudioURL] = useState()

  function toggleRecording() {
    if (isRecording)
    {
      //mediaRecorder.stop();
      releaseMicrophone(mediaStreamRef);
      setRecordingState(false)
    }
    else
    {
      getMicrophone().then(stream => {
        mediaStreamRef.current = stream
        detectSilence(mediaStreamRef, startThaNoize, endThaNoize, detectionTerminated);
      });
      setRecordingState(true)

      // mediaRecorder.start();
  
      // // TODO: remove shim that sets most recent audio as audioURL
      // chunksRef.current = [];

      // mediaRecorder.ondataavailable = function(e) {
      //   chunksRef.current.push(e.data);
      // }

      // mediaRecorder.onstop = function(e) {
      //   console.log("recorder stopped");

      //   const blob = new Blob(chunksRef.current, { 'type' : 'audio/ogg; codecs=opus' });
      //   chunksRef.current = [];
      //   const audioURL = window.URL.createObjectURL(blob);
      //   console.log(audioURL);
      //   setAudioURL(audioURL)
      // }
    }
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
        onChange={(e) => setAudioURL(e.target.value)}
      />
      <FormGroup>
        <FormControlLabel control={<Checkbox onChange={(e) => setLoop(e.target.checked)} />} label="Loop" />
        <FormControlLabel control={<Checkbox onChange={(e) => setAutoplay(e.target.checked)} />} label="Autoplay" />
      </FormGroup>
      <AudioDisplay audioPath={audioURL} autoplay={autoplay} loop={loop}/>
    </Box>
  );
}

export default Dictaphone;
