import 'react-native-reanimated';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  useFrameProcessor 
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Worklets } from 'react-native-worklets-core';

// UI Components
import { DetectionOverlay } from './DetectionOverlay';
import { FlowStatusBar } from './StatusBar';
import type { Detection } from '../types/detection';
import { useFlowVisionModel } from '../hooks/useFlowVisionModel';
import { FOOD_LABELS } from '../constants/labels';

const THREE_CLASS_LABELS = ['Pineapple', 'Pomegranate', 'Dosa'] as const;

export const CameraScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const insets = useSafeAreaInsets();
  const { resize } = useResizePlugin();

  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(60);

  // 1. Load the TFLite Model via shared hook
  const { model, modelState } = useFlowVisionModel();

  // Stable UI Update function for the Worklet thread
  const updateUI = useCallback((newDetections: Detection[]) => {
    setDetections(newDetections);
  }, []);

  // Use Worklets-specific bridge for maximum stability on Android
  const updateUIOnJS = Worklets.createRunOnJS(updateUI);

  // 2. The Vision Loop (Frame Processor)
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // Safety check for model availability
    if (model == null || typeof model.runSync !== 'function') return;

    try {
      
      // STEP A: Resize to 224x224 RGB tensor
      const resized = resize(frame, {
        scale: { width: 224, height: 224 },
        pixelFormat: 'rgb',
        dataType: 'float32',
      });

      // STEP B: Run Inference
      const outputs = model.runSync([resized]);
      const probabilities = outputs[0] as Float32Array;

      if (!probabilities || probabilities.length === 0) {
        updateUIOnJS([]);
        return;
      }

      // STEP C: Find the Max Probability
      let maxIdx = 0;
      let maxProb = 0;
      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i];
          maxIdx = i;
        }
      }

      // Label Mapping
      const activeLabels = probabilities.length === 3 ? THREE_CLASS_LABELS : FOOD_LABELS;
      const safeIdx = Math.min(maxIdx, activeLabels.length - 1);
      const topLabel = activeLabels[safeIdx] ?? `Class ${maxIdx}`;

      /** * DSP LOGIC: High-Confidence Gate
       * We set this to 0.85 (85%) so the app remains quiet 
       * until a real Papaya or Dosa is clearly in view.
       */
      const CONFIDENCE_THRESHOLD = 0.50;

      if (maxProb > CONFIDENCE_THRESHOLD) {
        updateUIOnJS([
          {
            id: 'food-item',
            label: topLabel,
            confidence: maxProb,
            bbox: { x: 0.15, y: 0.25, width: 0.7, height: 0.5 } // Center focus box
          }
        ]);
      } else {
        // Clear detections if confidence is too low (Filter out the noise)
        updateUIOnJS([]);
      }
      
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Vision Processing Error';
      console.log("Worklet Error:", msg);
    }
  }, [model]);

  // Handle Permissions
  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera Permission Required</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="rgb" 
        frameProcessor={frameProcessor}
      />
      
      {/* Visual Bounding Box for the User */}
      <DetectionOverlay detections={detections} />
      
      {/* Information Header/Footer */}
      <FlowStatusBar 
        modelState={modelState}
        detections={detections}
        fps={fps}
        insetTop={insets.top}
        insetBottom={insets.bottom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  center: { 
    flex: 1, 
    backgroundColor: '#0A0A0F', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  text: { 
    color: '#fff', 
    fontSize: 16 
  },
});