import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageManipulator} from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, {useEffect, useReducer, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Card, IconButton, Surface, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppPersistence from '../../AppPersistence';
import {QuadCropper} from '../../components/QuadCropper';
import RestAPI, {RecipeScanJob} from '../../dao/RestAPI';
import {SnackbarUtil} from '../../helper/GlobalSnackbar';
import {PromptUtil} from '../../helper/Prompt';
import {holdDraft} from '../../helper/recipeDraftHandover';
import {BlockAnswer, buildCorrections, hasCorrections} from '../../helper/recipeScanBlocks';
import {buildScanPayload, Crop, cropFromDetection} from '../../helper/recipeScanCrop';
import {
  failureFromError,
  hasWaitedLongEnough,
  jobsAhead,
  nextPollDelay,
  outcomeOf,
  progressMessageKey,
  ScanFailure,
} from '../../helper/recipeScanJob';
import {editedPage, noPages, scanPagesReducer} from '../../helper/recipeScanPages';
import {rotationDegrees, Turn} from '../../helper/recipeScanRotation';
import {MainNavigationProps} from '../../navigation/NavigationRoutes';
import {BlockConfirmation} from './BlockConfirmation';

type Props = NativeStackScreenProps<MainNavigationProps, 'RecipeScanScreen'>;

/** How many photographs may make up one recipe. Mirrors the server's own limit. */
const MAX_PAGES = 6;

/** Which of the three things this screen is doing. */
type Step = 'pages' | 'scanning' | 'confirming';

/**
 * Reading a recipe from photographs.
 *
 * @param {Props} props the navigation props for this screen
 * @return {JSX.Element} the screen
 */
export const RecipeScanScreen = (props: Props) => {
  const {t, i18n} = useTranslation('translation');
  const insets = useSafeAreaInsets();

  const [{pages, editing}, dispatch] = useReducer(scanPagesReducer, noPages);
  const [job, setJob] = useState<RecipeScanJob | undefined>(undefined);
  const [step, setStep] = useState<Step>('pages');
  const [failure, setFailure] = useState<ScanFailure | undefined>(undefined);
  // Rewriting the file takes a moment on a large photograph, and turning it twice at once
  // would race two rewrites of the same page against each other.
  const [turning, setTurning] = useState(false);

  const watching = useRef(true);
  // The scan the server is still working on, so leaving gives its place in the queue back
  // instead of spending somebody's daily allowance on a recipe nobody is waiting for.
  const runningJobId = useRef<string | undefined>(undefined);

  const abandonScan = () => {
    const abandoned = runningJobId.current;
    runningJobId.current = undefined;
    if (abandoned) {
      RestAPI.cancelRecipeScanJob(abandoned).catch(() => undefined);
    }
  };

  // Cleared on unmount so a scan that finishes after the screen is gone does not set state on
  // it, and does not keep asking the server about a job nobody is waiting for any more.
  useEffect(() => () => {
    watching.current = false;
    abandonScan();
  }, []);

  useEffect(() => {
    props.navigation.setOptions({
      title: `${t('screens.recipeScan.screenTitle')} (${t('common.experimental')})`,
    });
  }, [props.navigation, t]);

  const page = editedPage({pages, editing});

  const addPage = async (fromCamera: boolean) => {
    const permission = fromCamera ?
      await ImagePicker.requestCameraPermissionsAsync() :
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      SnackbarUtil.show({message: t('screens.recipeScan.permissionRefused')});
      return;
    }

    const result = fromCamera ?
      await ImagePicker.launchCameraAsync({quality: 0.8}) :
      await ImagePicker.launchImageLibraryAsync({quality: 0.8});
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const uri = result.assets[0].uri;
    dispatch({type: 'added', uri});
    findThePage(uri);
  };

  // Asks the server where the page is, and moves that page's crop onto it.
  const findThePage = async (uri: string) => {
    try {
      const detection = await RestAPI.detectPageEdges(uri);
      if (watching.current && detection.detected) {
        dispatch({type: 'detected', uri, crop: cropFromDetection(detection)});
      }
    } catch {
      // The crop still works by hand, which is all this was saving.
    }
  };

  const turnPage = async (turn: Turn) => {
    if (!page || turning) {
      return;
    }
    // Named rather than indexed, because the file is rewritten while somebody could be
    // selecting or reordering the pages.
    const uri = page.uri;
    setTurning(true);
    try {
      const context = ImageManipulator.manipulate(uri);
      context.rotate(rotationDegrees(turn));
      const rendered = await context.renderAsync();
      const turned = await rendered.saveAsync({compress: 0.9});
      dispatch({type: 'turned', uri, turnedUri: turned.uri, turn});
    } catch {
      SnackbarUtil.show({message: t('screens.recipeScan.rotationFailed')});
    } finally {
      setTurning(false);
    }
  };

  // Asks, once, whether the photographs may be kept.
  const askAboutKeepingPhotos = async (): Promise<boolean> => {
    const stored = await AppPersistence.getScanTrainingConsent();
    if (stored !== undefined) {
      return stored;
    }
    const answer = await new Promise<boolean>((decided) => {
      PromptUtil.show({
        title: t('screens.recipeScan.consent.title'),
        message: t('screens.recipeScan.consent.message'),
        button1: t('screens.recipeScan.consent.no'),
        button1Callback: () => decided(false),
        button2: t('screens.recipeScan.consent.yes'),
        button2Callback: () => decided(true),
      });
    });
    await AppPersistence.setScanTrainingConsent(answer);
    return answer;
  };

  const giveUp = (reason: ScanFailure) => {
    runningJobId.current = undefined;
    setFailure(reason);
    setStep('pages');
  };

  const startScan = async () => {
    const consent = await askAboutKeepingPhotos();
    setStep('scanning');
    setFailure(undefined);
    setJob(undefined);
    try {
      const payload = buildScanPayload(pages, i18n.language);
      const started = await RestAPI.scanRecipe(
          pages.map((entry) => entry.uri), payload, consent);
      runningJobId.current = started.id;
      setJob(started);
      watch(started);
    } catch (error: any) {
      giveUp(failureFromError(error?.response?.data?.error));
    }
  };

  // Asks after the scan until it is done.
  const watch = (started: RecipeScanJob) => {
    const startedAt = Date.now();
    let attempt = 0;

    const ask = async () => {
      if (!watching.current) {
        return;
      }
      if (hasWaitedLongEnough(Date.now() - startedAt)) {
        abandonScan();
        giveUp({messageKey: 'screens.recipeScan.errors.timedOut', retryable: true});
        return;
      }

      try {
        const current = await RestAPI.getRecipeScanJob(started.id);
        if (!watching.current) {
          return;
        }
        setJob(current);

        const outcome = outcomeOf(current);
        if (outcome.then === 'keepWaiting') {
          attempt += 1;
          setTimeout(ask, nextPollDelay(attempt));
          return;
        }
        runningJobId.current = undefined;
        if (outcome.then === 'giveUp') {
          giveUp(outcome.failure);
        } else {
          setStep('confirming');
        }
      } catch (error: any) {
        if (watching.current) {
          giveUp(failureFromError(error?.response?.data?.error));
        }
      }
    };

    setTimeout(ask, nextPollDelay(0));
  };

  const openInWizard = (finished: RecipeScanJob) => {
    if (!finished.recipe) {
      return;
    }
    // Handed over rather than saved: nothing reaches the cookbook until somebody presses save.
    holdDraft(finished.recipe);
    props.navigation.replace('RecipeWizardScreen', {hasDraft: true});
  };

  // Applies the answers to the block questions, then opens the wizard.
  const applyCorrections = async (answers: BlockAnswer[]) => {
    if (!job) {
      return;
    }
    if (!hasCorrections(answers)) {
      openInWizard(job);
      return;
    }

    setStep('scanning');
    try {
      const corrected = await RestAPI.refineRecipeScan(job.id, buildCorrections(answers));
      openInWizard(corrected.recipe ? corrected : job);
    } catch {
      // The reading itself succeeded; a failed correction should not throw that away.
      SnackbarUtil.show({message: t('screens.recipeScan.correctionFailed')});
      openInWizard(job);
    }
  };

  const renderPages = () => (
    <View style={styles.screen}>
      {page ?
        <QuadCropper
          imageUri={page.uri}
          crop={page.crop}
          onCropChange={(crop: Crop) => dispatch({type: 'cropped', crop})}
          style={styles.cropper} /> :
        <View style={styles.empty}>
          <Text style={styles.hint}>{t('screens.recipeScan.introduction')}</Text>
        </View>
      }

      <View style={[styles.panel, {paddingBottom: insets.bottom + 16}]}>
        {page &&
          <>
            <Text style={styles.hint}>{t('screens.recipeScan.cropHint')}</Text>
            <View style={styles.turns}>
              <IconButton icon="rotate-left" mode="contained-tonal" disabled={turning}
                accessibilityLabel={t('screens.recipeScan.rotateLeft')}
                onPress={() => turnPage('left')} />
              <IconButton icon="rotate-right" mode="contained-tonal" disabled={turning}
                accessibilityLabel={t('screens.recipeScan.rotateRight')}
                onPress={() => turnPage('right')} />
            </View>
            {renderPageStrip()}
          </>
        }

        <View style={styles.actions}>
          <Button icon="camera" mode="contained-tonal"
            disabled={pages.length >= MAX_PAGES} onPress={() => addPage(true)}>
            {t('screens.recipeScan.takePhoto')}
          </Button>
          <Button icon="image-multiple" mode="contained-tonal"
            disabled={pages.length >= MAX_PAGES} onPress={() => addPage(false)}>
            {t('screens.recipeScan.choosePhoto')}
          </Button>
        </View>

        {pages.length >= MAX_PAGES &&
          <Text style={styles.hint}>{t('screens.recipeScan.pageLimit', {count: MAX_PAGES})}</Text>}

        {renderFailure()}

        <Button mode="contained" icon="text-recognition"
          disabled={pages.length === 0} onPress={startScan}>
          {t('screens.recipeScan.startScan')}
        </Button>
      </View>
    </View>
  );

  const renderPageStrip = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
      {pages.map((entry, index) => (
        <View key={entry.uri} style={styles.thumbnailWrapper}>
          <IconButton
            icon={index === editing ? 'image-edit' : 'image'}
            selected={index === editing}
            onPress={() => dispatch({type: 'selected', index})} />
          <Image source={{uri: entry.uri}} style={styles.thumbnail} />
          <Text variant="labelSmall">{t('screens.recipeScan.page', {number: index + 1})}</Text>
          <View style={styles.thumbnailActions}>
            <IconButton icon="arrow-left" size={16} disabled={index === 0}
              onPress={() => dispatch({type: 'moved', from: index, to: index - 1})} />
            <IconButton icon="delete-outline" size={16}
              onPress={() => dispatch({type: 'removed', index})} />
            <IconButton icon="arrow-right" size={16} disabled={index === pages.length - 1}
              onPress={() => dispatch({type: 'moved', from: index, to: index + 1})} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderScanning = () => {
    const ahead = jobsAhead(job?.status ?? 'QUEUED', job?.queuePosition);
    return (
      <View style={styles.waiting}>
        <ActivityIndicator size="large" />
        <Text variant="titleMedium" style={styles.waitingTitle}>
          {t(progressMessageKey(job?.status ?? 'QUEUED'))}
        </Text>
        {ahead !== undefined &&
          <Text style={styles.hint}>
            {t('screens.recipeScan.queuedBehind', {count: ahead})}
          </Text>
        }
        <Text style={styles.hint}>{t('screens.recipeScan.takesAMoment')}</Text>
      </View>
    );
  };

  // On the page it sends people back to, rather than in a snackbar: the reasons run to a
  // sentence or two, and several of them are asking for a different photograph.
  const renderFailure = () => failure && (
    <Card style={styles.status}>
      <Card.Content>
        <Text variant="titleSmall">{t('screens.recipeScan.failed')}</Text>
        <Text>{t(failure.messageKey)}</Text>
        {failure.retryable &&
          <Button onPress={startScan}>{t('screens.recipeScan.tryAgain')}</Button>}
      </Card.Content>
    </Card>
  );

  return (
    <Surface style={styles.screen}>
      {step === 'pages' && renderPages()}
      {step === 'scanning' && renderScanning()}
      {step === 'confirming' && job &&
        <BlockConfirmation
          pages={pages}
          blocks={job.blocks ?? {}}
          onDone={applyCorrections} />
      }
    </Surface>
  );
};

const styles = StyleSheet.create({
  // flex rather than a percentage height: the app bar is a sibling above this, so a full
  // window height would push the panel below the bottom of the screen.
  screen: {flex: 1},
  cropper: {flex: 1},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  panel: {padding: 16, gap: 8},
  hint: {textAlign: 'center', opacity: 0.75},
  strip: {flexGrow: 0},
  turns: {flexDirection: 'row', justifyContent: 'center'},
  thumbnailWrapper: {alignItems: 'center', marginRight: 12},
  thumbnail: {width: 56, height: 72, borderRadius: 4},
  thumbnailActions: {flexDirection: 'row'},
  actions: {flexDirection: 'row', justifyContent: 'space-evenly', gap: 8, flexWrap: 'wrap'},
  status: {marginVertical: 4},
  waiting: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24},
  waitingTitle: {marginTop: 8},
});
