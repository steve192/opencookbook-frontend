import React, {useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import {ShoppingItem} from '../../api/types/shopping';
import {IndexedTile, KnownName, Offer, offersFor} from '../../helper/shopping/tiles';
import {FieldHandle, QuickAddField} from './QuickAddField';
import {QuickAddSheet} from './QuickAddSheet';

/** Empties the field, as after an item was added or adding ended. */
export interface TypedHandle {
  clear: () => void;
}

interface Props {
  adding: boolean;
  showField: boolean;
  inputRef: React.RefObject<FieldHandle | null>;
  typedRef: React.Ref<TypedHandle>;
  onStart: () => void;
  onDone: () => void;
  tiles: IndexedTile[];
  unitWords: ReadonlySet<string>;
  earlier: KnownName[];
  active: ShoppingItem[];
  /** @param spec the amount typed with the name */
  onAdd: (offer: Offer, spec: string | null) => void;
  registerSource: (key: string) => (view: View | null) => void;
}

// The field and the offers for what is typed. The typed text is kept here, so a keystroke renders these
// two and not the list above them.
export const QuickAdd = (props: Props) => {
  const [typed, setTyped] = useState('');
  useImperativeHandle(props.typedRef, () => ({clear: () => setTyped('')}), []);

  const addTyped = () => {
    const offers = offersFor(typed, props.unitWords, props.tiles, props.earlier);
    if (offers) {
      props.onAdd(offers.typed, offers.spec);
    }
  };

  return (
    <>
      {props.adding &&
        <QuickAddSheet typed={typed} tiles={props.tiles} unitWords={props.unitWords} earlier={props.earlier}
          active={props.active} onAdd={props.onAdd} registerSource={props.registerSource} />}
      {props.showField &&
        <QuickAddField inputRef={props.inputRef} typed={typed} onType={setTyped} onFocus={props.onStart}
          onSubmit={addTyped} adding={props.adding} onDone={props.onDone} />}
    </>
  );
};
