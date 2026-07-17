import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme';
import { ACCENT_COLORS, FONTS } from '../theme/types';
import ScreenHeader from '../components/ScreenHeader';

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { theme, mode, setMode, primaryColor, setPrimaryColor } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title="Paramètres" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>APPARENCE</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  borderColor: mode === 'light' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: mode === 'light' ? theme.colors.primaryBackground : theme.colors.surface,
                },
              ]}
              onPress={() => setMode('light')}
            >
              <Text style={[styles.modeButtonText, { color: theme.colors.text }]}>☀ Clair</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  borderColor: mode === 'dark' ? theme.colors.primary : theme.colors.border,
                  backgroundColor: mode === 'dark' ? theme.colors.primaryBackground : theme.colors.surface,
                },
              ]}
              onPress={() => setMode('dark')}
            >
              <Text style={[styles.modeButtonText, { color: theme.colors.text }]}>☾ Sombre</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>COULEUR D'ACCENT</Text>
          <View style={styles.accentRow}>
            {ACCENT_COLORS.map(accent => {
              const isActive = accent.value.toLowerCase() === primaryColor.toLowerCase();
              return (
                <TouchableOpacity
                  key={accent.key}
                  onPress={() => setPrimaryColor(accent.value)}
                  style={[
                    styles.accentSwatch,
                    { backgroundColor: accent.value, borderColor: isActive ? accent.value : 'transparent' },
                  ]}
                  accessibilityLabel={`Couleur d'accent ${accent.label}`}
                >
                  {isActive && <Text style={styles.accentCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textTertiary }]}>INFORMATIONS</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Tablée · v0.0.1</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 22,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.titleBold,
    letterSpacing: 0.6,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  accentRow: {
    flexDirection: 'row',
    gap: 14,
  },
  accentSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.titleExtraBold,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
  },
});

export default SettingsScreen;
