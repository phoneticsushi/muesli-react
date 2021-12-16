import Box from '@mui/material/Box';
import { Grid, Paper } from '@mui/material';
import { Masonry } from '@mui/lab';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo
} from "react";
import WaveSurfer from "wavesurfer.js";
import { useTheme } from '@mui/material/styles';

function Sandbox(props) {
  const theme = useTheme()
  const waveSurferDomRef = useRef();
  const [waveSurfer, setWaveSurfer] = useState();

  // Debugging
  const [waveSurferLoadCount, setWaveSurferLoadCount] = useState(0);
  const [updatedPropsCount, setUpdatedPropsCount] = useState(0);

  useEffect(
    () => {
      setWaveSurferLoadCount(waveSurferLoadCount + 1)  //Debugging 

      // WaveSurfer requires the DOM in which it's rendered
      // to be loaded on the page before calling its create function.
      // To compensate, we initialize the WaveSurfer object once as a side-effect
      console.log(waveSurfer)
      if (waveSurferDomRef.current) {
        const newWaveSurfer =
          WaveSurfer.create(
            {
              container: waveSurferDomRef.current,
              responsive: true,
              waveColor: theme.palette.primary.dark,
              progressColor: theme.palette.secondary.dark,
            }
          )
        // newWaveSurfer.on('seek', function () {  // Debugging
        //   newWaveSurfer.play();
        // });

        setWaveSurfer(newWaveSurfer);

        // returned function will be called on component unmount
        return () => {
          newWaveSurfer.destroy()
        }
      }
    },
    []   // <-- empty dependency array implies 'run once'
  );

  useEffect(
    () => {
      if (waveSurfer && !waveSurfer.isDestroyed) {
        if (props.audioPath) {
          waveSurfer.load(props.audioPath);
        } else {
          waveSurfer.empty()
        }
      }
      setUpdatedPropsCount(updatedPropsCount + 1)  //Debugging
    },
    [props.audioPath, waveSurfer],
  );

  function play() {
    waveSurfer.play();
  }

  return (
    <Box>
      <h2>Sandbox</h2>
      <p>WaveSurfer load count: {waveSurferLoadCount}</p>
      <p>Updated props count: {updatedPropsCount}</p>
      <p>Audio Path: {props.audioPath}</p>
      <div ref={waveSurferDomRef}></div>
      <button onClick={play}>PLAY MUSIC LOL</button>
    </Box>
  );
}

export default Sandbox;
