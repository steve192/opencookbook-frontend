import React from 'react';
import {View} from 'react-native';
import {IconButton, List, Switch} from 'react-native-paper';
import {Aisle} from '../api/aisles';
import {ShoppingIcon} from './shopping/ShoppingIcon';

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

export const switchSide = (value: boolean, onChange: (value: boolean) => void, label: string,
    disabled = false): ListSide => function SideSwitch() {
  return <Switch value={value} onValueChange={onChange} accessibilityLabel={label} disabled={disabled} />;
};

export const shoppingIconSide = (icon: string | null, aisle: Aisle): ListSide => function SideShoppingIcon(props) {
  return <View style={props.style}><ShoppingIcon icon={icon} aisle={aisle} size={28} /></View>;
};
