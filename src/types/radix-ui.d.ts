declare module '@radix-ui/react-slot' {
  import * as React from 'react';

  interface SlotProps {
    children?: React.ReactNode;
  }

  export const Slot: React.ForwardRefExoticComponent<SlotProps & React.RefAttributes<HTMLElement>>;
}