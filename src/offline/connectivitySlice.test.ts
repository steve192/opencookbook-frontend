import {describe, expect, it} from 'vitest';
import {logout} from '../redux/features/authSlice';
import reducer, {synced, wentOffline, wentOnline} from './connectivitySlice';

const initialState = () => reducer(undefined, {type: '@@INIT'});

describe('connectivitySlice', () => {
  it('starts online, never synced', () => {
    expect(initialState()).toEqual({online: true, reason: null, lastSyncedAt: null});
  });

  it('forgets the reason once back online', () => {
    const offline = reducer(initialState(), wentOffline('unreachable'));
    expect(reducer(offline, wentOnline())).toMatchObject({online: true, reason: null});
  });

  it('forgets the last sync on signing out, with the data it described', () => {
    const synchronised = reducer(initialState(), synced());
    expect(synchronised.lastSyncedAt).not.toBeNull();
    expect(reducer(synchronised, logout()).lastSyncedAt).toBeNull();
  });
});
