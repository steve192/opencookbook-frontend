import React from 'react';
import {useTranslation} from 'react-i18next';
import {SegmentedButtons} from 'react-native-paper';
import {ChoiceChips} from '../../../components/ChoiceChips';
import {CountStepper} from '../../../components/CountStepper';
import {Notice} from '../../../components/Notice';
import {OptionList} from '../../../components/OptionList';
import {QuestionSection} from '../../../components/QuestionSection';
import {SwitchRow} from '../../../components/SwitchRow';
import {SliderField} from '../../../components/tools/SliderField';
import {ToolFrame} from '../../../components/tools/ToolFrame';
import {ToolResult} from '../../../components/tools/ToolResult';
import {UnitSwitch} from '../../../components/tools/UnitSwitch';
import {useUnitSystem} from '../../../helper/useUnitSystem';
import {Appetite, APPETITES, BEER_BOTTLE_L, choosableSides, coursesOf, mainStandsAlone, parsePartyInputs, planParty,
  portion, WINE_BOTTLE_L} from '../../../tools/party/party';
import {ACCOMPANIMENTS, Drinking, DRINKINGS, GUEST_GROUPS, PARTY_EVENTS, STARCHES, VEGETABLES}
  from '../../../tools/party/partyData';
import {ResultLine} from '../../../tools/result';
import {formatVolume, formatWeight} from '../../../tools/units';
import {PARTY_EVENT_PHOTOS} from '../toolPhotos';
import {useToolInputs} from '../useToolInputs';

const MAX_GUESTS = 1000;
const percent = (value: number) => `${Math.round(value)} %`;
// The last one stays: a course is always served as something.
const toggled = <T, >(chosen: T[], value: T): T[] => chosen.includes(value) ?
  (chosen.length > 1 ? chosen.filter((other) => other !== value) : chosen) : [...chosen, value];

export const PartyTool = () => {
  const {t, i18n} = useTranslation('translation');
  const [system] = useUnitSystem();
  const [inputs, change] = useToolInputs('partyPlanner', parsePartyInputs);
  const result = planParty(inputs);
  const locale = i18n.language;
  const weight = (grams: number) => formatWeight(grams, system, locale);
  const litres = (value: number) => formatVolume(value * 1000, system, locale);
  const guests = GUEST_GROUPS.reduce((sum, group) => sum + inputs.guests[group], 0);
  const sides = choosableSides(inputs.event);
  const showStarches = sides.starches && inputs.courses.includes('sides');
  const showVegetables = sides.vegetables && inputs.courses.includes('salad');
  const stepper = (label: string, value: number, max: number, onChange: (value: number) => void) => (
    <CountStepper key={label} label={label} value={String(value)} decreaseLabel={t('tools.fewer')}
      increaseLabel={t('tools.more')} canDecrease={value > 0} canIncrease={value < max}
      onDecrease={() => onChange(value - 1)} onIncrease={() => onChange(value + 1)} entry={{min: 0, max, onChange}} />
  );

  const food: ResultLine[] = [
    ...result.food.map((line) => ({
      label: t(`tools.partyPlanner.items.${line.item}`),
      value: line.servings ?
        t('tools.partyPlanner.servings', {count: line.servings.count, size: weight(line.servings.grams)}) :
        line.gramsPerDish != null ?
          t('tools.partyPlanner.perDish', {total: weight(line.grams), dish: weight(line.gramsPerDish)}) :
          weight(line.grams),
    })),
    ...(result.pickleJars > 0 ? [{label: t('tools.partyPlanner.pickles'),
      value: t('tools.partyPlanner.jarsEach', {count: Math.ceil(result.pickleJars)})}] : []),
  ];
  const drinks: ResultLine[] = [
    {label: t('tools.partyPlanner.softDrinks'), value: litres(result.softDrinks)},
    {label: t('tools.partyPlanner.water'), value: litres(result.water)},
    ...(result.beer > 0 ? [{label: t('tools.partyPlanner.beer'), value: t('tools.partyPlanner.bottles',
        {volume: litres(result.beer), count: Math.ceil(result.beer / BEER_BOTTLE_L), size: litres(BEER_BOTTLE_L)})}] : []),
    ...(result.wine > 0 ? [{label: t('tools.partyPlanner.wine'), value: t('tools.partyPlanner.bottles',
        {volume: litres(result.wine), count: Math.ceil(result.wine / WINE_BOTTLE_L), size: litres(WINE_BOTTLE_L)})}] : []),
  ];

  return (
    <ToolFrame result={
      <ToolResult title={t('tools.partyPlanner.resultTitle', {event: t(`tools.partyPlanner.events.${inputs.event}`)})}
        sections={[
          {title: t('tools.partyPlanner.food'), icon: 'silverware-fork-knife', lines: food},
          {title: t('tools.partyPlanner.drinks'), icon: 'cup-water', lines: drinks},
        ]} />}>
      <UnitSwitch />
      <OptionList title={t('tools.partyPlanner.event')} chosen={inputs.event} onChoose={(event) => change({event})}
        options={PARTY_EVENTS.map((event) => ({value: event, title: t(`tools.partyPlanner.events.${event}`),
          description: t(`tools.partyPlanner.eventDescriptions.${event}`), image: PARTY_EVENT_PHOTOS[event]}))} />

      <QuestionSection title={t('tools.partyPlanner.guests')} hint={t('tools.partyPlanner.guestsHint')}>
        {GUEST_GROUPS.map((group) => stepper(t(`tools.partyPlanner.groups.${group}`), inputs.guests[group], MAX_GUESTS,
            (count) => change({guests: {...inputs.guests, [group]: count},
              // Fewer guests than meat-free ones would be impossible.
              meatFree: Math.min(inputs.meatFree, guests - inputs.guests[group] + count)})))}
        {stepper(t('tools.partyPlanner.meatFree'), inputs.meatFree, guests,
            (meatFree) => change({meatFree}))}
      </QuestionSection>

      <QuestionSection title={t('tools.partyPlanner.appetite')}>
        <SegmentedButtons value={inputs.appetite} onValueChange={(appetite) => change({appetite: appetite as Appetite})}
          buttons={APPETITES.map((appetite) => ({value: appetite,
            label: t(`tools.partyPlanner.appetites.${appetite}`)}))} />
      </QuestionSection>

      <QuestionSection title={t('tools.partyPlanner.when')}>
        <SegmentedButtons value={inputs.timeOfDay}
          onValueChange={(timeOfDay) => change({timeOfDay: timeOfDay as 'lunch' | 'evening'})}
          buttons={[{value: 'lunch', label: t('tools.partyPlanner.times.lunch'), icon: 'white-balance-sunny'},
            {value: 'evening', label: t('tools.partyPlanner.times.evening'), icon: 'weather-night'}]} />
        <SliderField label={t('tools.partyPlanner.hours')} value={inputs.hours} min={1} max={12} step={0.5}
          format={(hours) => `${hours} ${t('tools.units.hours')}`} onChange={(hours) => change({hours})} />
      </QuestionSection>

      {inputs.event === 'raclette' &&
        <QuestionSection title={t('tools.partyPlanner.accompaniments')} hint={t('tools.partyPlanner.accompanimentsHint')}>
          <ChoiceChips values={[...ACCOMPANIMENTS]}
            label={(accompaniment) => t(`tools.partyPlanner.accompanimentNames.${accompaniment}`)}
            isChosen={(accompaniment) => inputs.accompaniments.includes(accompaniment)}
            onToggle={(accompaniment) => change({accompaniments: inputs.accompaniments.includes(accompaniment) ?
              inputs.accompaniments.filter((chosen) => chosen !== accompaniment) :
              [...inputs.accompaniments, accompaniment]})} />
        </QuestionSection>}

      <QuestionSection title={t('tools.partyPlanner.menu')} info={t('tools.partyPlanner.menuInfo')}>
        <ChoiceChips values={coursesOf(inputs.event)} label={(course) => t(`tools.partyPlanner.courses.${course}`)}
          isChosen={(course) => inputs.courses.includes(course)}
          onToggle={(course) => change({courses: inputs.courses.includes(course) ?
            inputs.courses.filter((chosen) => chosen !== course) : [...inputs.courses, course]})} />
        {mainStandsAlone(inputs) &&
          <Notice icon="information-outline" tone="information">{t('tools.partyPlanner.mainAlone')}</Notice>}
        <CountStepper label={t('tools.partyPlanner.dishes')} value={String(inputs.dishes)}
          decreaseLabel={t('tools.fewer')} increaseLabel={t('tools.more')} canDecrease={inputs.dishes > 1}
          canIncrease={inputs.dishes < 10} onDecrease={() => change({dishes: inputs.dishes - 1})}
          onIncrease={() => change({dishes: inputs.dishes + 1})} />
        <SwitchRow label={t('tools.partyPlanner.reserve')} explanation={t('tools.partyPlanner.reserveHint')}
          value={inputs.reserve} onChange={(reserve) => change({reserve})} />
      </QuestionSection>

      {(showStarches || showVegetables) &&
        <QuestionSection title={t('tools.partyPlanner.sides')} hint={t('tools.partyPlanner.sidesHint')}
          info={t('tools.partyPlanner.sidesInfo', {potatoes: weight(portion('potatoes')), pasta: weight(portion('pasta')),
            rice: weight(portion('rice')), vegetables: weight(portion('vegetablesToCook')),
            raw: weight(portion('rawVegetables')), leaf: weight(portion('leafSalad'))})}>
          {showStarches &&
            <ChoiceChips values={[...STARCHES]} label={(food) => t(`tools.partyPlanner.items.${food}`)}
              isChosen={(food) => inputs.starches.includes(food)}
              onToggle={(food) => change({starches: toggled(inputs.starches, food)})} />}
          {showVegetables &&
            <ChoiceChips values={[...VEGETABLES]} label={(food) => t(`tools.partyPlanner.items.${food}`)}
              isChosen={(food) => inputs.vegetables.includes(food)}
              onToggle={(food) => change({vegetables: toggled(inputs.vegetables, food)})} />}
        </QuestionSection>}

      <QuestionSection title={t('tools.partyPlanner.alcohol')} hint={t('tools.partyPlanner.alcoholHint')}>
        <SegmentedButtons value={inputs.drinking} onValueChange={(drinking) => change({drinking: drinking as Drinking})}
          buttons={DRINKINGS.map((drinking) => ({value: drinking,
            label: t(`tools.partyPlanner.drinkings.${drinking}`)}))} />
        <SliderField label={t('tools.partyPlanner.beerShare')} value={inputs.beerShare} min={0} max={100} step={5}
          format={percent} onChange={(beerShare) => change({beerShare})} />
        <SliderField label={t('tools.partyPlanner.wineShare')} value={inputs.wineShare} min={0} max={100} step={5}
          format={percent} onChange={(wineShare) => change({wineShare})} />
      </QuestionSection>
    </ToolFrame>
  );
};
