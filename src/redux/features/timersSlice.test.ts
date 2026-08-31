import {describe, expect, it} from 'vitest';
import reducer, {allTimersStopped, timerStarted, timerStopped} from './timersSlice';

const timer = (endsAt: number) => ({label: '5 minutes', endsAt, recipeTitle: 'Lasagne', stepIndex: 1});

describe('timersSlice', () => {
  it('starts with nothing running', () => {
    expect(reducer(undefined, {type: '@@INIT'})).toEqual({timers: {}});
  });

  it('keeps a started timer under its key', () => {
    const state = reducer(undefined, timerStarted({key: 'a', timer: timer(100)}));
    expect(state.timers).toEqual({a: timer(100)});
  });

  it('runs several timers at once', () => {
    let state = reducer(undefined, timerStarted({key: 'a', timer: timer(100)}));
    state = reducer(state, timerStarted({key: 'b', timer: timer(200)}));
    expect(Object.keys(state.timers).sort()).toEqual(['a', 'b']);
  });

  // Restarting the same duration on the same step replaces it rather than doubling it up
  it('replaces a timer started again under the same key', () => {
    let state = reducer(undefined, timerStarted({key: 'a', timer: timer(100)}));
    state = reducer(state, timerStarted({key: 'a', timer: timer(500)}));
    expect(state.timers.a.endsAt).toBe(500);
    expect(Object.keys(state.timers)).toHaveLength(1);
  });

  it('drops a stopped timer and leaves the others alone', () => {
    let state = reducer(undefined, timerStarted({key: 'a', timer: timer(100)}));
    state = reducer(state, timerStarted({key: 'b', timer: timer(200)}));
    state = reducer(state, timerStopped('a'));
    expect(Object.keys(state.timers)).toEqual(['b']);
  });

  it('ignores stopping a timer that is not running', () => {
    const state = reducer(undefined, timerStopped('nothing'));
    expect(state.timers).toEqual({});
  });

  it('clears everything at once', () => {
    let state = reducer(undefined, timerStarted({key: 'a', timer: timer(100)}));
    state = reducer(state, allTimersStopped());
    expect(state.timers).toEqual({});
  });
});
