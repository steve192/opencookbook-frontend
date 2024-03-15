import React from 'react';
import {MD3Theme, Snackbar, withTheme} from 'react-native-paper';

interface Options {
  message: string;
  button1?:string;
  button1Callback?: () => void;
  button2?: string;
  button2Callback?: () => void ;
}
interface State extends Options{
  shown: boolean;
}

interface Props {
  theme: MD3Theme
}
class SnackbarWithoutStyles extends React.Component<Props, State> {
  private static component: SnackbarWithoutStyles;
  constructor(props: Props) {
    super(props);
    SnackbarWithoutStyles.component = this;
    this.state = {
      shown: false,
      message: '',
      button1: '',
      button1Callback: undefined,
    };
  }

  render() {
    return <Snackbar
      duration={20000}
      theme={this.props.theme}
      visible={this.state.shown}
      onDismiss={() => this.setState({shown: false})}
      action={this.state.button1 ? {
        label: this.state.button1,
        onPress: this.state.button1Callback,
        buttonColor: this.props.theme.colors.primary,
        textColor: this.props.theme.colors.onPrimary
      }: undefined}>
      {this.state.message}
    </Snackbar>;
  }


  componentDidMount() {
    SnackbarWithoutStyles.component = this;
  }

  public static show(options: Options) {
    this.component.setState({...options, shown: true});
  }
}
export const SnackbarUtil = {
  show: (options: Options) => {
    SnackbarWithoutStyles.show(options);
  },
};

export const GlobalSnackbar = withTheme(SnackbarWithoutStyles);
