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
    <iframe
      title={props.title}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      srcDoc={toHtmlDocument(props.html, colors)}
      style={{flex: 1, width: '100%', height: '100%', border: 'none'}}
    />
  );
};
