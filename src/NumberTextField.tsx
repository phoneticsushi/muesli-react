import { TextField } from '@mui/material';
import { ChangeEvent, useState } from "react";

type NumberComponentProps = {
  minValue?: number,
  maxValue?: number,
  onChange?: (validatedInput: number) => void;  // FIXME: is this idiomatic or should it fire an event?
}

function NumberTextField(props: NumberComponentProps) {
  const [inputHasError, setInputHasError] = useState(false);

  function ingestInput(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const inputValue = Number(e.target.value)
    if (
      !e.target.value.trim()  // Input string is whitespace
      || isNaN(inputValue)
      || (props.minValue && inputValue < props.minValue)
      || (props.maxValue && inputValue > props.maxValue)
    ) {
      setInputHasError(true)
    } else {
      setInputHasError(false)
      if (props.onChange) {
        // Pass event through
        props.onChange(inputValue)
      }
    }
  }

  function prepareHelperText(): string | undefined {
    if (inputHasError) {
      if (props.minValue && props.maxValue) {
        return `Value must be a number between ${props.minValue} and ${props.maxValue}`
      } else if (props.minValue) {
        return `Value must be a number at least ${props.minValue}`
      } else if (props.maxValue) {
        return `Value must be a number at most ${props.maxValue}`
      } else {
        return "Value must be a number"
      }
    } else {
      return undefined
    }
  }

  const { minValue, maxValue, onChange, ...passthroughProps } = props

  return (
    <TextField
      error={inputHasError}
      onChange={(text) => ingestInput(text)}
      helperText={prepareHelperText()}
      {...passthroughProps}
    />
  )
}

export default NumberTextField;
