import React from 'react';
import {useTranslation} from 'react-i18next';
import {OptionList} from '../../../components/OptionList';
import {DOUGH_LEAVENERS, DoughLeavener} from '../../../tools/dough/dough';
import {LEAVENER_PHOTOS} from '../toolPhotos';

interface Props<T extends DoughLeavener> {
  chosen: T;
  onChoose: (leavener: T) => void;
  /** The leaveners on offer, all by default. */
  leaveners?: readonly T[];
  title?: string;
}

// What leavens the dough, each kind with a photo, how it looks and how to add it.
export const LeavenerChoice = <T extends DoughLeavener>(props: Props<T>) => {
  const {t} = useTranslation('translation');
  const leaveners = props.leaveners ?? (DOUGH_LEAVENERS as readonly T[]);
  return (
    <OptionList title={props.title ?? t('tools.dough.leavener')} chosen={props.chosen} onChoose={props.onChoose}
      options={leaveners.map((leavener) => ({value: leavener, title: t(`tools.dough.leaveners.${leavener}`),
        description: t(`tools.dough.leavenerDescriptions.${leavener}`), image: LEAVENER_PHOTOS[leavener]}))} />
  );
};
