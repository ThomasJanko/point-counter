import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PICKER_SIZE = Math.min(SCREEN_WIDTH - 80, 280);
const HUE_BAR_WIDTH = PICKER_SIZE;
const HUE_BAR_HEIGHT = 30;

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onColorChange }) => {
  const [hue, setHue] = useState(270);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // Convert hex to HSL
  const hexToHsl = useCallback((hex: string) => {
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
  }, []);

  // Convert HSL to hex
  const hslToHex = useCallback((h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const colorValue = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * colorValue)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }, []);

  // Initialize from color prop
  React.useEffect(() => {
    if (color) {
      const hsl = hexToHsl(color);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Current color
  const currentColor = useMemo(
    () => hslToHex(hue, saturation, lightness),
    [hue, saturation, lightness, hslToHex],
  );

  React.useEffect(() => {
    if (currentColor !== color) {
      onColorChange(currentColor);
    }
  }, [currentColor, color, onColorChange]);

  // Handle square touch using PanResponder with better coordinate handling
  const squarePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const { locationX, locationY } = evt.nativeEvent;
          const newSaturation = Math.max(
            0,
            Math.min(100, Math.round((locationX / PICKER_SIZE) * 100)),
          );
          const newLightness = Math.max(
            0,
            Math.min(100, Math.round(100 - (locationY / PICKER_SIZE) * 100)),
          );
          setSaturation(newSaturation);
          setLightness(newLightness);
        },
        onPanResponderMove: evt => {
          const { locationX, locationY } = evt.nativeEvent;
          const newSaturation = Math.max(
            0,
            Math.min(100, Math.round((locationX / PICKER_SIZE) * 100)),
          );
          const newLightness = Math.max(
            0,
            Math.min(100, Math.round(100 - (locationY / PICKER_SIZE) * 100)),
          );
          setSaturation(newSaturation);
          setLightness(newLightness);
        },
      }),
    [],
  );

  // Handle hue bar touch
  const huePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const { locationX } = evt.nativeEvent;
          const newHue = Math.max(
            0,
            Math.min(360, Math.round((locationX / HUE_BAR_WIDTH) * 360)),
          );
          setHue(newHue);
        },
        onPanResponderMove: evt => {
          const { locationX } = evt.nativeEvent;
          const newHue = Math.max(
            0,
            Math.min(360, Math.round((locationX / HUE_BAR_WIDTH) * 360)),
          );
          setHue(newHue);
        },
      }),
    [],
  );

  // Render color square with a simpler approach
  const renderColorSquare = () => {
    const indicatorX = (saturation / 100) * PICKER_SIZE;
    const indicatorY = ((100 - lightness) / 100) * PICKER_SIZE;

    // Create a simpler grid (10x10 for better performance)
    const cells = [];
    const cellSize = PICKER_SIZE / 10;

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const cellSaturation = (col / 9) * 100;
        const cellLightness = 100 - (row / 9) * 100;
        const cellColor = hslToHex(hue, cellSaturation, cellLightness);
        cells.push(
          <View
            key={`${row}-${col}`}
            style={[
              {
                position: 'absolute',
                left: col * cellSize,
                top: row * cellSize,
                width: cellSize + 1, // +1 to avoid gaps
                height: cellSize + 1,
                backgroundColor: cellColor,
              },
            ]}
            pointerEvents="none"
          />,
        );
      }
    }

    return (
      <View style={styles.colorSquare} {...squarePanResponder.panHandlers}>
        {cells}
        {/* Indicator */}
        <View
          style={[
            styles.indicator,
            {
              left: Math.max(0, Math.min(PICKER_SIZE - 20, indicatorX - 10)),
              top: Math.max(0, Math.min(PICKER_SIZE - 20, indicatorY - 10)),
            },
          ]}
          pointerEvents="none"
        />
      </View>
    );
  };

  // Render hue bar
  const renderHueBar = () => {
    const hueIndicatorX = (hue / 360) * HUE_BAR_WIDTH;
    const segments = [];
    const segmentWidth = HUE_BAR_WIDTH / 12;

    for (let i = 0; i < 12; i++) {
      const segmentHue = (i / 12) * 360;
      segments.push(
        <View
          key={i}
          style={[
            styles.hueSegment,
            {
              width: segmentWidth,
              backgroundColor: hslToHex(segmentHue, 100, 50),
            },
          ]}
          pointerEvents="none"
        />,
      );
    }

    return (
      <View style={styles.hueBar} {...huePanResponder.panHandlers}>
        <View style={styles.hueGradient}>{segments}</View>
        {/* Hue indicator */}
        <View
          style={[
            styles.hueIndicator,
            {
              left: Math.max(
                0,
                Math.min(HUE_BAR_WIDTH - 16, hueIndicatorX - 8),
              ),
            },
          ]}
          pointerEvents="none"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Saturation/Lightness Square */}
      <View style={styles.squareContainer}>{renderColorSquare()}</View>

      {/* Hue Bar */}
      <View style={styles.hueContainer}>{renderHueBar()}</View>

      {/* Color Preview */}
      {/* <View style={styles.previewContainer}>
        <View
          style={[styles.previewColor, { backgroundColor: currentColor }]}
        />
        <Text style={styles.previewText}>{currentColor.toUpperCase()}</Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  squareContainer: {
    marginBottom: 20,
  },
  colorSquare: {
    width: PICKER_SIZE,
    height: PICKER_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  hueContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  hueBar: {
    width: HUE_BAR_WIDTH,
    height: HUE_BAR_HEIGHT,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
    position: 'relative',
  },
  hueGradient: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  hueSegment: {
    height: '100%',
  },
  hueIndicator: {
    width: 16,
    height: HUE_BAR_HEIGHT + 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'absolute',
    top: -2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    minWidth: 150,
    justifyContent: 'center',
  },
  previewColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  previewText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});

export default ColorPicker;
