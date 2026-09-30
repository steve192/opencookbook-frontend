import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {shoppingLiveUrl} from '../../api/endpoints/shopping';
import {currentAccessToken, renewTokens} from '../../api/session';
import {LiveChannel} from '../../helper/shopping/liveChannel';
import {
  loadShoppingLists,
  loadShoppingVocabulary,
  syncAllShoppingLists,
  syncShoppingList,
  syncShoppingListBehind,
} from '../../helper/shopping/shoppingSync';
import {useShoppingProvider} from '../../helper/shopping/useShoppingProvider';
import {useIsOnline} from '../../offline/useIsOnline';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';

/** Without the live channel, the shown list is asked about this often while the app is open. */
const POLL_MILLIS = 15_000;

const ignore = () => undefined;

/**
 * Keeps the shopping lists in step while the app is open: sends what was changed offline once back
 * online, hears from the server when somebody else changed a list, and asks now and then when it
 * cannot hear.
 *
 * @return {null} nothing to render
 */
export const ShoppingSyncRunner = () => {
  const dispatch = useAppDispatch();
  const {provider} = useShoppingProvider();
  const isOnline = useIsOnline();
  const lists = useAppSelector((state) => state.shopping.lists);
  const activeListId = useAppSelector((state) => state.shopping.activeListId);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [hearing, setHearing] = useState(false);
  const channel = useRef<LiveChannel | null>(null);
  const running = provider === 'COOKPAL' && isOnline && foreground;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!running) {
      return;
    }
    dispatch(loadShoppingLists()).then(() => dispatch(syncAllShoppingLists())).catch(ignore);
    dispatch(loadShoppingVocabulary()).catch(ignore);

    const live = new LiveChannel({
      url: shoppingLiveUrl,
      token: currentAccessToken,
      renewToken: renewTokens,
      onChanged: (listId, version) => dispatch(syncShoppingListBehind(listId, version)).catch(ignore),
      onConnected: setHearing,
    });
    channel.current = live;
    live.start();
    return () => {
      live.stop();
      channel.current = null;
    };
  }, [running]);

  useEffect(() => {
    channel.current?.listenTo(lists.map((list) => ({listId: list.id, householdId: list.householdId})));
  }, [lists, running]);

  useEffect(() => {
    if (!running || hearing || activeListId === null) {
      return;
    }
    const timer = setInterval(() => dispatch(syncShoppingList(activeListId)).catch(ignore), POLL_MILLIS);
    return () => clearInterval(timer);
  }, [running, hearing, activeListId]);

  return null;
};
