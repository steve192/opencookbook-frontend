import {describe, expect, it} from 'vitest';
import {adminAddress, isSameInstance, normalizeServerAddress} from './instanceAddress';

describe('isSameInstance', () => {
  // Every one of these is a way of writing the same server, and every one of them would
  // otherwise put a "this recipe lives somewhere else" notice in front of somebody who is
  // looking at their own instance.
  it.each([
    ['https://beta.cookpal.io', 'https://beta.cookpal.io/'],
    ['https://beta.cookpal.io/', 'https://BETA.cookpal.io'],
    ['https://BETA.CookPal.io/some/path', 'https://beta.cookpal.io'],
    ['https://beta.cookpal.io:443', 'https://beta.cookpal.io'],
    ['http://beta.cookpal.io:80', 'http://beta.cookpal.io/'],
    ['http://localhost:8081', 'http://localhost:8081/share/abc'],
  ])('treats %s and %s as one server', (one, other) => {
    expect(isSameInstance(one, other)).toBe(true);
  });

  it.each([
    ['https://beta.cookpal.io', 'https://cookbook.example.com'],
    ['https://beta.cookpal.io', 'http://beta.cookpal.io'],
    ['http://localhost:8081', 'http://localhost:9090'],
  ])('keeps %s and %s apart', (one, other) => {
    expect(isSameInstance(one, other)).toBe(false);
  });

  it('has nothing to compare when a link names no host at all', () => {
    expect(isSameInstance('cookpal://share/7f3a', 'https://beta.cookpal.io')).toBe(false);
  });

  it('does not consider two unknowns to be the same server', () => {
    expect(isSameInstance(undefined, undefined)).toBe(false);
  });
});

describe('normalizeServerAddress', () => {
  it.each([
    ['https://example.org', 'https://example.org'],
    ['  https://example.org/  ', 'https://example.org'],
    ['https://example.org/app', 'https://example.org'],
    ['https://example.org/app/', 'https://example.org'],
    ['https://example.org//app//', 'https://example.org'],
    ['http://localhost:8081/app', 'http://localhost:8081'],
  ])('turns %s into %s', (typed, expected) => {
    expect(normalizeServerAddress(typed)).toBe(expected);
  });

  it('keeps a path that only starts like the base path', () => {
    expect(normalizeServerAddress('https://example.org/application')).toBe('https://example.org/application');
  });
});

describe('adminAddress', () => {
  it.each([
    ['https://example.org', 'https://example.org/admin'],
    ['https://example.org/', 'https://example.org/admin'],
    ['https://example.org/app', 'https://example.org/admin'],
  ])('puts the administration of %s at %s', (instance, expected) => {
    expect(adminAddress(instance)).toBe(expected);
  });
});
