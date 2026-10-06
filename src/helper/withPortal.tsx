import React from 'react';
import {Portal} from 'react-native-paper';

/**
 * Renders a component inside a Paper portal, its state included. A portal hands its children to the
 * host one render late, so a field whose text is held outside it gets each keystroke back late and
 * the cursor jumps: typing comes out backwards.
 *
 * @param {React.ComponentType} Component a dialog or modal holding its own state
 * @return {React.ComponentType} the same component, rendered in a portal
 */
export const withPortal = <P extends object>(Component: React.ComponentType<P>) => {
  const InPortal = (props: P) => (
    <Portal>
      <Component {...props} />
    </Portal>
  );
  return InPortal;
};
