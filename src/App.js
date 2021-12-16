import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './App.css';

import LandingPage from './LandingPage.js';
import Dictaphone from './Dictaphone.js';
import Sandbox from './Sandbox.js';

function App() {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* <LandingPage /> */}
      <Dictaphone />
    </ThemeProvider>
  );
}

export default App;
