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
import ColorPicker from '../components/ColorPicker';

const AddUserScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', "Veuillez entrer un nom pour l'utilisateur.");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères.');
      return;
    }

    try {
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
    } catch (error) {
      Alert.alert(
        'Erreur',
        "Échec de l'ajout de l'utilisateur. Veuillez réessayer.",
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Utilisateur</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Entrez le nom d'utilisateur"
              placeholderTextColor="#666"
              maxLength={20}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir une Couleur</Text>
          <Text style={styles.sectionSubtitle}>
            Glissez sur la palette pour sélectionner une couleur, puis ajustez
            la teinte avec la barre en dessous
          </Text>

          <ColorPicker color={selectedColor} onColorChange={setSelectedColor} />
        </View>

        <View style={styles.previewSection}>
          {/* <Text style={styles.sectionTitle}>Aperçu</Text> */}
          <View style={styles.previewCard}>
            <View style={styles.previewUserInfo}>
              <View
                style={[
                  styles.previewColorIndicator,
                  { backgroundColor: selectedColor },
                ]}
              />
              <Text style={styles.previewName}>
                {name || "Nom d'utilisateur"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
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
    color: '#ffffff',
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
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddUserScreen;
