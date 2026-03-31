import React, { memo, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, FONT } from '../constants/theme';
import type { Detection, ModelState } from '../types/detection';

interface Props {
  modelState: ModelState;
  detections: Detection[];
  fps: number;
  insetTop: number;
  insetBottom: number;
}

export const FlowStatusBar = memo(function FlowStatusBar({
  modelState,
  detections,
  fps,
  insetTop,
  insetBottom,
}: Props) {
  const best = detections.length > 0
    ? detections.reduce((a, b) => (b.confidence > a.confidence ? b : a))
    : null;

  const statusLabel =
    modelState.status === 'loaded'
      ? `Edge AI Active · ${fps} fps`
      : modelState.status === 'loading'
        ? 'Loading Model…'
        : 'Model Error';

  return (
    <>
      {/* ── Top status badge ── */}
      <Animated.View
        entering={FadeIn.delay(400).duration(500)}
        style={[styles.topBadge, { top: insetTop + SPACING.sm }]}
      >
        <PulseDot status={modelState.status} />
        <Text style={styles.topText}>{statusLabel}</Text>
      </Animated.View>

      {/* ── Bottom detection panel ── */}
      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        style={[styles.bottomPanel, { paddingBottom: insetBottom + SPACING.md }]}
      >
        <View style={styles.bottomInner}>
          {best ? (
            <>
              <Text style={styles.detLabel}>{best.label}</Text>
              <View style={styles.detRow}>
                <ConfidenceBar confidence={best.confidence} />
                <Text style={styles.detConf}>
                  {Math.round(best.confidence * 100)}%
                </Text>
              </View>
              <Text style={styles.detCount}>
                {detections.length} item{detections.length !== 1 ? 's' : ''}{' '}
                detected
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.scanLabel}>Scanning…</Text>
              <Text style={styles.scanHint}>
                Point camera at food items
              </Text>
            </>
          )}
        </View>
      </Animated.View>
    </>
  );
});

/* ── Animated pulsing status dot ── */

function PulseDot({ status }: { status: ModelState['status'] }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (status === 'loaded') {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [status]);

  const color =
    status === 'loaded'
      ? COLORS.success
      : status === 'loading'
        ? COLORS.warning
        : COLORS.error;

  const dotAnim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, dotAnim]} />;
}

/* ── Confidence bar ── */

function ConfidenceBar({ confidence }: { confidence: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(confidence * 100, { duration: 300 });
  }, [confidence]);

  const color =
    confidence > 0.8
      ? COLORS.success
      : confidence > 0.55
        ? COLORS.warning
        : COLORS.error;

  const barAnim = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, barAnim]} />
    </View>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  /* Top badge */
  topBadge: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.small,
    fontWeight: FONT.medium,
  },

  /* Bottom panel */
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(10,10,15,0.75)',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  bottomInner: {
    gap: 6,
  },

  detLabel: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.title,
    fontWeight: FONT.bold,
  },
  detRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detConf: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.body,
    fontWeight: FONT.semibold,
    minWidth: 42,
  },
  detCount: {
    color: COLORS.textTertiary,
    fontSize: FONT.sizes.small,
    marginTop: 2,
  },

  scanLabel: {
    color: COLORS.cyan,
    fontSize: FONT.sizes.title,
    fontWeight: FONT.semibold,
  },
  scanHint: {
    color: COLORS.textTertiary,
    fontSize: FONT.sizes.body,
  },

  /* Confidence bar */
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.glass,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
