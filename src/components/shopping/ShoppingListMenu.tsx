import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {ShoppingList} from '../../dao/RestAPI';
import {listIcon} from '../../helper/shopping/lists';
import {useListName} from '../../helper/shopping/useListName';

interface Props {
  lists: ShoppingList[];
  selectedId?: number | null;
  renderAnchor: (open: () => void) => React.ReactNode;
  onChoose: (list: ShoppingList) => void;
  /** Entries below the lists. */
  extraItems?: MenuEntry[];
}

export interface MenuEntry {
  title: string;
  icon: string;
  onPress: () => void;
}

// Every list to switch to or send to, the chosen one ticked.
export const ShoppingListMenu = (props: Props) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const run = (onPress: () => void) => {
    close();
    onPress();
  };
  const nameOf = useListName();

  return (
    <Menu visible={open} onDismiss={close} anchor={props.renderAnchor(() => setOpen(true))}>
      {props.lists.map((list) => (
        <Menu.Item
          key={list.id}
          title={nameOf(list)}
          leadingIcon={listIcon(list)}
          trailingIcon={list.id === props.selectedId ? 'check' : undefined}
          onPress={() => run(() => props.onChoose(list))} />
      ))}
      {props.extraItems?.map((entry) => (
        <Menu.Item key={entry.title} title={entry.title} leadingIcon={entry.icon} onPress={() => run(entry.onPress)} />
      ))}
    </Menu>
  );
};
