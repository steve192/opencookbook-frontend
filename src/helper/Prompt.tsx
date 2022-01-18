import React from 'react';
import {View} from 'react-native';
import {Button, Paragraph, Dialog, Portal, Provider} from 'react-native-paper';
import {Text, ThemedComponentProps, ThemeType, withStyles} from '@ui-kitten/components';

interface Options {
  title: string;
  message: string;
  button1:string;
  button2: string;
}
interface State extends Options{
  shown: boolean;
}

interface Props extends ThemedComponentProps {
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
      button2: '',
    };
  }

  render() {
    if (!this.state.shown) {
      return <></>;
    }
    return (
      <Dialog visible={this.state.shown} onDismiss={() => this.setState({shown: false}) }>
        <Dialog.Title>{this.state.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{this.state.message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button color={this.props.eva?.theme?.['color-danger-default']} onPress={() => undefined}>{this.state.button1}</Button>
          <Button color={this.props.eva?.theme?.['color-control-default']} onPress={() => undefined}>{this.state.button2}</Button>
        </Dialog.Actions>
      </Dialog>
    );
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

export const Prompt = withStyles(PromptWithoutStyles);
