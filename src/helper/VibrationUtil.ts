import {Vibration} from 'react-native';


export class VibrationUtils {
  public static readonly longPressFeedbackVibration = () => {
    Vibration.vibrate(10);
  };
}
