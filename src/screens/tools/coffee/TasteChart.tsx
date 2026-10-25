import {LinearGradient} from 'expo-linear-gradient';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LayoutChangeEvent, StyleSheet, useWindowDimensions, View} from 'react-native';
import {IconButton, Modal, Portal, Text} from 'react-native-paper';
import {InfoButton} from '../../../components/InfoButton';
import {HintText} from '../../../components/QuestionSection';
import {useAppTheme} from '../../../styles/CentralStyles';
import {Taste} from '../../../tools/coffee/coffee';

interface Props {
  taste: Taste;
  /** The brew's own ratio, drawn as the line it moves on. */
  ratio: number;
  /** A brew ratio as shown, such as "1 : 16". */
  ratioLabel: (ratio: number) => string;
  /** Said below the chart, such as how a brew is drunk. */
  note?: string;
}

interface Point {
  x: number;
  y: number;
}

// The extraction axis, in %: a little beyond what brews reach either side of the ideal band, and further where a
// brew lies beyond.
const LEAST_EXTRACTION = 12;
const MOST_EXTRACTION = 28;
// The strength axis runs one and a half bands beyond the band on each side, and half a band beyond a brew outside.
const MARGIN = 1.5;
const BREW_MARGIN = 0.5;
const ROWS = ['strong', 'balanced', 'weak'] as const;
const COLUMNS = ['under', 'ideal', 'over'] as const;
// Too little extracted tastes sour, too much bitter: the plane warms from lemon to roast.
const TINTS = {
  light: {sour: 'rgba(232, 184, 36, 0.22)', bitter: 'rgba(122, 74, 38, 0.24)'},
  dark: {sour: 'rgba(232, 184, 36, 0.16)', bitter: 'rgba(196, 128, 80, 0.24)'},
};

// The same colour see-through, so a gradient fades without passing through grey.
const clear = (rgba: string) => rgba.replace(/[\d.]+\)$/, '0)');

/**
 * The name of a sector of the plane: cold brew tastes flat rather than sour when steeped short, and harsh when long.
 *
 * @param {Taste} taste where the brew lands
 * @param {string} row the sector's strength, by default the brew's
 * @param {string} column the sector's extraction, by default the brew's
 * @return {string} its translation key
 */
export const sectorKey = (taste: Taste, row: Taste['strength'] = taste.strength,
    column: Taste['extracted'] = taste.extracted) =>
  `tools.coffee.taste.${taste.kind === 'coldBrew' ? 'coldBrewSectors' as const : 'sectors' as const}.${row}.${
    column}` as const;

const share = (value: number, low: number, high: number) => (value - low) / (high - low);
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const percent = (value: number) => `${value * 100}%` as const;
// The brew's dot and line: the light green, or on a dark plane the lighter green made for text.
const brewColour = (theme: ReturnType<typeof useAppTheme>) => theme.dark ? theme.colors.primaryText :
  theme.colors.primary;

// A step of 1, 2 or 5 times a power of ten that gives about eight ticks.
const tickStep = (span: number) => {
  const raw = span / 8;
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((factor) => factor * power).find((step) => step >= raw * 0.999)!;
};
const ticksBetween = (low: number, high: number, step: number) => {
  const first = Math.ceil(low / step - 1e-9);
  return Array.from({length: Math.floor(high / step + 1e-9) - first + 1}, (_, index) => (first + index) * step);
};

const Line = ({from, to, color, thickness, dashed}: {from: Point, to: Point, color: string, thickness: number,
  dashed?: boolean}) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return (
    <View pointerEvents="none" style={[styles.line, {width: length, height: thickness,
      left: (from.x + to.x - length) / 2, top: (from.y + to.y - thickness) / 2,
      transform: [{rotate: `${Math.atan2(to.y - from.y, to.x - from.x)}rad`}]},
    // A box as thin as the line with a dashed border all round draws a dashed line on every platform.
    dashed ? {borderWidth: thickness / 2, borderStyle: 'dashed', borderColor: color} : {backgroundColor: color}]} />
  );
};

// Where a brew lands, as on a brewing control chart: extraction across, strength up, the ideal field in the middle,
// a line for each of the method's brew ratios and the brew's own, and the brew as a dot. Its own layout and words.
const Plot = ({taste, ratio, ratioLabel, height}: Props & {height: number}) => {
  const {t, i18n} = useTranslation('translation');
  const theme = useAppTheme();
  const [size, setSize] = useState<{width: number, height: number}>();
  const tints = TINTS[theme.dark ? 'dark' : 'light'];
  const muted = theme.colors.onSurfaceVariant;
  const accent = brewColour(theme);
  const bandWidth = taste.band.high - taste.band.low;
  const low = Math.max(0, Math.min(taste.band.low - MARGIN * bandWidth, taste.tds - BREW_MARGIN * bandWidth));
  const high = Math.max(taste.band.high + MARGIN * bandWidth, taste.tds + BREW_MARGIN * bandWidth);
  const least = Math.min(LEAST_EXTRACTION, Math.floor(taste.extraction) - 1);
  const most = Math.max(MOST_EXTRACTION, Math.ceil(taste.extraction) + 1);
  // Shares of the plane, from the left and from the top.
  const x = (extraction: number) => share(extraction, least, most);
  const y = (tds: number) => 1 - share(tds, low, high);
  const columns = [0, x(taste.extractionBand.low), x(taste.extractionBand.high), 1];
  const middle = (columns[1] + columns[2]) / 2;
  const rows = [0, y(taste.band.high), y(taste.band.low), 1];
  const yStep = tickStep(high - low);
  const yTicks = ticksBetween(low, high, yStep);
  const xTicks = ticksBetween(least, most, (size?.width ?? 0) >= 360 ? 2 : 4);
  const number = (value: number, step: number) => value.toLocaleString(i18n.language,
      {maximumFractionDigits: Math.max(0, -Math.floor(Math.log10(step)))});

  // Where TDS = slope × extraction runs across the plane, in pixels, and whether it leaves at the top.
  const segment = (slope: number) => {
    const from = Math.max(least, low / slope);
    const to = Math.min(most, high / slope);
    if (!size || to - from < 0.1) {
      return undefined;
    }
    const point = (extraction: number) => ({x: x(extraction) * size.width, y: y(slope * extraction) * size.height});
    return {from: point(from), to: point(to), top: high / slope < most};
  };
  const own = segment(taste.tds / taste.extraction);
  const others = taste.lines.filter((line) => Math.abs(line.ratio - ratio) > 0.05)
      .map((line) => ({...line, segment: segment(line.slope)}));

  // Each line named where it leaves the plane, inside it; names on the same edge move apart.
  const names = (() => {
    if (!size) {
      return [];
    }
    const named = [...others.map((line) => ({...line, mine: false})), {ratio, segment: own, mine: true}]
        .flatMap((line) => line.segment ? [{ratio: line.ratio, mine: line.mine, top: line.segment.top,
          left: line.segment.top ? clamp(line.segment.to.x - NAME_WIDTH / 2, 4, size.width - NAME_WIDTH - 4) :
            size.width - NAME_WIDTH - 4,
          offset: line.segment.top ? 4 :
            clamp(line.segment.to.y - NAME_HEIGHT / 2, 4, size.height - NAME_HEIGHT - 4)}] : []);
    const spread = (edge: typeof named, key: 'left' | 'offset', gap: number, start: number, end: number) => {
      edge.sort((a, b) => a[key] - b[key]);
      edge.forEach((name, index) => {
        name[key] = Math.max(name[key], index > 0 ? edge[index - 1][key] + gap : start);
      });
      for (let index = edge.length - 1; index >= 0; index--) {
        edge[index][key] = Math.min(edge[index][key], end - gap * (edge.length - index));
      }
    };
    const onTop = named.filter((name) => name.top);
    const onRight = named.filter((name) => !name.top);
    spread(onTop, 'left', NAME_WIDTH + 4, 4, size.width);
    // A name in the top right corner pushes the right edge's names below it.
    const corner = onTop.some((name) => name.left + 2 * NAME_WIDTH + 8 > size.width);
    spread(onRight, 'offset', NAME_HEIGHT + 4, corner ? NAME_HEIGHT + 8 : 4, size.height);
    return named;
  })();

  const dot = size && {left: clamp(x(taste.extraction), 0, 1) * size.width,
    top: clamp(y(taste.tds), 0, 1) * size.height};
  // The sectors' names keep clear of the line names on the right edge.
  const rightNames = names.some((name) => !name.top);
  const large = (size?.width ?? 0) >= LARGE_WIDTH;

  return (
    <View style={styles.plot}>
      <View style={[styles.yTitle, {height}]}>
        <Text variant="labelSmall" style={[styles.yTitleText, {color: muted, width: height,
          left: (Y_TITLE_WIDTH - height) / 2, top: (height - AXIS_TEXT) / 2}]}>
          {t('tools.coffee.taste.axisStrength')}
        </Text>
      </View>
      <View style={[styles.yTicks, {height}]}>
        {yTicks.map((tick) => (
          <Text key={tick} variant="labelSmall" style={[styles.yTick, {color: muted,
            top: y(tick) * height - AXIS_TEXT / 2}]}>{number(tick, yStep)}</Text>
        ))}
      </View>
      <View style={styles.main}>
        <View accessible accessibilityLabel={t(sectorKey(taste))}
          style={[styles.plane, {height, backgroundColor: theme.colors.surface, borderColor: theme.colors.outline}]}
          onLayout={(event: LayoutChangeEvent) => setSize(event.nativeEvent.layout)}>
          <LinearGradient pointerEvents="none" style={StyleSheet.absoluteFill} start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            colors={[tints.sour, clear(tints.sour), clear(tints.bitter), tints.bitter]}
            locations={[columns[1], middle, middle, columns[2]]} />
          {xTicks.map((tick) => (
            <View key={`x${tick}`} style={[styles.gridColumn, {left: percent(x(tick)),
              backgroundColor: theme.colors.outlineVariant}]} />
          ))}
          {yTicks.map((tick) => (
            <View key={`y${tick}`} style={[styles.gridRow, {top: percent(y(tick)),
              backgroundColor: theme.colors.outlineVariant}]} />
          ))}
          <View style={[styles.ideal, {left: percent(columns[1]), width: percent(columns[2] - columns[1]),
            top: percent(rows[1]), height: percent(rows[2] - rows[1]), borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryContainer}]} />
          {ROWS.map((row, rowIndex) => COLUMNS.map((column, columnIndex) => {
            const ideal = row === 'balanced' && column === 'ideal';
            return (
              <View key={`${row}-${column}`} pointerEvents="none" style={[styles.cell, {
                left: percent(columns[columnIndex]), width: percent(columns[columnIndex + 1] - columns[columnIndex]),
                top: percent(rows[rowIndex]), height: percent(rows[rowIndex + 1] - rows[rowIndex]),
                paddingRight: column === 'over' && rightNames ? NAME_WIDTH + 4 : 4}]}>
                <Text variant="labelSmall" style={[styles.cellLabel, large && styles.cellLabelLarge,
                  ideal ? [styles.idealLabel, {color: theme.colors.onPrimaryContainer}] : {color: muted}]}>
                  {t(sectorKey(taste, row, column))}
                </Text>
              </View>
            );
          }))}
          {others.map(({ratio: other, segment}) => segment &&
            <Line key={other} from={segment.from} to={segment.to} color={theme.colors.outline} thickness={1.5}
              dashed />)}
          {own && <Line from={own.from} to={own.to} color={accent} thickness={2.5} />}
          {names.map((name) => (
            <View key={name.ratio} pointerEvents="none" style={[styles.name, {left: name.left, top: name.offset,
              backgroundColor: name.mine ? theme.colors.primary : theme.colors.surface,
              borderColor: name.mine ? theme.colors.primary : theme.colors.outlineVariant}]}>
              <Text variant="labelSmall" numberOfLines={1} style={[styles.nameText,
                {color: name.mine ? theme.colors.onPrimary : muted}]}>{ratioLabel(name.ratio)}</Text>
            </View>
          ))}
          {dot && <>
            <View pointerEvents="none" style={[styles.halo, {backgroundColor: accent,
              left: dot.left - HALO / 2, top: dot.top - HALO / 2}]} />
            <View pointerEvents="none" style={[styles.dot, {backgroundColor: accent,
              borderColor: theme.colors.surface, left: dot.left - DOT / 2, top: dot.top - DOT / 2}]} />
          </>}
        </View>
        <View style={styles.xTicks}>
          {xTicks.map((tick) => (
            <Text key={tick} variant="labelSmall" style={[styles.xTick, {color: muted,
              left: percent(x(tick))}]}>{number(tick, 1)}</Text>
          ))}
        </View>
        <Text variant="labelSmall" style={[styles.xTitle, {color: muted}]}>
          {t('tools.coffee.taste.axisExtraction')}
        </Text>
      </View>
    </View>
  );
};

const Legend = () => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const muted = {color: theme.colors.onSurfaceVariant};
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, {backgroundColor: brewColour(theme)}]} />
        <Text variant="labelSmall" style={muted}>{t('tools.coffee.taste.legendBrew')}</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendLine, {backgroundColor: brewColour(theme)}]} />
        <Text variant="labelSmall" style={muted}>{t('tools.coffee.taste.legendRatio')}</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendLine, styles.legendDashed, {borderColor: theme.colors.outline}]} />
        <Text variant="labelSmall" style={muted}>{t('tools.coffee.taste.legendOthers')}</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendBox, {backgroundColor: theme.colors.primaryContainer,
          borderColor: theme.colors.primary}]} />
        <Text variant="labelSmall" style={muted}>{t('tools.coffee.taste.legendBalanced')}</Text>
      </View>
    </View>
  );
};

export const TasteChart = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const screen = useWindowDimensions();
  const [enlarged, setEnlarged] = useState(false);
  const title = t('tools.coffee.taste.chartTitle');
  const header = (action: React.ReactNode) => (
    <View style={styles.header}>
      <Text variant="titleSmall" style={styles.title}>{title}</Text>
      <InfoButton title={title} text={t('tools.coffee.taste.legend')} />
      {action}
    </View>
  );
  return (
    <View style={styles.container}>
      {header(<IconButton icon="fullscreen" size={22} style={styles.action}
        accessibilityLabel={t('tools.coffee.taste.enlarge')} onPress={() => setEnlarged(true)} />)}
      <Plot {...props} height={PLANE_HEIGHT} />
      <Legend />
      {props.note && <HintText>{props.note}</HintText>}
      <Portal>
        <Modal visible={enlarged} onDismiss={() => setEnlarged(false)} contentContainerStyle={[styles.modal,
          {width: Math.min(screen.width - 24, MODAL_WIDTH), backgroundColor: theme.colors.surface}]}>
          {header(<IconButton icon="close" size={22} style={styles.action} accessibilityLabel={t('common.close')}
            onPress={() => setEnlarged(false)} />)}
          <Plot {...props} height={clamp(screen.height - MODAL_CHROME, PLANE_HEIGHT, MODAL_PLANE_HEIGHT)} />
          <Legend />
          {props.note && <HintText>{props.note}</HintText>}
        </Modal>
      </Portal>
    </View>
  );
};

const PLANE_HEIGHT = 240;
const MODAL_PLANE_HEIGHT = 640;
// The modal's header, axes, legend and margins.
const MODAL_CHROME = 230;
const MODAL_WIDTH = 960;
const DOT = 14;
const HALO = 30;
const AXIS_TEXT = 14;
const Y_TITLE_WIDTH = 18;
const NAME_WIDTH = 50;
// From this plane width on, as when enlarged on a large screen, the sectors' names grow.
const LARGE_WIDTH = 600;
const NAME_HEIGHT = 18;

const styles = StyleSheet.create({
  container: {gap: 4, marginTop: 8},
  header: {flexDirection: 'row', alignItems: 'center', gap: 2},
  title: {flexShrink: 1},
  action: {marginLeft: 'auto', marginVertical: 0},
  plot: {flexDirection: 'row'},
  yTitle: {width: Y_TITLE_WIDTH},
  yTitleText: {position: 'absolute', height: AXIS_TEXT, lineHeight: AXIS_TEXT, textAlign: 'center',
    transform: [{rotate: '-90deg'}]},
  yTicks: {width: 30, marginRight: 4},
  yTick: {position: 'absolute', right: 0, height: AXIS_TEXT, lineHeight: AXIS_TEXT, fontSize: 10},
  main: {flex: 1},
  plane: {borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden'},
  gridColumn: {position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, opacity: 0.6},
  gridRow: {position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, opacity: 0.6},
  ideal: {position: 'absolute', borderWidth: 1.5, borderRadius: 4, opacity: 0.9},
  cell: {position: 'absolute', alignItems: 'center', justifyContent: 'center', padding: 4},
  cellLabel: {fontSize: 10, lineHeight: 12, textAlign: 'center'},
  cellLabelLarge: {fontSize: 12, lineHeight: 15},
  // Wider than its narrow field, so its words do not break.
  idealLabel: {fontWeight: '700', alignSelf: 'stretch', marginHorizontal: -12},
  line: {position: 'absolute', opacity: 0.85},
  name: {position: 'absolute', width: NAME_WIDTH, height: NAME_HEIGHT, borderRadius: NAME_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center'},
  nameText: {fontSize: 10, lineHeight: 12},
  halo: {position: 'absolute', width: HALO, height: HALO, borderRadius: HALO / 2, opacity: 0.22},
  dot: {position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2},
  xTicks: {height: 16, marginTop: 2},
  xTick: {position: 'absolute', width: 30, marginLeft: -15, textAlign: 'center', fontSize: 10},
  xTitle: {textAlign: 'center'},
  legend: {flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4, marginTop: 4},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 10, height: 10, borderRadius: 5},
  legendLine: {width: 18, height: 2.5},
  legendDashed: {height: 2, borderWidth: 1, borderStyle: 'dashed'},
  legendBox: {width: 14, height: 10, borderWidth: 1, borderRadius: 2},
  modal: {alignSelf: 'center', padding: 16, borderRadius: 16, gap: 4},
});
