import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {SectionTitle} from '../../components/SectionTitle';
import {BaseNavigatorProps} from '../../navigation/NavigationRoutes';
import {TOOL_CATEGORIES, toolsOf} from '../../tools/registry';
import {SettingsEntry} from '../settings/SettingsEntry';
import {PageFrame} from '../../components/PageFrame';
import {ToolsGate} from './ToolsGate';

type Props = NativeStackScreenProps<BaseNavigatorProps, 'ToolsOverviewScreen'>;

export const ToolsOverviewScreen = (props: Props) => {
  const {t} = useTranslation('translation');
  return (
    <ToolsGate>
      <PageFrame>
        {TOOL_CATEGORIES.map((category) => (
          <React.Fragment key={category}>
            <SectionTitle>{t(`tools.categories.${category}`)}</SectionTitle>
            {toolsOf(category).map((tool) => (
              <SettingsEntry
                key={tool.id}
                title={t(`tools.${tool.id}.name`)}
                subtitle={t(`tools.${tool.id}.summary`)}
                icon={tool.icon}
                onPress={() => props.navigation.navigate('ToolScreen', {slug: tool.slug})} />
            ))}
          </React.Fragment>
        ))}
      </PageFrame>
    </ToolsGate>
  );
};
