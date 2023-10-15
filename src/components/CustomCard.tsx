import React from 'react';
import {View} from 'react-native';
import {Surface, useTheme} from 'react-native-paper';


export const CustomCard = (props: React.ComponentPropsWithRef<typeof View> ) => {
  const theme = useTheme();
  return (
    <Surface style={[{
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      padding: 10,
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 1,
    }, props.style]}>
      {props.children}
    </Surface>
  );
};
