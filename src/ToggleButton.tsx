import { Button } from '@mui/material';

type ToggleButtonProps = {
  enabled?: boolean,
  enableText?: string,
  disableText?: string
}

function ToggleButton(props: ToggleButtonProps) {
  const {enabled, enableText, disableText, ...passthroughProps} = props

  return (
    <Button
      color={props.enabled ? "error" : "success"}
      {...passthroughProps}
    >
      {props.enabled ? (props.disableText || "Disable") : (props.enableText || "Enable")}
    </Button>
  );
}

export default ToggleButton;
