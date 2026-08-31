import React from 'react';
import {MD3Theme, Snackbar, withTheme} from 'react-native-paper';
import i18n from 'i18next';

interface Options {
  message: string;
  button1?: string;
  button1Callback?: () => void;
  /** How long to leave it up. Defaults to long enough to read, not long enough to annoy. */
  duration?: number;
}
interface State extends Options{
  shown: boolean;
}

interface Props {
  theme: MD3Theme
}

/** Long enough to read a sentence. The old twenty seconds sat over the screen for an age. */
const DEFAULT_DURATION = 6000;

/** An offer to undo something is worth waiting a little longer for. */
const ACTION_DURATION = 10000;

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

  private dismiss = () => this.setState({shown: false});

  render() {
    const hasAction = Boolean(this.state.button1);

    return <Snackbar
      duration={this.state.duration ?? (hasAction ? ACTION_DURATION : DEFAULT_DURATION)}
      theme={this.props.theme}
      visible={this.state.shown}
      onDismiss={this.dismiss}
      // A close button, always. The snackbar covers whatever is at the bottom of the screen,
      // which on most screens is the primary action, and without this there was no way to
      // get rid of it but to wait it out.
      onIconPress={this.dismiss}
      iconAccessibilityLabel={i18n.t('common.dismiss')}
      action={hasAction ? {
        label: this.state.button1 as string,
        onPress: () => {
          this.state.button1Callback?.();
          this.dismiss();
        },
        buttonColor: this.props.theme.colors.primary,
        textColor: this.props.theme.colors.onPrimary,
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
