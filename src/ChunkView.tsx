import React, {useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useAppTheme} from './styles/CentralStyles';

const BATCH_SIZE = 100;

export const ChunkView = ({children}: {children: any}) => {
  const [batchIndex, setBatchIndexRaw] = useState(0);
  const focusedRef = useRef(true);
  const batchIndexRef = useRef(1);
  const reachedEndRef = useRef(false);

  const theme = useAppTheme();

  const placeholderView = () => (
    <View style={{alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: theme.colors.background}}>
      <View>
        <ActivityIndicator size="large"/>
      </View>
    </View>
  );

  let childrenChunk = undefined;
  if (reachedEndRef.current) {
    // Render all
    childrenChunk = children;
  } else if (Array.isArray(children) ) {
    // Render according to current batch
    childrenChunk = children.slice(0, BATCH_SIZE * batchIndex);
  } else if (batchIndex > 0) {
    // Single child
    childrenChunk = children;
  }

  const setBatchIndex = (index: number) => {
    batchIndexRef.current = index;
    setBatchIndexRaw(index);
  };

  const loadNextBatch = (timeout = 800) => {
    InteractionManager?.runAfterInteractions(() => {
      setTimeout(() => {
        if (focusedRef.current) {
          const nextBatchIndex = batchIndexRef.current + 1;
          if (nextBatchIndex * BATCH_SIZE >= children.length || !Array.isArray(children)) {
            reachedEndRef.current = true;
          } else {
            loadNextBatch(1);
          }
          setBatchIndex(nextBatchIndex);
        }
      }, timeout);
    });
    return () => (focusedRef.current = true);
  };

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      loadNextBatch(1);
    });
  }, []);

  return <>
    { !reachedEndRef.current && placeholderView()}
    {childrenChunk}</>;
};
