import { useMemo } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import type { ModelState } from '../types/detection';

const MODEL_ASSET = require('../../assets/flow_mode_vision.tflite');

/**
 * Loads the flow_mode_vision.tflite model from the local bundle.
 * Returns the model instance (when ready) and the current loading state.
 */
export function useFlowVisionModel() {
  const plugin = useTensorflowModel(MODEL_ASSET);

  const model = plugin.state === 'loaded' ? plugin.model : undefined;

  const modelState: ModelState = useMemo(() => {
    if (plugin.state === 'loaded') return { status: 'loaded' as const };
    if (plugin.state === 'error') {
      return {
        status: 'error' as const,
        error: (plugin as any).error?.message ?? 'Failed to load TFLite model',
      };
    }
    return { status: 'loading' as const };
  }, [plugin.state]);

  return { model, modelState } as const;
}
