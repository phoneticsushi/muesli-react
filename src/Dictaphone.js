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
  console.log('GET MIC')
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });
  return stream;
}

function releaseMicrophone(handle) {
  console.log(handle)
  handle.getTracks().forEach(track => track.stop());
  console.log('RELEASE MIC')
}

function Dictaphone(props) {
  // Idiom for component-bound state with cleanup
  const [mediaStream, setMediaStream] = useState()
  const mediaStreamRef = useRef();

  useEffect(() => {
    getMicrophone().then(stream => {
      mediaStreamRef.current = stream
      setMediaRecorder(new MediaRecorder(stream));
    });
  }, [mediaStream]);

  useEffect(() => {
    return function cleanup() {
      if (mediaStreamRef.current) {
        releaseMicrophone(mediaStreamRef.current);
      }
    };
  }, []);

  useKeypress('r', (event) => {
    if (event.altKey) {
      toggleRecording()
    }
  });

  const [mediaRecorder, setMediaRecorder] = useState()
  const chunksRef = useRef()
  const [audioURL, setAudioURL] = useState()

  function startRecording() {
    mediaRecorder.start();
    setRecordingState(mediaRecorder.state)
    console.log(mediaRecorder.state);
    console.log("recorder started");
  
    chunksRef.current = [];

    mediaRecorder.ondataavailable = function(e) {
      chunksRef.current.push(e.data);
    }

    mediaRecorder.onstop = function(e) {
      console.log("recorder stopped");

      const blob = new Blob(chunksRef.current, { 'type' : 'audio/ogg; codecs=opus' });
      chunksRef.current = [];
      const audioURL = window.URL.createObjectURL(blob);
      console.log(audioURL);
      setAudioURL(audioURL)
    }
  }

  function stopRecording() {
    mediaRecorder.stop();
    setRecordingState(mediaRecorder.state)
    console.log(mediaRecorder.state);
    console.log("recorder stopped");
  }
  
  //TODO: consolidate start and stop recording into one function when removing console logs
  function toggleRecording() {
    if (recordingState === "recording")
    {
      stopRecording()
    }
    else
    {
      startRecording()
    }
  }

  const [recordingState, setRecordingState] = useState()

  // For debugging state transitions on AudioDisplay
  const [loop, setLoop] = useState(false)  // default to match checkbox
  const [autoplay, setAutoplay] = useState(false)  // default to match checkbox

  // FIXME: for some reason, wrapping the ToggleButton in Tooltip here
  // only displays the Tooltip when after the first time the Button is clicked
  return (
    <Box>
      <h2>Dictaphone WIP</h2>
      <Tooltip title="Toggle with Alt-R" arrow>
        <ToggleButton
          enabled={recordingState === "recording"}
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
