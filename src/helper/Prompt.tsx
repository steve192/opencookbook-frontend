import React from 'react';
import {Button, Dialog, MD3Theme, Paragraph, withTheme} from 'react-native-paper';
import CentralStyles from '../styles/CentralStyles';

interface Options {
  title: string;
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
class PromptWithoutStyles extends React.Component<Props, State> {
  private static component: PromptWithoutStyles;
  constructor(props: Props) {
    super(props);
    PromptWithoutStyles.component = this;
    this.state = {
      shown: false,
      title: '',
      message: '',
      button1: '',
      button1Callback: undefined,
      button2: '',
      button2Callback: undefined,
    };
  }

  render() {
    if (!this.state.shown) {
      return <></>;
    }
    return (
      this.renderPrompt()
    );
  }

  renderPrompt() {
    return <Dialog style={[CentralStyles.contentContainer, {width: '90%', paddingBottom: 0}]} visible={this.state.shown} onDismiss={() => this.setState({shown: false})}>
      <Dialog.Title>{this.state.title}</Dialog.Title>
      <Dialog.Content>
        <Paragraph>{this.state.message}</Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        {this.state.button1 !== undefined && <Button buttonColor={this.props.theme.colors.error} onPress={() => {
          this.state.button1Callback?.();
          this.setState({shown: false});
        } }>{this.state.button1}</Button>}

        { this.state.button2 !== undefined && <Button buttonColor={this.props.theme.colors.onSurface} onPress={() => {
          this.state.button2Callback?.();
          this.setState({shown: false});
        } }>{this.state.button2}</Button> }
      </Dialog.Actions>
    </Dialog>;
  }

  componentDidMount() {
    PromptWithoutStyles.component = this;
  }

  public static show(options: Options) {
    this.component.setState({...options, shown: true});
  }
}
export const PromptUtil = {
  show: (options: Options) => {
    PromptWithoutStyles.show(options);
  },
};

export const Prompt = withTheme(PromptWithoutStyles);
