import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { storageService } from '../services/storageService';
import { User } from '../types';
import { useTheme } from '../theme';
import ColorPicker from './ColorPicker';

interface UserFormProps {
  user?: User;
  mode: 'add' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ user, mode }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [selectedColor, setSelectedColor] = useState(user?.color || theme.colors.primary);

  const validateName = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Erreur', "Veuillez entrer un nom pour l'utilisateur.");
      return false;
    }

    if (name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateName()) {
      return;
    }

    try {
      if (mode === 'add') {
        const newUser: User = {
          id: Date.now().toString(),
          name: name.trim(),
          color: selectedColor,
          createdAt: new Date(),
        };

        await storageService.addUser(newUser);
        Alert.alert('Succès', 'Utilisateur ajouté avec succès !', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else if (user) {
        const updatedUser: User = {
          ...user,
          name: name.trim(),
          color: selectedColor,
        };

        await storageService.updateUser(updatedUser);
        Alert.alert('Succès', 'Utilisateur modifié avec succès !', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error(`Error ${mode === 'add' ? 'adding' : 'updating'} user:`, error);
      Alert.alert(
        'Erreur',
        `Échec de ${mode === 'add' ? "l'ajout" : 'la modification'} de l'utilisateur. Veuillez réessayer.`,
      );
    }
  };

  const handleDelete = () => {
    if (!user) return;

    Alert.alert(
      "Supprimer l'Utilisateur",
      `Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action ne peut pas être annulée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteUser(user.id);
              Alert.alert('Succès', 'Utilisateur supprimé avec succès !', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert(
                'Erreur',
                "Échec de la suppression de l'utilisateur. Veuillez réessayer.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informations Utilisateur</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Nom</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Entrez le nom d'utilisateur"
              placeholderTextColor={theme.colors.placeholder}
              maxLength={20}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choisir une Couleur</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Glissez sur la palette pour sélectionner une couleur, puis ajustez
            la teinte avec la barre en dessous
          </Text>

          <ColorPicker color={selectedColor} onColorChange={setSelectedColor} />
        </View>

        <View style={styles.previewSection}>
          {/* <Text style={styles.sectionTitle}>Aperçu</Text> */}
          <View style={[styles.previewCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.previewUserInfo}>
              <View
                style={[
                  styles.previewColorIndicator,
                  { backgroundColor: selectedColor },
                ]}
              />
              <Text style={[styles.previewName, { color: theme.colors.text }]}>
                {name || "Nom d'utilisateur"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { borderWidth: 2, borderColor: theme.colors.textTertiary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.textTertiary }]}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.text }]}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        {mode === 'edit' && (
          <TouchableOpacity style={[styles.deleteButton, { borderColor: theme.colors.error }]} onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { color: theme.colors.error }]}>Supprimer l'Utilisateur</Text>
          </TouchableOpacity>
        )}
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
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  previewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserForm;

