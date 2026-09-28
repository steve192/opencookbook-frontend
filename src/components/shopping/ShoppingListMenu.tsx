import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {ShoppingList} from '../../dao/RestAPI';
import {listIcon} from '../../helper/shopping/lists';
import {useListName} from '../../helper/shopping/useListName';

interface Props {
  lists: ShoppingList[];
  selectedId?: number | null;
  anchor: (open: () => void) => React.ReactNode;
  onChoose: (list: ShoppingList) => void;
  /** Entries below the lists. */
  children?: (close: () => void) => React.ReactNode;
}

// Every list to switch to or send to, the chosen one ticked.
export const ShoppingListMenu = (props: Props) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const nameOf = useListName();

  return (
    <Menu visible={open} onDismiss={close} anchor={props.anchor(() => setOpen(true))}>
      {props.lists.map((list) => (
        <Menu.Item
          key={list.id}
          title={nameOf(list)}
          leadingIcon={listIcon(list)}
          trailingIcon={list.id === props.selectedId ? 'check' : undefined}
          onPress={() => {
            close();
            props.onChoose(list);
          }} />
      ))}
      {props.children?.(close)}
    </Menu>
  );
};
