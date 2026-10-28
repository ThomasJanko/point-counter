import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User } from '../types';
import { useTheme } from '../theme';
import { FONTS, PLAYER_COLOR_PALETTE } from '../theme/types';
import ColorPicker from './ColorPicker';

interface UserFormProps {
  user?: User;
  mode: 'add' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ user, mode }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name || '');
  const [selectedColor, setSelectedColor] = useState(
    user?.color || PLAYER_COLOR_PALETTE[0],
  );

  // For a new player, default to the next color in the fixed, cycled
  // palette rather than a repeat of the last-used color.
  useEffect(() => {
    if (mode === 'add') {
      storageService.getUsers().then(existingUsers => {
        setSelectedColor(
          PLAYER_COLOR_PALETTE[existingUsers.length % PLAYER_COLOR_PALETTE.length],
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateName = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Erreur', "Veuillez entrer un nom pour le joueur.");
      return false;
    }
    if (name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateName()) return;

    try {
      if (mode === 'add') {
        const newUser: User = {
          id: Date.now().toString(),
          name: name.trim(),
          color: selectedColor,
          createdAt: new Date(),
        };
        await storageService.addUser(newUser);
        navigation.goBack();
      } else if (user) {
        const updatedUser: User = {
          ...user,
          name: name.trim(),
          color: selectedColor,
        };
        await storageService.updateUser(updatedUser);
        navigation.goBack();
      }
    } catch (error) {
      console.error(`Error ${mode === 'add' ? 'adding' : 'updating'} user:`, error);
      Alert.alert(
        'Erreur',
        `Échec de ${mode === 'add' ? "l'ajout" : 'la modification'} du joueur. Veuillez réessayer.`,
      );
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Fermer"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Bottom drawer: flush against the screen edges (no side/bottom
            margin), only the top corners rounded, always-visible action
            row pinned outside the scrollable content so it's never cut
            off regardless of scroll position or content height. */}
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.borderDark }]} />

          <View style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
              {mode === 'add' ? 'Nouveau joueur' : 'Modifier le joueur'}
            </Text>

            <View style={styles.previewRow}>
              <View style={[styles.previewCircle, { backgroundColor: selectedColor }]} />
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Nom du joueur"
                placeholderTextColor={theme.colors.placeholder}
                maxLength={20}
              />
            </View>

            <ColorPicker color={selectedColor} onColorChange={setSelectedColor} />
          </View>

          <View
            style={[
              styles.buttonRow,
              {
                borderTopColor: theme.colors.borderLight,
                paddingBottom: Math.max(16, insets.bottom + 8),
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.outlinedButton, { borderColor: theme.colors.border }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.outlinedButtonText, { color: theme.colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.filledButtonText, { color: theme.colors.onPrimary }]}>
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 2,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 15,
    fontFamily: FONTS.titleExtraBold,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  previewCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  nameInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FONTS.titleBold,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outlinedButton: {
    borderWidth: 1,
  },
  outlinedButtonText: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
  filledButtonText: {
    fontSize: 13,
    fontFamily: FONTS.titleBold,
  },
});

export default UserForm;
