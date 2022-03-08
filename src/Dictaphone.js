import {
  Box,
  Checkbox,
  Grid,
  InputAdornment,
  Tooltip,
  FormGroup,
  FormControlLabel,
  TextField,
  Stack,
} from '@mui/material';
import React, {
  useRef,
  useState,
} from "react";
import ToggleButton from './ToggleButton.tsx';
import AudioDisplay from './AudioDisplay.js';
import useKeypress from 'react-use-keypress';

import recordAudioClips from './Recorder'
import NumberTextField from './NumberTextField';
import './App.css'

// Bug/Feature list:
// TODO: Should NOT trim audio at all when the user invokes "Stop Recording"
// TODO: Spacebar should pause/play the MOST RECENTLY CLICKED-ON AudioDisplay and do nothing else
// TODO: Status icon when capturing clips
// TODO: (s) adorment on recording timing controls
// TODO: add silence calibration button

function Dictaphone(props) {
  // Set/cleared when the user toggles recording
  const recordingCleanupFunction = useRef();
  //TODO: disambiguate between mic open and actually recording
  const [isRecording, setRecordingState] = useState()
  const [insignificantClipDurationMs, setInsignificantClipDurationMs] = useState(1000)
  const [silenceDetectionPeriodMs, setSilenceDetectionPeriodMs] = useState(2000)

  useKeypress('r', (event) => {
    if (event.altKey) {
      toggleRecording()
    }
  });

  const [audioClips, setAudioClips] = useState([])

  function toggleRecording() {
    if (isRecording) {
      recordingCleanupFunction.current();
      recordingCleanupFunction.current = null;
      setRecordingState(false)
    }
    else {
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      }).then(mediaStream => {
        recordingCleanupFunction.current =
          recordAudioClips(
            mediaStream,
            addAudioClip,
            silenceDetectionPeriodMs,
            insignificantClipDurationMs,
          )
      }
      )
      setRecordingState(true)
    }
  }

  function addAudioClip(newClip) {
    setAudioClips(clips => [newClip, ...clips])  // Most recent clip first
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
      <h2>Dictaphone WIP "Pumblechook"</h2>
      <Grid container spacing={2}>
        <Grid item id="controls" xs={5} sm={4} md={3} lg={2}>
          <Stack spacing={2}>
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
              placeholder="(debug only)"
              onChange={(e) => setAudioClips([{ url: e.target.value }])}
            />

            <NumberTextField
              disabled={isRecording}
              label="Cut clip when silent for"
              placeholder="Time..."
              InputProps={{
                endAdornment: <InputAdornment position="end">s</InputAdornment>,
              }}
              defaultValue={silenceDetectionPeriodMs / 1000}
              minValue={1}
              maxValue={15}
              onChange={(value) => setSilenceDetectionPeriodMs(value * 1000)}
            />

            <NumberTextField
              disabled={isRecording}
              label="Discard clips shorter than"
              placeholder="Time..."
              InputProps={{
                endAdornment: <InputAdornment position="end">s</InputAdornment>,
              }}
              defaultValue={insignificantClipDurationMs / 1000}
              minValue={0}
              maxValue={5}
              onChange={(value) => setInsignificantClipDurationMs(value * 1000)}
            />

            <FormGroup>
              <FormControlLabel control={<Checkbox onChange={(e) => setLoop(e.target.checked)} />} label="Loop" />
              <FormControlLabel control={<Checkbox onChange={(e) => setAutoplay(e.target.checked)} />} label="Autoplay" />
            </FormGroup>
          </Stack>
        </Grid>
        <Grid item id="clips" xs={7} sm={8} md={9} lg={10}>
          <Stack spacing={2}>
            {/* FIXME: Update key with some server-sidable ID instead of the URL?*/}
            {audioClips.map(clip => <AudioDisplay key={clip.url} name={clip.name} audioPath={clip.url} autoplay={autoplay} loop={loop} />)}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dictaphone;
