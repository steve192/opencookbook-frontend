import type {SharePayload} from 'expo-sharing';
import {describe, expect, it} from 'vitest';
import {hostOf, sharedContentFromPayloads, sharedContentFromWebShare, sharedInput} from './sharedContent';

const PIE = 'https://example.com/apple-pie';
const REEL = 'https://www.instagram.com/reel/C1x2y3z/?igsh=MWQ1ZGUxMzBkMA==';

const text = (value: string): SharePayload => ({value, shareType: 'text', mimeType: 'text/plain'});
const photo = (value: string): SharePayload => ({value, shareType: 'image', mimeType: 'image/jpeg'});

describe('reading what was pasted or shared', () => {
  it('takes a bare link for a link', () => {
    expect(sharedInput(PIE)).toEqual({kind: 'link', input: PIE, link: PIE});
  });

  it('keeps the title a browser shares a link with', () => {
    expect(sharedInput(`Apple Pie\n${PIE}`)).toEqual({kind: 'link', input: `Apple Pie\n${PIE}`, link: PIE, title: 'Apple Pie'});
    expect(sharedInput(`My Apple Pie - ${PIE}`)).toMatchObject({kind: 'link', title: 'My Apple Pie'});
    expect(sharedInput(`"Apple Pie": ${PIE}`)).toMatchObject({kind: 'link', title: 'Apple Pie'});
  });

  it('takes an Instagram link with its tracking parameter for a link', () => {
    expect(sharedInput(REEL)).toEqual({kind: 'link', input: REEL, link: REEL});
  });

  it('leaves the full stop of a sentence off the link', () => {
    expect(sharedInput(`Look at this ${PIE}.`)).toMatchObject({kind: 'link', link: PIE, title: 'Look at this'});
  });

  it('takes a recipe that ends with its source for text', () => {
    const recipe = `Apple Pie\n\nIngredients:\n3 apples\n200 g flour\n\nSource: ${PIE}`;

    expect(sharedInput(recipe)).toEqual({kind: 'text', input: recipe});
  });

  it('takes a link with a long sentence around it for text', () => {
    expect(sharedInput(`${'Really '.repeat(20)}good pie ${PIE}`)?.kind).toBe('text');
  });

  it('takes two links for text', () => {
    expect(sharedInput(`${PIE} ${REEL}`)?.kind).toBe('text');
  });

  it('takes plain text for text, trimmed', () => {
    expect(sharedInput('  3 apples\n200 g flour  ')).toEqual({kind: 'text', input: '3 apples\n200 g flour'});
  });

  it('finds nothing in blank input', () => {
    expect(sharedInput(' \n ')).toBeUndefined();
  });
});

describe('reading a share from the Android share menu', () => {
  it('reads a shared link', () => {
    expect(sharedContentFromPayloads([{value: PIE, shareType: 'url'}])).toEqual({kind: 'link', input: PIE, link: PIE});
  });

  it('reads shared text', () => {
    expect(sharedContentFromPayloads([text('3 apples\n200 g flour')])).toEqual({kind: 'text', input: '3 apples\n200 g flour'});
  });

  it('reads shared photos in their order', () => {
    expect(sharedContentFromPayloads([photo('content://media/1'), photo('content://media/2')]))
        .toEqual({kind: 'photos', uris: ['content://media/1', 'content://media/2']});
  });

  it('prefers the photos over a caption shared with them', () => {
    expect(sharedContentFromPayloads([text('Grandma\'s cake'), photo('content://media/1')]))
        .toEqual({kind: 'photos', uris: ['content://media/1']});
  });

  it('finds nothing in an empty share', () => {
    expect(sharedContentFromPayloads([])).toBeUndefined();
    expect(sharedContentFromPayloads([text('')])).toBeUndefined();
  });

  it('ignores what it cannot import', () => {
    expect(sharedContentFromPayloads([{value: 'content://media/video', shareType: 'video'}])).toBeUndefined();
  });
});

describe('reading a share from the web share target', () => {
  it('joins the title and the link', () => {
    expect(sharedContentFromWebShare({title: 'Apple Pie', url: PIE}))
        .toEqual({kind: 'link', input: `Apple Pie\n${PIE}`, link: PIE, title: 'Apple Pie'});
  });

  it('reads a link Chrome puts in the text', () => {
    expect(sharedContentFromWebShare({title: 'Apple Pie', text: PIE, url: ''}))
        .toEqual({kind: 'link', input: `Apple Pie\n${PIE}`, link: PIE, title: 'Apple Pie'});
  });

  it('leaves out a part another part already holds', () => {
    expect(sharedContentFromWebShare({title: 'Apple Pie', text: `Apple Pie ${PIE}`, url: PIE}))
        .toEqual({kind: 'link', input: `Apple Pie ${PIE}`, link: PIE, title: 'Apple Pie'});
    expect(sharedContentFromWebShare({text: PIE, url: PIE})).toEqual({kind: 'link', input: PIE, link: PIE});
  });

  it('reads shared text', () => {
    expect(sharedContentFromWebShare({text: '3 apples\n200 g flour'})).toEqual({kind: 'text', input: '3 apples\n200 g flour'});
  });

  it('finds nothing without parameters', () => {
    expect(sharedContentFromWebShare({})).toBeUndefined();
    expect(sharedContentFromWebShare({title: ' ', text: ''})).toBeUndefined();
  });
});

describe('naming the host of a link', () => {
  it('shows the host without www.', () => {
    expect(hostOf(REEL)).toBe('instagram.com');
    expect(hostOf('http://chefkoch.de')).toBe('chefkoch.de');
  });

  it('leaves anything else as it is', () => {
    expect(hostOf('not a link')).toBe('not a link');
  });
});
