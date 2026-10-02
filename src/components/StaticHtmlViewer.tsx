import WebView from 'react-native-webview';
import React from 'react';
import {toHtmlDocument} from '../helper/htmlDocument';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
    html: string;
    title: string;
}

export const StaticHtmlViewer = (props: Props) => {
  const {colors} = useAppTheme();

  return (
    <WebView
      javaScriptEnabled={false}
      source={{html: toHtmlDocument(props.html, colors)}}
      style={{backgroundColor: colors.background}}
    />
  );
};
