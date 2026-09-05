import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, StyleSheet, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {QuadCropper} from '../../components/QuadCropper';
import {useImageRect} from '../../components/QuadCropperParts';
import {rectInContainer} from '../../helper/imageFit';
import {
  areasOnPage,
  BlockAnswer,
  BlockBox,
  boxAround,
  cropFromBox,
  DetectedBlocks,
  MarkedArea,
  nextQuestion,
  pageForQuestion,
} from '../../helper/recipeScanBlocks';
import {Crop, ScanPage} from '../../helper/recipeScanCrop';
import CentralStyles, {useAppTheme} from '../../styles/CentralStyles';

interface Props {
  pages: ScanPage[];
  blocks: DetectedBlocks;
  onDone: (answers: BlockAnswer[]) => void;
}

/**
 * The two questions asked once a recipe has been read.
 *
 * @param {Props} props the photographs, what was detected on them, and where to send the answers
 * @return {JSX.Element | null} the question
 */
export const BlockConfirmation = (props: Props) => {
  const {t} = useTranslation('translation');
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const [answers, setAnswers] = useState<BlockAnswer[]>([]);
  const [marked, setMarked] = useState<MarkedArea[]>([]);
  const [marking, setMarking] = useState<Crop | undefined>(undefined);

  const kind = nextQuestion(answers);
  const detected = kind ? props.blocks[kind] : undefined;
  const pageIndex = pageForQuestion(detected);
  const page = props.pages[pageIndex] ?? props.pages[0];

  // The detected areas are fractions of the photograph, so placing them means knowing where the
  // photograph itself is drawn - which for a landscape photo in a portrait layout is neither the
  // full width nor the full height of the space it was given.
  const {imageRect, onLayout} = useImageRect(page?.uri);

  if (!kind || !page) {
    return null;
  }

  const suggested = areasOnPage(detected, pageIndex);

  const answer = (given: BlockAnswer) => {
    const answered = [...answers, given];
    setMarking(undefined);
    setMarked([]);
    setAnswers(answered);
    if (!nextQuestion(answered)) {
      props.onDone(answered);
    }
  };

  const keepArea = (crop: Crop): MarkedArea[] => [...marked, {pageIndex, box: boxAround(crop)}];

  const addAnotherArea = (crop: Crop) => {
    setMarked(keepArea(crop));
    setMarking(undefined);
  };

  const finishMarking = (crop: Crop) => answer({kind, answer: 'marked', areas: keepArea(crop)});

  const renderAreas = (areas: {box: BlockBox}[], dimmed = false) => (
    <>
      {imageRect.width > 0 && areas.map((area, index) => {
        const placed = rectInContainer(area.box, imageRect);
        return (
          <View
            key={`area-${index}`}
            pointerEvents="none"
            style={[styles.area, {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.primary + (dimmed ? '18' : '22'),
              left: placed.left,
              top: placed.top,
              width: placed.width,
              height: placed.height,
            }]} />
        );
      })}
    </>
  );

  const renderQuestion = () => (
    <>
      <View style={styles.photoWrapper} onLayout={onLayout}>
        <Image source={{uri: page.uri}} style={styles.photo} resizeMode="contain" />
        {renderAreas(suggested)}
      </View>
      <View style={[styles.panel, {paddingBottom: insets.bottom + 16}]}>
        <Text variant="labelLarge" style={styles.progress}>
          {t('screens.recipeScan.blocks.progress', {step: answers.length + 1, total: 2})}
        </Text>
        <Text variant="titleMedium" style={styles.question}>
          {suggested.length ?
            t(`screens.recipeScan.blocks.${kind}.question`) :
            t(`screens.recipeScan.blocks.${kind}.notFound`)}
        </Text>
        <View style={styles.answers}>
          {suggested.length > 0 &&
            <Button mode="contained" icon="check"
              onPress={() => answer({kind, answer: 'confirmed'})}>
              {t('screens.recipeScan.blocks.correct')}
            </Button>
          }
          <Button mode="outlined" icon="selection-drag"
            onPress={() => setMarking(cropFromBox(suggested[0]?.box))}>
            {t('screens.recipeScan.blocks.showMe')}
          </Button>
          <Button mode="text" onPress={() => answer({kind, answer: 'absent'})}>
            {t(`screens.recipeScan.blocks.${kind}.none`)}
          </Button>
        </View>
      </View>
    </>
  );

  const renderMarking = (crop: Crop) => (
    <>
      <View style={styles.photoWrapper} onLayout={onLayout}>
        <QuadCropper
          imageUri={page.uri}
          crop={crop}
          onCropChange={setMarking}
          style={CentralStyles.fullscreen} />
        {/* Areas already kept, so it is clear what has been marked so far. */}
        {renderAreas(marked, true)}
      </View>
      <View style={[styles.panel, {paddingBottom: insets.bottom + 16}]}>
        <Text style={styles.question}>
          {marked.length ?
            t('screens.recipeScan.blocks.markedSoFar', {count: marked.length}) :
            t(`screens.recipeScan.blocks.${kind}.markHint`)}
        </Text>
        <View style={styles.answers}>
          <Button mode="contained" icon="check" onPress={() => finishMarking(crop)}>
            {t('screens.recipeScan.blocks.done')}
          </Button>
          <Button mode="outlined" icon="plus" onPress={() => addAnotherArea(crop)}>
            {t('screens.recipeScan.blocks.addAnother')}
          </Button>
          <Button mode="text" onPress={() => {
            setMarking(undefined);
            setMarked([]);
          }}>
            {t('common.cancel')}
          </Button>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      {marking ? renderMarking(marking) : renderQuestion()}
    </View>
  );
};

const styles = StyleSheet.create({
  // flex rather than a percentage height: the app bar is a sibling above this, so a full
  // window height would push the panel below the bottom of the screen.
  screen: {flex: 1},
  // The photograph takes whatever is left once the buttons have had their share, so the whole
  // question fits on screen without scrolling.
  photoWrapper: {flex: 1, overflow: 'hidden'},
  photo: {width: '100%', height: '100%'},
  area: {position: 'absolute', borderWidth: 3, borderRadius: 4},
  panel: {padding: 16, gap: 8},
  progress: {opacity: 0.7},
  question: {marginBottom: 4},
  answers: {gap: 8},
});
