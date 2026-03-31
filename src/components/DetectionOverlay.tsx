import React, { memo, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING, FONT, DETECTION_COLORS } from '../constants/theme';
import type { Detection } from '../types/detection';

const { width: SW, height: SH } = Dimensions.get('window');
const CORNER_SIZE = 14;
const CORNER_THICKNESS = 2.5;

interface Props {
  detections: Detection[];
}

export const DetectionOverlay = memo(function DetectionOverlay({ detections }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {detections.map((d, i) => (
        <DetectionBox
          key={d.id}
          detection={d}
          color={DETECTION_COLORS[i % DETECTION_COLORS.length]}
        />
      ))}
    </View>
  );
});

/* ── Individual detection box ── */

function DetectionBox({
  detection,
  color,
}: {
  detection: Detection;
  color: string;
}) {
  const { bbox, label, confidence } = detection;

  const left = useSharedValue(bbox.x * SW);
  const top = useSharedValue(bbox.y * SH);
  const width = useSharedValue(bbox.width * SW);
  const height = useSharedValue(bbox.height * SH);

  useEffect(() => {
    const cfg = { duration: 120 };
    left.value = withTiming(bbox.x * SW, cfg);
    top.value = withTiming(bbox.y * SH, cfg);
    width.value = withTiming(bbox.width * SW, cfg);
    height.value = withTiming(bbox.height * SH, cfg);
  }, [bbox.x, bbox.y, bbox.width, bbox.height]);

  const boxStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: left.value,
    top: top.value,
    width: width.value,
    height: height.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: left.value,
    top: top.value - 30,
  }));

  const pct = `${Math.round(confidence * 100)}%`;

  return (
    <>
      {/* Bounding box with corner accents */}
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        style={[boxStyle]}
      >
        <View style={[styles.boxInner, { borderColor: color }]}>
          {/* 4 corners */}
          <View style={[styles.corner, styles.cTL, { borderColor: color }]} />
          <View style={[styles.corner, styles.cTR, { borderColor: color }]} />
          <View style={[styles.corner, styles.cBL, { borderColor: color }]} />
          <View style={[styles.corner, styles.cBR, { borderColor: color }]} />
        </View>
      </Animated.View>

      {/* Floating label pill */}
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        style={labelStyle}
      >
        <View style={[styles.pill, { backgroundColor: color }]}>
          <Text style={styles.pillLabel} numberOfLines={1}>
            {label}
          </Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>{pct}</Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  boxInner: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    borderStyle: 'solid',
    backgroundColor: 'rgba(0,229,255,0.04)',
  },

  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.cyan,
  },
  cTL: {
    top: -1,
    left: -1,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: RADIUS.sm,
  },
  cTR: {
    top: -1,
    right: -1,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: RADIUS.sm,
  },
  cBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: RADIUS.sm,
  },
  cBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: RADIUS.sm,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    gap: 6,
  },
  pillLabel: {
    color: '#000',
    fontSize: FONT.sizes.small,
    fontWeight: FONT.bold,
    maxWidth: 120,
  },
  pillBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  pillBadgeText: {
    color: '#fff',
    fontSize: FONT.sizes.caption,
    fontWeight: FONT.semibold,
  },
});
