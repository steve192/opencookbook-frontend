import { Icon, IconElement, IconProps } from '@ui-kitten/components';
import React from 'react';

export const CloseIcon = (style: IconProps): IconElement => (
  <Icon {...style} name='close'/>
);

export const MinusIcon = (style: IconProps): IconElement => (
  <Icon {...style} name='minus'/>
);

export const PlusIcon = (style: IconProps): IconElement => (
  <Icon {...style} name='plus'/>
);

export const ArrowForwardIcon = (style: IconProps): IconElement => (
  <Icon {...style} name='arrow-ios-forward-outline'/>
);
export const ArrowBackwardIcon = (style: IconProps): IconElement => (
  <Icon {...style} name='arrow-ios-back-outline'/>
);