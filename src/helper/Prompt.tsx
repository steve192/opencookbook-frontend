import React from 'react';
import {Text, View} from 'react-native';
import {Button, Paragraph, Dialog, Portal, Provider} from 'react-native-paper';

interface State {
    shown: boolean;
}
export class Prompt extends React.Component<any, State> {
  private static component: Prompt;
  constructor(props: any) {
    super(props);
    Prompt.component = this;
    this.state = {
      shown: false,
    };
  }

  render() {
    if (!this.state.shown) {
      return <></>;
    }
    return (
      <Portal>
        <Dialog visible={this.state.shown} onDismiss={() => undefined }>
          <Dialog.Title>Alert</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This is simple dialog</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => undefined}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }

  public static show() {
    this.component.setState({shown: true});
  }
}
