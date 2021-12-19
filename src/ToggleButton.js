import { Button } from '@mui/material';

function ToggleButton(props) {
  return (
    <Button
      color={props.enabled ? "error" : "success"}
      {...props}
    >
      {props.enabled ? (props.disableText || "Disable") : (props.enableText || "Enable")}
    </Button>
  );
}

export default ToggleButton;
