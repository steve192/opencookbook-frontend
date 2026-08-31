import {createNavigationContainerRef} from '@react-navigation/native';
import {BaseNavigatorProps} from './NavigationRoutes';

/**
 * The navigator, reachable from outside the screens.
 *
 * Needed for things that arrive from the system rather than from a tap inside the app - a
 * notification the user opened, for instance, which may even be what started the app.
 */
export const navigationRef = createNavigationContainerRef<BaseNavigatorProps>();
