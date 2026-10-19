import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TFunction} from 'i18next';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {KeyboardAvoidingScreen} from '../../components/KeyboardAvoidingScreen';
import {Notice} from '../../components/Notice';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import {ToolId, TOOLS} from '../../tools/registry';
import {PageFrame} from '../../components/PageFrame';
import {BreadTool} from './bread/BreadTool';
import {CoffeeTool} from './coffee/CoffeeTool';
import {OvenTool} from './oven/OvenTool';
import {PartyTool} from './party/PartyTool';
import {PizzaTool} from './pizza/PizzaTool';
import {SeasonalTool} from './seasonal/SeasonalTool';
import {TeaTool} from './tea/TeaTool';
import {ToolsGate} from './ToolsGate';
import {YeastTool} from './yeast/YeastTool';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'ToolScreen'>;

const TOOL_SCREENS: Record<ToolId, React.ComponentType> = {
  pizzaDough: PizzaTool,
  bread: BreadTool,
  yeastConverter: YeastTool,
  ovenConverter: OvenTool,
  partyPlanner: PartyTool,
  seasonalCalendar: SeasonalTool,
  coffee: CoffeeTool,
  tea: TeaTool,
};

const toolOf = (slug: string) => TOOLS.find((tool) => tool.slug === slug);

/**
 * The header title of a tool's screen.
 *
 * @param {TFunction} t the translations
 * @param {string} slug the tool's path segment
 * @return {string} the tool's name, or the overview's title for an unknown one
 */
export const toolTitle = (t: TFunction, slug: string): string => {
  const tool = toolOf(slug);
  return tool ? t(`tools.${tool.id}.name`) : t('tools.title');
};

export const ToolScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  const tool = toolOf(props.route.params.slug);
  const Tool = tool && TOOL_SCREENS[tool.id];
  // Tools sit outside the main stack, so they need the keyboard handling it gives its screens.
  return (
    <KeyboardAvoidingScreen>
      <ToolsGate>
        {Tool ? <Tool /> : (
          <PageFrame>
            <Notice icon="help-circle-outline" tone="information">{t('tools.unknown')}</Notice>
          </PageFrame>
        )}
      </ToolsGate>
    </KeyboardAvoidingScreen>
  );
};
