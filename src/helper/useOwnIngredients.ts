import {useEffect, useState} from 'react';
import RestAPI from '../dao/RestAPI';
import {OwnIngredient, ownIngredients} from './ownIngredients';

/**
 * @return {OwnIngredient[]} the cook's own ingredients, empty until loaded or when loading failed
 */
export const useOwnIngredients = (): OwnIngredient[] => {
  const [ingredients, setIngredients] = useState<OwnIngredient[]>([]);
  useEffect(() => {
    RestAPI.getIngredients()
        .then((all) => setIngredients(ownIngredients(all)))
        .catch(() => setIngredients([]));
  }, []);
  return ingredients;
};
