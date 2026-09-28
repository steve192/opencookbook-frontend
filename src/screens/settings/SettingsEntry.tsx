import React from 'react';
import {Avatar, Card, IconButton} from 'react-native-paper';

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

// One entry of the settings overview, leading to a screen of its own.
export const SettingsEntry = (props: Props) => (
  <Card onPress={props.onPress}>
    <Card.Title
      title={props.title}
      subtitle={props.subtitle}
      subtitleNumberOfLines={2}
      left={(iconProps) => <Avatar.Icon {...iconProps} icon={props.icon} />}
      right={(iconProps) => <IconButton {...iconProps} icon="chevron-right" onPress={props.onPress} />} />
  </Card>
);
