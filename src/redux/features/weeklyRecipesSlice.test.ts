import {describe, expect, it, vi} from 'vitest';

// RestAPI is only reached through the thunks' payload creators, which these
// tests never run - they dispatch the fulfilled actions directly.
vi.mock('../../dao/RestAPI', () => ({default: {}}));

const {fetchWeekplanDays, updateSingleWeekplanDay} = await import('./weeklyRecipesSlice');
const reducer = (await import('./weeklyRecipesSlice')).default;

const day = (date: string, titles: string[] = []) => ({
  day: date,
  recipes: titles.map((title, index) => ({
    id: index, title, type: 'NORMAL_RECIPE' as const, titleImageUuid: '',
  })),
});

const stateWith = (...days: ReturnType<typeof day>[]) => ({weekplanDays: days});

const fetched = (payload: ReturnType<typeof day>[]) =>
  ({type: fetchWeekplanDays.fulfilled.type, payload});

const updated = (arg: ReturnType<typeof day>, payload = arg) =>
  ({type: updateSingleWeekplanDay.fulfilled.type, payload, meta: {arg}});

describe('weeklyRecipesSlice', () => {
  it('starts with no weekplan days', () => {
    expect(reducer(undefined, {type: '@@INIT'})).toEqual({weekplanDays: []});
  });

  describe('fetchWeekplanDays', () => {
    it('adds fetched days to an empty state', () => {
      const state = reducer(stateWith(), fetched([day('2026-01-01')]));
      expect(state.weekplanDays.map((d) => d.day)).toEqual(['2026-01-01']);
    });

    // Refetching an overlapping range must not leave two entries for one date,
    // which would render the same day twice in the week view.
    it('replaces days that were already present rather than duplicating them', () => {
      const existing = stateWith(day('2026-01-01', ['old']), day('2026-01-02', ['keep']));
      const state = reducer(existing, fetched([day('2026-01-01', ['new'])]));

      expect(state.weekplanDays).toHaveLength(2);
      const first = state.weekplanDays.find((d) => d.day === '2026-01-01');
      expect(first?.recipes.map((r) => r.title)).toEqual(['new']);
    });

    it('keeps days outside the fetched range', () => {
      const existing = stateWith(day('2026-01-02', ['keep']));
      const state = reducer(existing, fetched([day('2026-01-01')]));
      expect(state.weekplanDays.map((d) => d.day).sort()).toEqual(['2026-01-01', '2026-01-02']);
    });

    it('is a no-op for an empty payload', () => {
      const existing = stateWith(day('2026-01-02', ['keep']));
      expect(reducer(existing, fetched([]))).toEqual(existing);
    });
  });

  describe('updateSingleWeekplanDay', () => {
    it('appends a day that was not in the plan yet', () => {
      const state = reducer(stateWith(), updated(day('2026-01-03', ['added'])));
      expect(state.weekplanDays.map((d) => d.day)).toEqual(['2026-01-03']);
    });

    it('replaces the matching day in place', () => {
      const existing = stateWith(day('2026-01-01', ['before']), day('2026-01-02', ['other']));
      const state = reducer(existing, updated(day('2026-01-01', ['after'])));

      expect(state.weekplanDays).toHaveLength(2);
      expect(state.weekplanDays[0].recipes.map((r) => r.title)).toEqual(['after']);
      // Order matters: the week view renders days positionally.
      expect(state.weekplanDays[1].day).toBe('2026-01-02');
    });

    // The server response is authoritative, so the stored day is the payload
    // rather than the optimistic argument that was sent.
    it('stores the server payload, not the requested day', () => {
      const requested = day('2026-01-01', ['requested']);
      const serverSaid = day('2026-01-01', ['normalised']);
      const state = reducer(stateWith(requested), updated(requested, serverSaid));
      expect(state.weekplanDays[0].recipes.map((r) => r.title)).toEqual(['normalised']);
    });
  });
});
