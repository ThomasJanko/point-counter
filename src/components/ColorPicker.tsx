import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { useTheme } from '../theme';
import { FONTS } from '../theme/types';

const TRACK_HEIGHT = 36;
const THUMB_SIZE = 26;

const HUE_MIN = 0;
const HUE_MAX = 360;
const SAT_MIN = 10;
const SAT_MAX = 100;
const LIGHT_MIN = 25;
const LIGHT_MAX = 85;

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

function hexToHsl(hex: string) {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number) {
  const lNorm = l / 100;
  const a = (s * Math.min(lNorm, 1 - lNorm)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const colorValue = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * colorValue)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  renderBackground: (trackWidth: number) => React.ReactNode;
  fillColor?: string;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  renderBackground,
  fillColor,
}) => {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  minRef.current = min;
  maxRef.current = max;

  const updateFromX = useCallback(
    (x: number) => {
      const w = trackWidthRef.current;
      if (w <= 0) return;
      const ratio = Math.max(0, Math.min(1, x / w));
      const next = Math.round(minRef.current + ratio * (maxRef.current - minRef.current));
      onChange(next);
    },
    [onChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => updateFromX(evt.nativeEvent.locationX),
        onPanResponderMove: evt => updateFromX(evt.nativeEvent.locationX),
      }),
    [updateFromX],
  );

  const ratio = (value - min) / (max - min);
  const thumbLeft = Math.max(0, Math.min(trackWidth - THUMB_SIZE, ratio * trackWidth - THUMB_SIZE / 2));

  return (
    <View style={styles.sliderRow}>
      <Text style={[styles.sliderLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
      <View
        style={[
          styles.track,
          { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border },
        ]}
        onLayout={e => {
          trackWidthRef.current = e.nativeEvent.layout.width;
          setTrackWidth(e.nativeEvent.layout.width);
        }}
        {...panResponder.panHandlers}
      >
        {trackWidth > 0 && renderBackground(trackWidth)}
        {fillColor && trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[styles.fill, { width: Math.max(0, ratio * trackWidth), backgroundColor: fillColor }]}
          />
        )}
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[styles.thumb, { left: thumbLeft, borderColor: theme.colors.surface }]}
          />
        )}
      </View>
    </View>
  );
};

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange }) => {
  const initialHsl = useMemo(() => hexToHsl(color || '#6E56FF'), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [hue, setHue] = useState(initialHsl.h);
  const [saturation, setSaturation] = useState(
    Math.max(SAT_MIN, Math.min(SAT_MAX, initialHsl.s)),
  );
  const [lightness, setLightness] = useState(
    Math.max(LIGHT_MIN, Math.min(LIGHT_MAX, initialHsl.l)),
  );

  const currentColor = useMemo(
    () => hslToHex(hue, saturation, lightness),
    [hue, saturation, lightness],
  );

  const lastEmitted = useRef(color);
  React.useEffect(() => {
    if (currentColor !== lastEmitted.current) {
      lastEmitted.current = currentColor;
      onColorChange(currentColor);
    }
  }, [currentColor, onColorChange]);

  const renderHueBackground = useCallback(
    (trackWidth: number) => {
      const segmentCount = 12;
      const segmentWidth = trackWidth / segmentCount;
      const segments = [];
      for (let i = 0; i < segmentCount; i++) {
        const segmentHue = (i / segmentCount) * 360;
        segments.push(
          <View
            key={i}
            pointerEvents="none"
            style={{ width: segmentWidth, height: '100%', backgroundColor: hslToHex(segmentHue, 100, 50) }}
          />,
        );
      }
      return (
        <View pointerEvents="none" style={styles.segmentRow}>
          {segments}
        </View>
      );
    },
    [],
  );

  const renderPlainBackground = useCallback(() => null, []);

  return (
    <View style={styles.container}>
      <View style={styles.sliders}>
        <SliderRow
          label="TEINTE"
          value={hue}
          min={HUE_MIN}
          max={HUE_MAX}
          onChange={setHue}
          renderBackground={renderHueBackground}
        />
        <SliderRow
          label="SATURATION"
          value={saturation}
          min={SAT_MIN}
          max={SAT_MAX}
          onChange={setSaturation}
          renderBackground={renderPlainBackground}
          fillColor={hslToHex(hue, 100, lightness)}
        />
        <SliderRow
          label="LUMINOSITÉ"
          value={lightness}
          min={LIGHT_MIN}
          max={LIGHT_MAX}
          onChange={setLightness}
          renderBackground={renderPlainBackground}
          fillColor={hslToHex(hue, saturation, 50)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sliders: {
    gap: 12,
  },
  sliderRow: {
    gap: 4,
  },
  sliderLabel: {
    fontSize: 10,
    fontFamily: FONTS.titleBold,
    letterSpacing: 0.6,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    top: (TRACK_HEIGHT - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 6,
  },
});

export default ColorPicker;
