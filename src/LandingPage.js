import { Button, Alert, TextField } from '@mui/material';
import { Masonry } from '@mui/lab';

function testEvent(event) {
  console.log(`Event: ${event.target.value}`)
}

function LandingPage() {
  return (
    <Masonry columns={1} spacing={2} className="App">
      <h2>Muesli Practice Helper</h2>
      <Alert severity="error">ErroR</Alert>
      <Alert severity="warning">WarninG</Alert>
      <Alert severity="info">InfO</Alert>
      <Alert severity="success">BEES?!?</Alert>
      <Button
        fullWidth
        color="primary"
        onClick={testEvent}
      >
        Start a New Recording Session
      </Button>
      <TextField
        fullWidth
        id="text-field-attach-session"
        label="Attach to Another Session"
        placeholder="Enter Six-Digit Session ID..."
        onChange={testEvent}
      />
    </Masonry>
  );
}

export default LandingPage;
