import XDate from 'xdate';
import {toDayKey, weekKeyOf} from '../../helper/weekplan';
import {planKey} from '../../helper/weekplanDay';
import {api} from '../api';
import {householdScope} from '../queryString';
import {WeekplanDay, WeekplanDayRecipeInfo, WeekplanDayRecipeRequest} from '../types/weekplan';

// A saved recipe is referenced by id alone; a spontaneous meal carries its own title.
const toRequestMeal = (meal: WeekplanDayRecipeInfo): WeekplanDayRecipeRequest =>
  meal.type === 'NORMAL_RECIPE' ?
    {id: meal.id, type: meal.type, servings: meal.servings, leftoverOf: meal.leftoverOf} :
    {id: meal.id, type: meal.type, title: meal.title};

const weekplanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Every plan of the week that starts on this Monday.
    getWeekplanWeek: builder.query<WeekplanDay[], string>({
      query: (weekKey) => ({url: `/weekplan/${weekKey}/to/${toDayKey(new XDate(weekKey).addDays(6))}?allPlans=true`}),
      providesTags: (_result, _error, weekKey) => [{type: 'Weekplan', id: weekKey}],
    }),
    setWeekplanDay: builder.mutation<WeekplanDay, WeekplanDay>({
      query: (day) => ({url: `/weekplan/${day.day}${householdScope(day.householdId)}`, method: 'PUT',
        body: {recipes: day.recipes.map(toRequestMeal)}}),
      // The saved day replaces the cached one in place, so the day's plans keep their order.
      // A failure is the caller's to report.
      onQueryStarted: (day, {dispatch, queryFulfilled}) => {
        queryFulfilled.then(({data: saved}) => dispatch(weekplanApi.util.updateQueryData('getWeekplanWeek',
            weekKeyOf(day.day), (week) => {
              const cachedAt = week.findIndex((cached) => planKey(cached) === planKey(day));
              if (cachedAt === -1) {
                week.push(saved);
              } else {
                week[cachedAt] = saved;
              }
            })),
        () => undefined);
      },
    }),
  }),
});

export const {useGetWeekplanWeekQuery, useSetWeekplanDayMutation} = weekplanApi;

export const weekplanEndpoints = weekplanApi.endpoints;
