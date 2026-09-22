import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform, StyleSheet, View} from 'react-native';
import {Button, Icon, Text} from 'react-native-paper';
import {secondsRemaining, timerKey, timerNotificationTexts} from '../helper/cookingTimers';
import {SnackbarUtil} from '../helper/GlobalSnackbar';
import {formatCountdown, StepDuration} from '../helper/recipeDuration';
import {openAlarmSettings, startTimerNotifications, stopTimerNotifications} from '../helper/timerNotifications';
import {timerStarted, timerStopped} from '../redux/features/timersSlice';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {useAppTheme} from '../styles/CentralStyles';

interface Props {
  duration: StepDuration;
  recipeId: number;
  recipeTitle: string;
  stepIndex: number;
}

// A timer for one duration the step mentions. Nothing about cooking is reached for more
// often, and until now the app made you leave it to use another one.
export const StepTimer = (props: Props) => {
  const theme = useAppTheme();
  const {t} = useTranslation('translation');
  const dispatch = useAppDispatch();

  const key = timerKey(props.recipeId, props.stepIndex, props.duration.seconds);
  const timer = useAppSelector((state) => state.timers.timers[key]);

  // Only to redraw the countdown; what it counts down to is held in the store, so the
  // number shown is worked out from the clock and cannot drift or be lost.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer) {
      return;
    }
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [timer]);

  const running = timer !== undefined;
  const remaining = timer ? secondsRemaining(timer, now) : props.duration.seconds;

  const toggle = () => {
    if (running) {
      stopTimerNotifications(key);
      dispatch(timerStopped(key));
      return;
    }

    const started = {
      label: props.duration.label,
      endsAt: Date.now() + props.duration.seconds * 1000,
      recipeTitle: props.recipeTitle,
      stepIndex: props.stepIndex,
    };
    dispatch(timerStarted({key, timer: started}));
    setNow(Date.now());

    // The shade carries the timer while it runs and the alert when it is up, so putting the
    // phone down is safe. Both are posted by the system rather than kept alive by the app.
    startTimerNotifications(key, started.endsAt, timerNotificationTexts(t, started), {
      recipeId: props.recipeId,
      stepIndex: props.stepIndex,
    }).then((announcement) => {
      // Said out loud rather than left to be discovered when the timer rings late or not at
      // all. Almost always the missing alarm grant, which the user can give from here.
      if (Platform.OS === 'android' && announcement !== 'alarm') {
        SnackbarUtil.show({
          message: t('screens.guidedCooking.alarmUnavailable'),
          action: t('screens.guidedCooking.allowAlarms'),
          onAction: openAlarmSettings,
        });
      }
    });
  };

  return (
    <View style={[styles.timer, {borderColor: running ? theme.colors.primary : theme.colors.outlineVariant}]}>
      <Icon source="timer-outline" size={18} color={running ? theme.colors.primaryText : theme.colors.onSurfaceVariant} />
      <Text
        variant="titleSmall"
        style={[styles.remaining, {color: running ? theme.colors.primaryText : theme.colors.onSurface}]}>
        {running ? formatCountdown(remaining) : props.duration.label}
      </Text>
      <Button compact textColor={theme.colors.primaryText} onPress={toggle}>
        {running ? t('screens.guidedCooking.stopTimer') : t('screens.guidedCooking.startTimer')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
  },
  remaining: {
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
});
