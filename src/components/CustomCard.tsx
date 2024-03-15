import React from 'react';
import {View} from 'react-native';
import {Surface} from 'react-native-paper';
import {useAppTheme} from '../styles/CentralStyles';


export const CustomCard = (props: React.ComponentPropsWithRef<typeof View> ) => {
  const theme = useAppTheme();
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
