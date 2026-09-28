import {useEffect, useState} from 'react';
import RestAPI, {UserInfo} from '../dao/RestAPI';

/**
 * The signed-in account, read once when the screen opens; falls back to the offline copy.
 *
 * @return {UserInfo | undefined} the account, until it is read undefined
 */
export const useUserInfo = (): UserInfo | undefined => {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  useEffect(() => {
    RestAPI.getUserInfo().then(setUserInfo).catch(() => undefined);
  }, []);
  return userInfo;
};
