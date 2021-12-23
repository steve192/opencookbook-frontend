import {Layout, LayoutProps, useTheme} from '@ui-kitten/components';
import React from 'react';


export const CustomCard = (props: LayoutProps) => {
  const theme = useTheme();
  return (
    <Layout style={[{
      borderWidth: 1,
      borderColor: theme['background-basic-color-4'],
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
    </Layout>
  );
};
