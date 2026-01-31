import { ComponentProps, useRef } from 'react';
import { GestureResponderEvent } from 'react-native';
import { Button } from './button';

interface DoubleTapButtonProps extends ComponentProps<typeof Button> {
  onDoublePress: () => void;
}
export function DoubleTapButton({
  onDoublePress,
  onPress,
  ...props
}: DoubleTapButtonProps) {
  const timeoutRef = useRef<number | null>(null);

  function handlePress(e: GestureResponderEvent) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      onDoublePress();
    } else {
      timeoutRef.current = setTimeout(() => {
        onPress?.(e);
        timeoutRef.current = null;
      }, 300);
    }
  }

  return <Button {...props} onPress={handlePress} />;
}
