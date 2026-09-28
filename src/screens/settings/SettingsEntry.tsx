import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Card, Icon} from 'react-native-paper';

interface Props {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}

type SideProps = {size: number};

const avatarOf = (icon: string) => function EntryAvatar({size}: SideProps) {
  return <Avatar.Icon size={size} icon={icon} />;
};

// The whole card is the button; the chevron only says where it leads.
const Chevron = ({size}: SideProps) => (
  <View style={styles.chevron}><Icon source="chevron-right" size={size} /></View>
);

// One entry of the settings overview, leading to a screen of its own.
export const SettingsEntry = (props: Props) => (
  <Card onPress={props.onPress} accessibilityRole="button">
    <Card.Title
      title={props.title}
      subtitle={props.subtitle}
      subtitleNumberOfLines={2}
      left={avatarOf(props.icon)}
      right={Chevron} />
  </Card>
);

const styles = StyleSheet.create({
  chevron: {marginRight: 14},
});
