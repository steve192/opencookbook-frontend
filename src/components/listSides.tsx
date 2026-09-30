import React from 'react';
import {IconButton, List} from 'react-native-paper';

// What a List.Item shows beside its text, made here so no screen defines a component while rendering.

// The right side's type: it fits the left side too, whose style is never missing.
type ListSide = NonNullable<React.ComponentProps<typeof List.Item>['right']>;

export interface SideAction {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export const iconSide = (icon: string): ListSide => function SideIcon(props) {
  return <List.Icon {...props} icon={icon} />;
};

export const actionsSide = (actions: SideAction[]): ListSide => function SideActions() {
  return (
    <>
      {actions.map((action) => (
        <IconButton key={action.icon} icon={action.icon} accessibilityLabel={action.label} onPress={action.onPress}
          disabled={action.disabled} />
      ))}
    </>
  );
};
