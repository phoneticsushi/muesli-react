import {
  Box,
  Checkbox,
  Grid,
  InputAdornment,
  LinearProgress,
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
// TODO: Spacebar should pause/play the MOST RECENTLY CLICKED-ON AudioDisplay and do nothing else
// TODO: Status icon when capturing clips
// TODO: (s) adorment on recording timing controls
// TODO: add silence calibration button

function Dictaphone(props) {
  // Set/cleared when the user toggles recording
  const recordingCleanupFunction = useRef();
  // Recording State
  const [isMicrophoneOpen, setMicrophoneOpen] = useState()
  const [timeUntilClipEndsMs, setTimeUntilClipEndsMs] = useState()
  const [averageVolume, setAverageVolume] = useState()
  // Preferences
  const [insignificantClipDurationMs, setInsignificantClipDurationMs] = useState(1000)
  const [silenceDetectionPeriodMs, setSilenceDetectionPeriodMs] = useState(3000)

  useKeypress('r', (event) => {
    if (event.altKey) {
      toggleMicrophoneOpen()
    }
  });

  const [audioClips, setAudioClips] = useState([])

  function toggleMicrophoneOpen() {
    if (isMicrophoneOpen) {
      recordingCleanupFunction.current();
      recordingCleanupFunction.current = null;
      setMicrophoneOpen(false)
      setTimeUntilClipEndsMs(0)
    }
    else {
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      }).then(mediaStream => {
        recordingCleanupFunction.current =
          recordAudioClips(
            mediaStream,
            setAverageVolume,
            setTimeUntilClipEndsMs,  // May need to be throttled for performance
            addAudioClip,
            silenceDetectionPeriodMs,
            insignificantClipDurationMs,
          )
      }
      )
      setMicrophoneOpen(true)
    }
  }

  function addAudioClip(newClip) {
    setAudioClips(clips => [newClip, ...clips])  // Most recent clip first
  }

  // FIXME: does not distinguish the first time through where no recording takes place
  function getProgressUntilClipEnd() {
    return timeUntilClipEndsMs / silenceDetectionPeriodMs * 100
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
      <h2>Muesli Practice Helper</h2>
      <Grid container spacing={2}>
        <Grid item id="controls" xs={5} sm={4} md={3} lg={2}>
          <Stack spacing={2}>
            <Tooltip title="Toggle with Alt-R" arrow>
              <ToggleButton
                enabled={isMicrophoneOpen}
                enableText="Start Recording"
                disableText="Stop Recording"
                onClick={toggleMicrophoneOpen}
              />
            </Tooltip>

            <p>Mic Open: {String(isMicrophoneOpen)}</p>
            <p>Average Volume: {String(averageVolume)}</p>
            <p>Time until Clip: {String(Math.floor(timeUntilClipEndsMs / 100) / 10)} seconds</p>

            {/* FIXME: flip horizontally? */}
            <LinearProgress
              variant="determinate"
              value={getProgressUntilClipEnd()}
            />

            <TextField
              label="Custom Audio File Path"
              placeholder="(debug only)"
              onChange={(e) => setAudioClips([{ url: e.target.value }])}
            />

            <NumberTextField
              disabled={isMicrophoneOpen}
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
              disabled={isMicrophoneOpen}
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
