import React from 'react';
import {SignupScreen} from '../screens/LoginScreen/SignupScreen';
import {useRouter} from 'expo-router';

export default function Main() {
  const router = useRouter();
  return <SignupScreen router={router}/>;
}
