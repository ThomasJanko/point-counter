import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../theme';
import ColorPicker from '../components/ColorPicker';

const SettingsScreen = () => {
  const { theme, mode, setMode, toggleMode, primaryColor, setPrimaryColor } =
    useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Apparence
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Mode Sombre
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {mode === 'dark'
                  ? 'Interface en mode sombre activé'
                  : 'Interface en mode clair activé'}
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.text}
            />
          </View>

          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor:
                    mode === 'light' ? theme.colors.primary : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setMode('light')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      mode === 'light'
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    fontWeight: mode === 'light' ? '600' : '400',
                  },
                ]}
              >
                ☀️ Clair
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor:
                    mode === 'dark' ? theme.colors.primary : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setMode('dark')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color:
                      mode === 'dark'
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    fontWeight: mode === 'dark' ? '600' : '400',
                  },
                ]}
              >
                🌙 Sombre
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Couleur Principale
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Couleur du Thème
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Choisissez la couleur principale de l'application
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.colorPreviewButton,
                {
                  backgroundColor: primaryColor,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowColorPicker(!showColorPicker)}
            >
              <View
                style={[styles.colorPreview, { backgroundColor: primaryColor }]}
              />
            </TouchableOpacity>
          </View>

          {showColorPicker && (
            <View
              style={[
                styles.colorPickerContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <ColorPicker
                color={primaryColor}
                onColorChange={setPrimaryColor}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informations
          </Text>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
            >
              Version: 0.0.1
            </Text>
            <Text
              style={[styles.infoText, { color: theme.colors.textSecondary }]}
            >
              Compteur de Points
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  colorPreviewButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  colorPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  colorPickerContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default SettingsScreen;
