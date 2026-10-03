import {describe, expect, it} from 'vitest';
import {LINK_SEGMENTS, parseAppLink} from './appLink';

describe('parseAppLink for shares', () => {
  const parse = (url: string) => parseAppLink(url, LINK_SEGMENTS.share);

  it('reads the share and the instance out of a web link', () => {
    expect(parse('https://beta.cookpal.io/share/7f3a1c2e')).toEqual({
      origin: 'https://beta.cookpal.io',
      id: '7f3a1c2e',
    });
  });

  it('survives a query string and a fragment', () => {
    expect(parse('https://beta.cookpal.io/share/7f3a?from=chat#top')?.id).toBe('7f3a');
  });

  it('reads a link under the base path', () => {
    expect(parse('https://cookpal.io/app/share/7f3a')).toEqual({origin: 'https://cookpal.io', id: '7f3a'});
  });

  it('still reads a link of the retired address, which has no base path', () => {
    expect(parse('https://beta.cookpal.io/share/x')).toEqual({origin: 'https://beta.cookpal.io', id: 'x'});
  });

  it('reads a link opened through the app scheme, which names no instance', () => {
    expect(parse('cookpal://share/7f3a')).toEqual({id: '7f3a'});
  });

  it('reads an expo development link, where the scheme carries a host of its own', () => {
    expect(parse('exp://192.168.0.2:8081/share/7f3a')).toEqual({id: '7f3a'});
  });

  it('decodes an escaped id', () => {
    expect(parse('https://beta.cookpal.io/share/a%2Bb')?.id).toBe('a+b');
  });

  it('is not fooled by another route', () => {
    expect(parse('https://beta.cookpal.io/recipe/12')).toBeUndefined();
  });

  it('rejects something that is not a link at all', () => {
    expect(parse('share/7f3a')).toBeUndefined();
  });
});

describe('parseAppLink for invitations', () => {
  const parse = (url: string) => parseAppLink(url, LINK_SEGMENTS.invitation);

  it('reads the invitation and the instance out of a link under the base path', () => {
    expect(parse('https://cookbook.example.com/app/invite/Xy_9-abc')).toEqual({
      origin: 'https://cookbook.example.com',
      id: 'Xy_9-abc',
    });
  });

  it('reads a link without the base path', () => {
    expect(parse('https://cookbook.example.com/invite/abc')).toEqual({
      origin: 'https://cookbook.example.com',
      id: 'abc',
    });
  });

  it('keeps a port of the instance and normalizes its spelling', () => {
    expect(parse('HTTP://Home.Example:8080/app/invite/abc')?.origin).toBe('http://home.example:8080');
  });

  it('reads a link opened through the app scheme, which names no instance', () => {
    expect(parse('cookpal://invite/abc')).toEqual({id: 'abc'});
  });

  it('is not fooled by a household invitation or a share', () => {
    expect(parse('https://cookbook.example.com/app/household-invite/abc')).toBeUndefined();
    expect(parse('https://cookbook.example.com/app/share/abc')).toBeUndefined();
  });
});
