import {describe, expect, it} from 'vitest';
import reducer, {login, logout, sessionRestored} from './authSlice';

const initialState = () => reducer(undefined, {type: '@@INIT'});

describe('authSlice', () => {
  it('starts logged out', () => {
    expect(initialState()).toEqual({loggedIn: false});
  });

  it('logs in and out', () => {
    const loggedIn = reducer(initialState(), login());
    expect(loggedIn).toEqual({loggedIn: true});
    expect(reducer(loggedIn, logout())).toEqual({loggedIn: false});
  });

  it('restores whatever sign in the device holds', () => {
    expect(reducer(initialState(), sessionRestored(true))).toEqual({loggedIn: true});
    expect(reducer(initialState(), sessionRestored(false))).toEqual({loggedIn: false});
  });
});
