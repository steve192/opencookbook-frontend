import {Vibration} from 'react-native';


export class VibrationUtils {
  public static longPressFeedbackVibration = () => {
    Vibration.vibrate(10);
  };
}
