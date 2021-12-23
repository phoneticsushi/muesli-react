import { Button } from '@mui/material';

type ToggleButtonProps = {
  enabled: boolean,
  enableText: string,
  disableText: string
}

function ToggleButton(props: ToggleButtonProps) {
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
