import axios from 'axios';
import AppPersistence from '../AppPersistence';
import {deviceLanguage} from '../i18n/locale';

export const READ_TIMEOUT_MILLIS = 8_000;
export const WRITE_TIMEOUT_MILLIS = 15_000;
export const UPLOAD_TIMEOUT_MILLIS = 60_000;
export const PROBE_TIMEOUT_MILLIS = 5_000;

// Sent on every request, signed in or not, so the server answers in the user's language.
export const client = axios.create({headers: {'Accept-Language': deviceLanguage}});

export const apiUrl = async (path: string): Promise<string> =>
  await AppPersistence.getBackendURL() + '/api/v1' + path;

export const bearer = (token: string | null): Record<string, string> =>
  token ? {Authorization: 'Bearer ' + token} : {};
