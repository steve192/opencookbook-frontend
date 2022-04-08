import React from 'react';
import {View} from 'react-native';
import {Colors, Surface} from 'react-native-paper';


export const CustomCard = (props: React.ComponentPropsWithRef<typeof View> ) => {
  return (
    <Surface style={[{
      borderWidth: 1,
      borderColor: Colors.grey300,
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
