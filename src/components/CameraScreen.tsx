import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { runOnJS } from 'react-native-reanimated';
import { DetectionOverlay } from './DetectionOverlay';
import { FlowStatusBar } from './StatusBar';
import type { Detection, ModelState } from '../types/detection';

export const CameraScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const insets = useSafeAreaInsets();

  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(60);

  // 1. Load the TFLite Model from your local assets
  // (Make sure the model is actually in your assets folder!)
  const tfPlugin = useTensorflowModel(require('../../assets/flow_mode_vision.tflite'));
  const model = tfPlugin.state === 'loaded' ? tfPlugin.model : undefined;

  const modelState: ModelState = { 
    status: tfPlugin.state === 'error' ? 'error' : tfPlugin.state === 'loaded' ? 'loaded' : 'loading' 
  };

  // 2. Helper to safely update React state from the background C++ thread
  const updateDetections = (newDetections: Detection[]) => {
    setDetections(newDetections);
  };

  // 3. The Edge AI Vision Loop (Runs 60 times a second)
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (model == null) return;

    try {
      // Pass the raw camera frame buffer into the TFLite model
      // WARNING: Read the "Gotcha" section below regarding this step!
      const outputs = model.runSync([frame.toArrayBuffer()]);

      // --- TENSOR PARSING ---
      // This is where you extract the data based on how you trained it.
      // E.g., const rawBoxes = outputs[0]; const rawScores = outputs[1];
      
      const parsedDetections: Detection[] = []; 
      
      // Send the parsed data back to the main UI thread to draw the boxes
      runOnJS(updateDetections)(parsedDetections);
      
    } catch (error) {
      console.error("Inference Error:", error);
    }
  }, [model]);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Requesting Camera Permission...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.text}>Initializing Camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        pixelFormat="yuv" // TFLite models usually prefer 'rgb', see note below
        frameProcessor={frameProcessor}
      />
      
      <DetectionOverlay detections={detections} />
      
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
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: '500' },
});