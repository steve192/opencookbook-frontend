import React from 'react';
import {Image, ImageSourcePropType} from 'react-native';
import {Aisle} from '../../api/aisles';
import {iconOf} from '../../helper/shopping/aisles';

// Generated when Metro starts (see metro.config.js), so it is required rather than imported.
const SHOPPING_ICONS: Record<string, ImageSourcePropType> = require('../../helper/shopping/shoppingIcons.generated');

interface Props {
  icon: string | null | undefined;
  aisle: Aisle;
  size: number;
}

// An item's icon, or its aisle's; an icon a newer server names that this app lacks shows the aisle's too.
export const ShoppingIcon = ({icon, aisle, size}: Props) => (
  <Image
    source={SHOPPING_ICONS[iconOf(icon, aisle)] ?? SHOPPING_ICONS[iconOf(null, aisle)]}
    style={{width: size, height: size}}
    accessibilityIgnoresInvertColors />
);
