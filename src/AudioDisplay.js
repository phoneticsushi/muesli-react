import { useEffect, useRef, useState, } from "react";
import { Box, Button } from '@mui/material';
import WaveSurfer from "wavesurfer.js";
import { useTheme } from '@mui/material/styles';

function AudioDisplay(props) {
  const theme = useTheme()

  const waveSurferDomRef = useRef();
  const waveSurferRef = useRef();

  const [loadingProgress, setLoadingProgress] = useState();

  // Debugging
  const [waveSurferLoadCount, setWaveSurferLoadCount] = useState(0);
  const [updatedPropsCount, setUpdatedPropsCount] = useState(0);

  useEffect(
    () => {
      setWaveSurferLoadCount(waveSurferLoadCount + 1)  //Debugging 

      // WaveSurfer requires the DOM in which it's rendered
      // to be loaded on the page before calling its create function.
      // To compensate, we initialize the WaveSurfer object once as a side-effect
      waveSurferRef.current =
        WaveSurfer.create(
          {
            container: waveSurferDomRef.current,
            responsive: true,
          }
        )
      waveSurferRef.current.on('loading', progress => { setLoadingProgress(progress) })

      // returned function will be called on component unmount
      return () => {
        waveSurferRef.current.destroy()
        waveSurferRef.current = null
      }
    },
    []   // <-- empty dependency array implies 'run once'
  );

  useEffect(
    () => {
      // Setting these values here instead of during WaveSurfer.create()
      // so component remains fully responsive
      waveSurferRef.current?.setWaveColor(theme.palette.primary.dark)
      waveSurferRef.current?.setProgressColor(theme.palette.secondary.dark)
    },
    [theme.palette.primary.dark, theme.palette.secondary.dark]
  );

  useEffect(
    () => {
      if (props.autoplay) {
        waveSurferRef.current?.on('ready', play);
      }
      else {
        waveSurferRef.current?.un('ready');
      }
    },
    [props.autoplay],
  )

  useEffect(
    () => {
      if (props.audioPath) {
        waveSurferRef.current?.load(props.audioPath);
      } else {
        waveSurferRef.current?.empty()
      }
      setUpdatedPropsCount(updatedPropsCount + 1)  //Debugging
    },
    [props.audioPath],
  );

  useEffect(
    () => {
      if (props.loop) {
        waveSurferRef.current?.on('finish', play);
      }
      else {
        waveSurferRef.current?.un('finish');
      }
    },
    [props.loop]
  );

  function play() {
    waveSurferRef.current?.play();
  }

  function pause() {
    waveSurferRef.current?.pause();
  }

  return (
    <Box>
      <h2>AudioDisplay WIP</h2>
      <p>WaveSurfer load count: {waveSurferLoadCount}</p>
      <p>Updated props count: {updatedPropsCount}</p>
      <p>Audio Path: {props.audioPath}</p>
      <p>Loading Progress: {loadingProgress}</p>
      <div ref={waveSurferDomRef}></div>
      <Button onClick={play}>Play Audio</Button>
      <Button onClick={pause}>Pause Audio</Button>
    </Box>
  );
}

export default AudioDisplay;
