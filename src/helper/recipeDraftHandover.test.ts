import {beforeEach, describe, expect, it} from 'vitest';
import {Recipe} from '../dao/RestAPI';
import {holdDraft, takeDraft} from './recipeDraftHandover';

const recipe = (title: string) => ({title} as Recipe);

describe('recipeDraftHandover', () => {
  beforeEach(() => {
    takeDraft();
  });

  it('hands the draft to whoever asks for it', () => {
    holdDraft(recipe('Apfelkuchen'));

    expect(takeDraft()?.title).toBe('Apfelkuchen');
  });

  it('hands it over once', () => {
    // Otherwise it would reappear the next time somebody opened the wizard to
    // write a recipe from scratch.
    holdDraft(recipe('Apfelkuchen'));
    takeDraft();

    expect(takeDraft()).toBeUndefined();
  });

  it('has nothing to give when no scan left anything', () => {
    expect(takeDraft()).toBeUndefined();
  });

  it('keeps only the most recent draft', () => {
    holdDraft(recipe('first'));
    holdDraft(recipe('second'));

    expect(takeDraft()?.title).toBe('second');
  });
});
