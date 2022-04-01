import WebView from 'react-native-webview';
import React from 'react';

interface Props {
    html: string;
}

export const StaticHtmlViewer = (props: Props) => {
  return (
    <WebView
      source={{html: props.html}}
    />
  );
};
