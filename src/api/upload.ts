import type {ApiRequest} from './baseQuery';
import {UPLOAD_TIMEOUT_MILLIS} from './client';
import {formImage} from './formImage';

export const uploadRequest = (url: string, body: FormData): ApiRequest =>
  ({url, method: 'POST', body, headers: {'Content-Type': 'multipart/form-data'}, timeout: UPLOAD_TIMEOUT_MILLIS});

export const imageForm = async (field: string, uri: string): Promise<FormData> => {
  const body = new FormData();
  body.append(field, await formImage(uri));
  return body;
};
